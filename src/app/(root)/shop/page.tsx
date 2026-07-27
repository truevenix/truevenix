"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUpDown, ChevronLeft, ChevronRight, Filter, Package, Search, X } from "lucide-react"
import { motion } from "framer-motion"
import ProductCard from "@/components/products/ProductCard"
import { useProducts } from "@/hooks/use-store-api"
import { toCardProduct } from "@/lib/products"

type SortBy = "createdAt" | "price" | "name"
type SortOrder = "asc" | "desc"

const categories = [
  { id: "", label: "All categories" },
  { id: "gadgets", label: "Gadgets" },
  { id: "solar", label: "Solar" },
  { id: "electronics", label: "Electronics" },
  { id: "phones", label: "Phones" },
  { id: "computers", label: "Computers" },
]

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="h-44 bg-gray-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-gray-100" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-10 rounded-xl bg-gray-100" />
      </div>
    </div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const brandParam = searchParams.get("brand") ?? ""
  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "")
  const [inStock, setInStock] = useState<string>("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sort, setSort] = useState<`${SortBy}_${SortOrder}`>("createdAt_desc")
  const [page, setPage] = useState(1)
  const [mobileFilters, setMobileFilters] = useState(false)

  const [sortBy, sortOrder] = sort.split("_") as [SortBy, SortOrder]

  const filters = useMemo(
    () => ({
      q: brandParam ? brandParam : q.trim(),
      category: category || undefined,
      inStock: inStock === "" ? undefined : inStock === "true",
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      sortOrder,
      page,
      limit: 20,
    }),
    [brandParam, q, category, inStock, minPrice, maxPrice, sortBy, sortOrder, page]
  )

  const productsQuery = useProducts(filters)
  const products = (productsQuery.data?.products ?? []).map(toCardProduct)
  const pagination = productsQuery.data?.pagination ?? { page: 1, pages: 1, total: 0, limit: 20 }

  const resetFilters = () => {
    setQ("")
    setCategory("")
    setInStock("")
    setMinPrice("")
    setMaxPrice("")
    setSort("createdAt_desc")
    setPage(1)
  }

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Filters</p>
        <button className="text-xs font-bold text-[var(--theme-primary)]" onClick={resetFilters}>
          Clear
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-black text-gray-700">Category</p>
        <div className="space-y-1">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCategory(item.id)
                setPage(1)
                setMobileFilters(false)
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold"
              style={{
                background: category === item.id ? "var(--theme-primary)" : "transparent",
                color: category === item.id ? "white" : "#4b5563",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-black text-gray-700">Availability</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "All", value: "" },
            { label: "In stock", value: "true" },
            { label: "Out", value: "false" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setInStock(item.value)
                setPage(1)
              }}
              className="rounded-xl border px-2 py-2 text-xs font-bold"
              style={{
                borderColor: inStock === item.value ? "var(--theme-primary)" : "#e5e7eb",
                color: inStock === item.value ? "var(--theme-primary)" : "#6b7280",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-black text-gray-700">Price range</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value)
              setPage(1)
            }}
            type="number"
            min="0"
            placeholder="Min"
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
          />
          <input
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value)
              setPage(1)
            }}
            type="number"
            min="0"
            placeholder="Max"
            className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[var(--theme-primary)]"
          />
        </div>
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-primary)]">truevenix store</p>
          {brandParam ? (
            <>
              <h1 className="mt-2 text-3xl font-black text-gray-900 md:text-5xl">
                {brandParam} products
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Browsing all {brandParam} products available on Truevenix.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-2 text-3xl font-black text-gray-900 md:text-5xl">
                Browse electronics and power gear
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                Search phones, solar products, accessories, computers, and everyday tech essentials.
              </p>
            </>
          )}
          <form
            className="mx-auto mt-6 flex max-w-2xl items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
            }}
          >
            <Search size={18} className="text-gray-400" />
            <input
              value={brandParam || q}
              onChange={(event) => !brandParam && setQ(event.target.value)}
              placeholder="Search products, brands, categories..."
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
              readOnly={!!brandParam}
            />
            {q && !brandParam ? (
              <button type="button" onClick={() => setQ("")} className="text-gray-400">
                <X size={16} />
              </button>
            ) : null}
            {brandParam ? (
              <a
                href="/shop"
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                Clear
              </a>
            ) : (
              <button className="rounded-xl bg-[var(--theme-primary)] px-4 py-2 text-xs font-black text-white">
                Search
              </button>
            )}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex gap-8">
          <aside className="hidden w-60 flex-shrink-0 lg:block">
            <div className="sticky top-28 rounded-2xl bg-white p-5 shadow-sm">{filterPanel}</div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setMobileFilters(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 lg:hidden"
                >
                  <Filter size={15} />
                  Filters
                </button>
                <span className="text-sm font-semibold text-gray-500">
                  {pagination.total} product{pagination.total === 1 ? "" : "s"}
                </span>
              </div>

              <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-500 shadow-sm">
                <ArrowUpDown size={14} />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as `${SortBy}_${SortOrder}`)}
                  className="bg-transparent outline-none"
                >
                  <option value="createdAt_desc">Newest first</option>
                  <option value="price_asc">Price low to high</option>
                  <option value="price_desc">Price high to low</option>
                  <option value="name_asc">Name A-Z</option>
                  <option value="name_desc">Name Z-A</option>
                </select>
              </label>
            </div>

            {productsQuery.isPending ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 15 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
                <Package size={34} className="text-gray-300" />
                <p className="mt-4 font-black text-gray-900">No products found</p>
                <p className="mt-1 text-sm text-gray-500">Try another search or remove a filter.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-[var(--theme-primary)] px-5 py-2 text-sm font-bold text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} delay={index * 0.02} />
                  ))}
                </div>

                {pagination.pages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <span className="text-sm font-bold text-gray-500">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={page >= pagination.pages}
                      onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {mobileFilters ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileFilters(false)}
            aria-label="Close filters"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            className="relative h-full w-80 max-w-[88vw] overflow-y-auto bg-white p-5 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="font-black text-gray-900">Filters</p>
              <button onClick={() => setMobileFilters(false)} className="rounded-full bg-gray-100 p-2">
                <X size={16} />
              </button>
            </div>
            {filterPanel}
          </motion.aside>
        </div>
      ) : null}
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 p-8 text-sm font-semibold text-gray-500">
          Loading shop...
        </main>
      }
    >
      <ShopContent />
    </Suspense>
  )
}