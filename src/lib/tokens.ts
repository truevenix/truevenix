import crypto from "crypto"
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { randomUUID } from "crypto"
import { db } from '@/lib/db'
import { getTwoFactorTokenByEmail, getTwoFactorTokenByToken } from "@/data/two-factor-token";

export const generateTwoFactorToken = async (email: string) => {
   const token = crypto.randomInt(100000, 1000000).toString();
   // TODO: change to 15 minutes
   const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

   const existingToken = await getTwoFactorTokenByToken(email);

   if (existingToken) {
    await db.twoFactorToken.delete({
     where: {
      id: existingToken.id,
     }
    })
   }
     const twoFactorToken = await db.twoFactorToken.create({
       data: {
        email, token, expires
       }
     });
  return twoFactorToken;
}

export const generatePasswordResetToken = async (email: string) => {
  const token =   `${randomUUID()}`.replace(/-/g, '');
  const expires = new Date(new Date().getTime() + 3600 * 1000 );
 
  const existingToken = await getPasswordResetTokenByEmail(email);
 
  if (existingToken) {
    await db.passwordResetToken.delete({
     where: {
         id: existingToken.id
     },
    });
  }
  const passwordResetToken = await db.passwordResetToken.create({
     data: {
         email, token, expires
     }
  });
  return passwordResetToken;
 }

export const generateVerificationToken = async (email: string) => {
 const token =   `${randomUUID()}`.replace(/-/g, '');
 const expires = new Date(new Date().getTime() + 3600 * 1000 );
 const existingToken = await getVerificationTokenByEmail(email);

 if (existingToken) {
   await db.verificationToken.delete({
    where: {
        id: existingToken.id
    },
   });
 }
 const verificationToken = await db.verificationToken.create({
    data: {
        email, token, expires
    }
 });
 return verificationToken;
}

// Add below the existing generateTwoFactorToken / generatePasswordResetToken / generateVerificationToken

export const generateMobileVerificationCode = async (email: string) => {
  const token   = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 min

  const existing = await db.verificationToken.findFirst({ where: { email } });
  if (existing) {
    await db.verificationToken.delete({ where: { id: existing.id } });
  }

  return db.verificationToken.create({ data: { email, token, expires } });
};

export const generateMobilePasswordResetCode = async (email: string) => {
  const token   = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  const existing = await db.passwordResetToken.findFirst({ where: { email } });
  if (existing) {
    await db.passwordResetToken.delete({ where: { id: existing.id } });
  }

  return db.passwordResetToken.create({ data: { email, token, expires } });
};