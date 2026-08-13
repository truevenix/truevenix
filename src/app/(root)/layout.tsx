import type { ReactNode } from "react"
import BottomNavbar from "@/components/layout/BottomNav"

import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import { db } from "@/lib/db"
import { InstallmentSection } from "@/components/installment-section"

async function getSubcategories(): Promise<Record<string, string[]>> {
  try {
    const rows = await db.product.findMany({
      where: { subCategory: { not: null } },
      select: { category: true, subCategory: true },
      distinct: ["category", "subCategory"],
      orderBy: [{ category: "asc" }, { subCategory: "asc" }],
    })

    const grouped: Record<string, string[]> = {}
    for (const row of rows) {
      if (!row.subCategory) continue
      const key = row.category as string
      if (!grouped[key]) grouped[key] = []
      if (!grouped[key].includes(row.subCategory)) {
        grouped[key].push(row.subCategory)
      }
    }
    return grouped
  } catch {
    return {}
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
   const subcategories = await getSubcategories()
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
     
      <BottomNavbar />
      
        <main className="flex-1">
        {children}
      </main>
      <InstallmentSection />
      <Footer />

    </div>
  )
}



