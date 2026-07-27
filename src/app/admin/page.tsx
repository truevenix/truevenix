import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import AdminDashboardClient from "@/components/admin/Admindashboardclient"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [products, orders, users] = await Promise.all([
    db.product.findMany({
      include: {
        images: true,
        sizeOptions: { select: { id: true, label: true, name: true, price: true, isDefault: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      select: {
        id: true,
        referenceId: true,
        customerEmail: true,
        customerName: true,
        userId: true,
        amount: true,
        status: true,
        deliveryStatus: true,
        createDate: true,
      },
      orderBy: { createDate: "desc" },
      take: 80,
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  ])

  const formattedProducts = products.map((product) => {
    const ratingCount = product.reviews.length
    const avgRating =
      ratingCount > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount
        : 0

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      brand: product.brand,
      category: product.category,
      subCategory: product.subCategory,
      inStock: product.inStock,
      stockCount: product.stockCount,
      badge: product.badge,
      isFeatured: product.isFeatured,
      warranty: product.warranty,
      specifications: product.specifications,
      keyFeatures: Array.isArray(product.keyFeatures)
  ? (product.keyFeatures as string[])
  : null,
      images: product.images,
      avgRating,
      reviewCount: ratingCount,
      sizeOptions: product.sizeOptions,
    }
  })

  console.log("Admin dashboard data:", {
    products: formattedProducts,
    orders,
    users,
  })

  const stats = {
    totalProducts: products.length,
    inStockProducts: products.filter((product) => product.inStock).length,
    featuredProducts: products.filter((product) => product.isFeatured).length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.amount, 0),
    totalUsers: users.length,
  }

  return (
    <AdminDashboardClient
      data={{
        products: formattedProducts,
        orders: orders.map((order) => ({
          ...order,
          deliveryStatus: order.deliveryStatus,
          createDate: order.createDate.toISOString(),
        })),
        users: users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        stats,
      }}
    />
  )
}
