import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Account | truevenix",
  description: "Sign in or create a truevenix account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4 py-10">
        {children}
      </div>
    </SessionProvider> 
  );
}
