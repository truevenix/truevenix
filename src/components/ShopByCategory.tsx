import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import CategoryPill from "@/components/categories/CategoryPill"
import SectionHeader from "@/components/SectionHeader"

const DIVISION_LABELS: Record<string, string> = {
  GADGETS: "Gadgets",
  SOLAR: "Solar & Energy",
  ELECTRONICS: "Electronics",
  PHONES: "Phones",
  COMPUTERS: "Computers",
  MACHINERY: "Machinery",
}

async function getGroupedSubcategories() {
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
}

export default async function ShopByCategory() {
  const grouped = await getGroupedSubcategories()
  const divisions = Object.keys(grouped).filter((k) => grouped[k].length > 0)

  if (divisions.length === 0) return null

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* header */}
      <SectionHeader
  title={
    <>
      Popular
      <br />
      Categories
    </>
  }
  subtitle="Explore all our product categories and find what you need"
/>

        {/* divisions with their subcategory pills */}
        <div className="space-y-8">
          {divisions.map((divKey) => {
            const divLabel = DIVISION_LABELS[divKey] ?? divKey
            const subcats = grouped[divKey]

            return (
              <div key={divKey}>
                {/* division label */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                   
                    <Link
                      href={`/category#${divKey.toLowerCase()}`}
                      className="text-sm font-black uppercase tracking-wider text-gray-700 hover:underline"
                    >
                      {divLabel}
                    </Link>
                  </div>
                  <Link
                    href={`/category#${divKey.toLowerCase()}`}
                    className="text-xs font-bold flex items-center gap-1 text-gray-500 hover:gap-2 transition-all"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    See all
                    <ArrowRight size={11} />
                  </Link>
                </div>

                {/* subcategory pills */}
                <div className="flex flex-wrap gap-2">
                  {subcats.map((sub) => (
                    <CategoryPill
                      key={sub}
                      href={`/category/${encodeURIComponent(sub)}`}
                      label={sub}
                      primary="var(--theme-primary)"
                      textColor="var(--theme-text)"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* bottom CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Can&apos;t find what you&apos;re looking for? Browse everything we carry.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/category"
              className="px-5 py-2.5 rounded-xl text-sm font-black border border-gray-200 text-gray-900 transition-colors hover:bg-gray-100"
            >
              All categories
            </Link>
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-primary)" }}
            >
              Browse all products
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}