import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import PromoCodesClient from "@/components/admin/PromoCodesClient"

export default async function AdminPromoCodesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin/promo-codes")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const promoCodes = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <PromoCodesClient
      initialPromoCodes={promoCodes.map((promo) => ({
        ...promo,
        expiresAt: promo.expiresAt ? promo.expiresAt.toISOString() : null,
        createdAt: promo.createdAt.toISOString(),
        updatedAt: promo.updatedAt.toISOString(),
      }))}
    />
  )
}
