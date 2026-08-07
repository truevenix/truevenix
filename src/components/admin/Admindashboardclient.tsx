"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BarChart3, Boxes, Pencil, Plus, Search, ShoppingCart, Ticket, Trash2, Truck, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ItemFormModal, { type AdminProduct } from "@/components/admin/Itemformmodal"
import UpdateOrderModal, { type UpdateOrderModalOrder } from "@/components/admin/UpdateOrderModal"
import { ActionMenu } from "@/components/ui/action-menu"
import { deliveryStatusConfig } from "@/lib/delivery-status"
import {
  CATEGORY_SLIDES,
  PRODUCT_CATEGORY_OPTIONS,
  fromApiCategory,
  type ProductCategoryId,
  type truevenixCategoryId,
} from "@/components/admin/product-categories"
import { cn } from "@/lib/utils"

type AdminOrder = {
  id: string
  referenceId: string
  customerEmail: string
  customerName: string | null
  userId: string | null
  amount: number
  status: string
  deliveryStatus: string
  paymentMethod: string | null
  createDate: string
}

type AdminUser = {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: string
}

type AdminData = {
  products: AdminProduct[]
  orders: AdminOrder[]
  users: AdminUser[]
  stats: {
    totalProducts: number
    inStockProducts: number
    featuredProducts: number
    totalOrders: number
    totalRevenue: number
    totalUsers: number
  }
}

type Tab = "overview" | "products" | "orders" | "users"

const TABS: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Boxes },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
]

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value)
}

function statLabel(value: number) {
  return new Intl.NumberFormat("en-NG").format(value)
}

function buildKnownSubCategories(products: AdminProduct[]) {
  const base: Record<ProductCategoryId, string[]> = {
    gadgets: [],
    solar: [],
    electronics: [],
    phones: [],
    computers: [],
  }

  for (const product of products) {
    const subCategory = product.subCategory?.trim()
    if (!subCategory) continue
    const category = fromApiCategory(product.category)
    if (!base[category].includes(subCategory)) base[category].push(subCategory)
  }

  return base
}

export default function AdminDashboardClient({ data }: { data: AdminData }) {
  const [products, setProducts] = useState(data.products)
  const [orders, setOrders] = useState(data.orders)
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [categoryFilter, setCategoryFilter] = useState<truevenixCategoryId>("all")
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<{ item?: AdminProduct; category?: ProductCategoryId } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingOrder, setUpdatingOrder] = useState<AdminOrder | null>(null)

  const knownSubCategories = useMemo(() => buildKnownSubCategories(products), [products])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" || fromApiCategory(product.category) === categoryFilter
      const haystack = [
        product.name,
        product.brand,
        product.category,
        product.subCategory,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesCategory && (!query || haystack.includes(query))
    })
  }, [products, categoryFilter, search])

  const liveStats = useMemo(
    () => ({
      totalProducts: products.length,
      inStockProducts: products.filter((product) => product.inStock).length,
      featuredProducts: products.filter((product) => product.isFeatured).length,
      totalOrders: data.stats.totalOrders,
      totalRevenue: data.stats.totalRevenue,
      totalUsers: data.stats.totalUsers,
    }),
    [data.stats.totalOrders, data.stats.totalRevenue, data.stats.totalUsers, products]
  )

  const handleSuccess = (product: AdminProduct, mode: "create" | "update") => {
    setProducts((current) =>
      mode === "create"
        ? [product, ...current]
        : current.map((existing) => (existing.id === product.id ? product : existing))
    )
    setModal(null)
  }

  const handleOrderUpdated = (
    updated: { id: string; deliveryStatus: string },
    _push: { sent: number; failed: number } | null
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === updated.id ? { ...order, deliveryStatus: updated.deliveryStatus } : order
      )
    )
    setUpdatingOrder(null)
  }

  const deleteProduct = async (product: AdminProduct) => {
    if (!confirm(`Delete ${product.name}?`)) return

    setDeletingId(product.id)
    try {
      const response = await fetch(`/api/v1/products/${product.id}`, { method: "DELETE" })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || "Unable to delete product.")
      setProducts((current) => current.filter((item) => item.id !== product.id))
      toast.success("Product deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">truevenix admin</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">Product control room</h1>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/admin/promo-codes">
                  <Ticket size={16} />
                  Promo codes
                </Link>
              </Button>
              <Button onClick={() => setModal({ category: "gadgets" })} className="gap-2">
                <Plus size={16} />
                Add Product
              </Button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition",
                    active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "overview" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Products", value: statLabel(liveStats.totalProducts), icon: Boxes },
              { label: "In stock", value: statLabel(liveStats.inStockProducts), icon: Boxes },
              { label: "Featured", value: statLabel(liveStats.featuredProducts), icon: BarChart3 },
              { label: "Orders", value: statLabel(liveStats.totalOrders), icon: ShoppingCart },
              { label: "Revenue", value: formatPrice(liveStats.totalRevenue), icon: BarChart3 },
              { label: "Users", value: statLabel(liveStats.totalUsers), icon: Users },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon size={20} className="text-slate-400" />
                  <p className="mt-4 text-2xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                </div>
              )
            })}
          </div>
        ) : null}

        {activeTab === "products" ? (
          <div className="grid gap-5">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, brands, and sub-categories" className="pl-9" />
                </div>
                <Button onClick={() => setModal({ category: categoryFilter === "all" ? "gadgets" : categoryFilter })} className="gap-2">
                  <Plus size={16} />
                  Add Product
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {CATEGORY_SLIDES.map((category) => {
                  const Icon = category.icon
                  const active = categoryFilter === category.id
                  const count =
                    category.id === "all"
                      ? products.length
                      : products.filter((product) => fromApiCategory(product.category) === category.id).length

                  return (
                    <button
                      key={category.id}
                      onClick={() => setCategoryFilter(category.id)}
                      className="flex min-w-[112px] items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left transition"
                      style={{
                        background: active ? category.color : category.light,
                        borderColor: active ? category.color : `${category.color}44`,
                        color: active ? "white" : category.color,
                      }}
                    >
                      <Icon size={16} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-black">{category.labels.name}</span>
                        <span className="block text-[10px] font-bold opacity-70">{count} items</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm font-semibold text-slate-400">
                No products found.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const category = PRODUCT_CATEGORY_OPTIONS.find((option) => option.id === fromApiCategory(product.category))!
                  const ProductIcon = category.icon
                  return (
                    <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="relative flex h-44 items-center justify-center" style={{ background: category.light }}>
                        {product.images[0]?.image ? (
                          <img src={product.images[0].image} alt={product.name} className="h-full w-full object-contain p-4" />
                        ) : (
                          <ProductIcon size={38} style={{ color: category.color }} />
                        )}
                        {!product.inStock ? (
                          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white">Out of stock</span>
                        ) : null}
                      </div>
                      <div className="grid gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-black text-slate-900">{product.name}</p>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {category.labels.name}{product.subCategory ? ` / ${product.subCategory}` : ""}
                            </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-end gap-1">
                            <button
                              onClick={() => setModal({ item: product })}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                              aria-label="Edit product"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product)}
                              disabled={deletingId === product.id}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                              aria-label="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-lg font-black" style={{ color: category.color }}>{formatPrice(product.price)}</p>
                            {product.originalPrice ? <p className="text-xs font-bold text-slate-300 line-through">{formatPrice(product.originalPrice)}</p> : null}
                          </div>
                          <p className="text-xs font-bold text-slate-400">{product.stockCount} in stock</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}

        {activeTab === "orders" ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Delivery</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const delivery = deliveryStatusConfig(order.deliveryStatus)
                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.referenceId}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-700">{order.customerName ?? "Guest"}</p>
                        <p className="text-xs text-slate-400">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 font-black text-slate-900">{formatPrice(order.amount)}</td>
                      <td className="px-4 py-3 text-xs font-black text-slate-500">
                        {order.status}
                        {order.paymentMethod === "installment" && (
                          <span className="ml-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-600">
                            Installment
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-black"
                          style={{ color: delivery.color, backgroundColor: delivery.bg }}
                        >
                          {delivery.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(order.createDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          items={[
                            {
                              label: "Update order",
                              icon: Truck,
                              onSelect: () => setUpdatingOrder(order),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === "users" ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-bold text-slate-700">{user.name ?? "No name"}</td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3 text-xs font-black text-slate-500">{user.role}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-4 right-4 z-30">
        <Link href="/" className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-lg ring-1 ring-slate-200 hover:text-slate-900">
          Back to store
        </Link>
      </div>

      {modal ? (
        <ItemFormModal
          item={modal.item}
          initialCategory={modal.category}
          knownSubCategories={knownSubCategories}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      ) : null}

      {updatingOrder ? (
        <UpdateOrderModal
          order={updatingOrder as UpdateOrderModalOrder}
          onClose={() => setUpdatingOrder(null)}
          onSuccess={handleOrderUpdated}
        />
      ) : null}
    </main>
  )
}
