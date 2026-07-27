// lib/verifyMobileToken.ts
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET!)

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch {
    return null
  }
}