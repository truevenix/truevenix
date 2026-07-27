import { auth } from "@/auth"
import WishlistClient from "@/components/WishlistClient"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Wishlist | Truevenix",
  description: "Products you have saved to your wishlist on Truevenix.",
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <WishlistClient />
}