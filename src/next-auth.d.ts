import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession} from "next-auth";
import "next-auth/jwt";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  username: string | null;
  surname: string | null;
  phonenumber: string | null;
  image: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isChatEnabled: boolean;
  isOAuth: boolean;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
    expiresIn?: number | null;
  }
}

