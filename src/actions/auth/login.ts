"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const Login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist!" };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    try {
      await sendVerificationEmail(verificationToken.email, verificationToken.token);
      return { success: "Verification email sent" };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { error: "Failed to send verification email" };
    }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) return { error: "Invalid code!" };
      if (twoFactorToken.token !== code) return { error: "Invalid code!" };

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) return { error: "Code expired!" };

      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({ where: { id: existingConfirmation.id } });
      }
      await db.twoFactorConfirmation.create({ data: { userId: existingUser.id } });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      try {
        await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
        return { twoFactor: true };
      } catch (error) {
        console.error("Error sending two factor code:", error);
        return { error: "Failed to send two factor verification code" };
      }
    }
  }

  try {
    // redirect: false prevents NextAuth from throwing NEXT_REDIRECT internally,
    // which was being caught as a CallbackRouteError (AuthError) and returning
    // "Something went wrong!" instead of actually redirecting.
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
     // Revalidate authenticated pages
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/profile");
    // Manually redirect on successful login
    redirect(callbackUrl || DEFAULT_LOGIN_REDIRECT);

    

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return ;
      }
    }
    // If it's a redirect error, that means login was successful
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      return { success: "Login successful" };
    }

    throw error;
  }

  // Revalidate authenticated pages
revalidatePath("/cart");
revalidatePath("/profile");
revalidatePath("/");

  // Runs only on successful sign-in. redirect() throws NEXT_REDIRECT
  // which Next.js handles natively — it is NOT caught above.
  redirect(callbackUrl || DEFAULT_LOGIN_REDIRECT);
};