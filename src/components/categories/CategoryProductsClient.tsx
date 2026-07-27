"use client"

import { motion } from "framer-motion"
import ProductCard, { type CardProduct } from "@/components/products/ProductCard"

type Props = {
  products: CardProduct[]
  category: string
}

export default function CategoryProductsClient({ products }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          delay={idx * 0.03}
        />
      ))}
    </motion.div>
  )
}