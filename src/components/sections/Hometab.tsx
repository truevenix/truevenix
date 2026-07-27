"use client"
// components/sections/HomeTabs.tsx

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"
import ProductCard, { type CardProduct } from "@/components/products/ProductCard"
import { ArrowRight,Package,Zap,Cpu,Smartphone,Headphones, Monitor, LayoutGrid, Wrench,} from "lucide-react"
import Link from "next/link"
import {
  useTheme,
  CATEGORY_THEMES,
  type CategoryId,
  type ProductCategoryId,
} from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────
// CAROUSEL CONFIG
//
// Carousel is a FOLLOWER — it only reacts to tab clicks.
// Slide index must match CATEGORY_ORDER index exactly.
// ─────────────────────────────────────────────

const CATEGORY_ORDER: CategoryId[] = [
  "all",
  "gadgets",
  "phones",
  "computers",
   "electronics",
  "solar",
   "machinery",
]

// Replace with your real banner images (1440×400px recommended).
const HERO_SLIDES: { id: CategoryId; image: string; alt: string }[] = [
  { id: "all",         image: "/slide.jpg",       alt: "truevenix Electronics Store"  },
  { id: "gadgets",     image: "/slide2.jpg",     alt: "Gadgets"  },
 { id: "phones",      image: "/phone.jpg",      alt: "Latest Smartphones"       },
  { id: "computers",   image: "/computer.jpg",   alt: "Laptops & Computers"      },
   { id: "electronics", image: "/elect.jpg", alt: "Smart Electronics"        },
  { id: "solar",       image: "/solar.jpg",       alt: "Solar Panels & Inverters" },
  { id: "machinery",   image: "/machine.jpg", alt: "Industrial Machinery"        },
  
]

// ─────────────────────────────────────────────
// TABS CONFIG
// ─────────────────────────────────────────────

const TABS: { id: CategoryId; label: string; icon: typeof Zap }[] = [
  { id: "all",         label: "All",         icon: LayoutGrid  },
  { id: "gadgets",     label: "Gadgets",     icon: Package     },
  { id: "phones",      label: "Phones",      icon: Smartphone  },
  { id: "computers",   label: "Computers",   icon: Monitor     },
   { id: "electronics", label: "Electronics", icon: Cpu         },
  { id: "solar",       label: "Solar & Energy",       icon: Zap         }, 
   { id: "machinery",   label: "Machinery",      icon: Wrench      },   
]

// ─────────────────────────────────────────────
// SUB-CATEGORY FILTER
// ─────────────────────────────────────────────

function CategoryFilter({
  categories,
  active,
  onChange,
  accentColor,
  layoutId,
}: {
  categories: string[]
  active: string
  onChange: (c: string) => void
  accentColor: string
  layoutId: string
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 px-0.5">
      {["All", ...categories].map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              relative flex-shrink-0 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-semibold
              transition-all duration-200 whitespace-nowrap
              ${isActive ? "text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"}
            `}
            style={isActive ? { background: accentColor } : {}}
          >
            {cat}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 0 3px ${accentColor}30` }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

function ComingSoon({ label, Icon }: { label: string; Icon: typeof Zap }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon size={36} className="opacity-50" />
      </div>
      <p className="text-lg font-semibold">{label} Coming Soon</p>
      <p className="text-sm">We&apos;re preparing amazing products for you!</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────

type Props = {
  products: Record<ProductCategoryId, CardProduct[]>
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function HomeTabs({ products }: Props) {
  const { activeTab, setActiveTab, theme } = useTheme()
  const [activeSubCategory, setActiveSubCategory] = useState("All")

  // ── Carousel ref ───────────────────────────────────────────────────────────
  // The swiper only LISTENS to activeTab — it never writes back to it.
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    const idx = CATEGORY_ORDER.indexOf(activeTab)
    if (idx === -1 || swiper.realIndex === idx) return
    swiper.slideToLoop(idx, 500)   // slide to matching banner, 500ms ease
  }, [activeTab])

  // ── Products ───────────────────────────────────────────────────────────────
  const currentProducts: CardProduct[] =
    activeTab === "all"
      ? Object.values(products).flat()
      : products[activeTab as ProductCategoryId] || []

  const subCategories = [
    ...new Set(currentProducts.map((p) => p.subCategory).filter(Boolean)),
  ] as string[]

  const filteredProducts =
    activeSubCategory === "All"
      ? currentProducts
      : currentProducts.filter((p) => p.subCategory === activeSubCategory)

  const CurrentIcon = TABS.find((t) => t.id === activeTab)?.icon || Package


  return (
    <section className="w-full">

      {/* ── CAROUSEL ─────────────────────────────────────────────────────────
          Purely visual. Tab clicks drive it. It never drives the tabs.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          navigation
          loop
          speed={600}
          className="truevenix-hero-swiper"
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          // ── No onRealIndexChange ─────────────────────────────────────────
          // User can freely swipe the carousel; it changes the image only.
          // The active tab and product grid are untouched.
        >
          {HERO_SLIDES.map((slide, idx) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-[160px] sm:h-[210px] md:h-[260px] lg:h-[320px] w-full overflow-hidden">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  priority={idx === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <style jsx global>{`
          .truevenix-hero-swiper .swiper-pagination { bottom: 10px; }
          .truevenix-hero-swiper .swiper-pagination-bullet {
            background: rgba(255,255,255,0.45);
            width: 7px; height: 7px; transition: all 0.3s; opacity: 1;
          }
          .truevenix-hero-swiper .swiper-pagination-bullet-active {
            background: white; width: 16px; border-radius: 4px;
          }
          .truevenix-hero-swiper .swiper-button-next,
          .truevenix-hero-swiper .swiper-button-prev {
            color: rgba(255,255,255,0.9);
            width: 36px; height: 36px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            backdrop-filter: blur(8px);
            transition: background 0.2s;
          }
          .truevenix-hero-swiper .swiper-button-next:after,
          .truevenix-hero-swiper .swiper-button-prev:after { font-size: 12px; font-weight: 700; }
          .truevenix-hero-swiper .swiper-button-next:hover,
          .truevenix-hero-swiper .swiper-button-prev:hover { background: rgba(255,255,255,0.25); }
          @media (max-width: 640px) {
            .truevenix-hero-swiper .swiper-button-next,
            .truevenix-hero-swiper .swiper-button-prev { display: none; }
          }
        `}</style>
      </div>

      {/* ── MAIN CATEGORY TAB BAR ────────────────────────────────────────────
          This is the primary navigation. Clicking here:
            1. Updates activeTab (product grid switches)
            2. Slides the carousel to the matching banner
          That's all it does — two things, always in that direction.
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="px-3 py-4 md:px-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide md:grid md:grid-cols-8 md:gap-2">
          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id
            const tabTheme = CATEGORY_THEMES[tab.id]
            const TabIcon  = tab.icon

            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)        // ← updates product content
                  setActiveSubCategory("All") // ← resets sub-filter
                  // carousel slides via the useEffect above
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 md:px-2 py-3 md:py-4 cursor-pointer min-w-[80px] md:min-w-0 min-h-[80px] md:min-h-[100px] overflow-hidden transition-all duration-300"
                style={{
                  background: isActive ? tabTheme.primary : tabTheme.bg,
                  border:     `2px solid ${isActive ? tabTheme.primary : tabTheme.border}`,
                  boxShadow:  isActive ? `0 8px 24px ${tabTheme.primary}40` : "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: isActive ? "rgba(255,255,255,0.2)" : tabTheme.primaryLight }}
                >
                  <TabIcon size={20} style={{ color: isActive ? "white" : tabTheme.primary }} />
                </div>

                <span
                  className="text-[10px] md:text-[11px] font-bold text-center leading-tight tracking-tight"
                  style={{ color: isActive ? "white" : tabTheme.textColor }}
                >
                  {tab.label}
                </span>


                {isActive && (
                  <motion.div
                    layoutId="tab-active-bar"
                    className="absolute bottom-0 left-3 right-3 h-1 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── PRODUCT CONTENT ──────────────────────────────────────────────────
          Each tab renders its own independent product section.
          Switching tabs only changes this area — the carousel above
          already slid to the right banner via useEffect.
      ─────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <div className="px-3 md:px-6 pb-8">

            {/* Section header */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: theme.primary }}
                >
                  truevenix {activeTab === "all" ? "Store" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </p>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
                  {activeTab === "all"
                    ? "All Products"
                    : `Browse ${TABS.find((t) => t.id === activeTab)?.label}`}
                </h2>
              </div>
            </div>

            {/* Sub-category chips */}
            {subCategories.length > 0 && (
              <div className="mb-4">
                <CategoryFilter
                  categories={subCategories}
                  active={activeSubCategory}
                  onChange={setActiveSubCategory}
                  accentColor={theme.primary}
                  layoutId={`${activeTab}-cat-indicator`}
                />
              </div>
            )}

            {/* Products or empty state */}
            {filteredProducts.length === 0 ? (
              <ComingSoon
                label={TABS.find((t) => t.id === activeTab)?.label || ""}
                Icon={CurrentIcon}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                  {filteredProducts.slice(0, 20).map((product, i) => (
                    <ProductCard key={product.id} product={product} delay={i * 0.04} />
                  ))}
                </div>

                {filteredProducts.length > 20 && (
                  <div className="flex justify-center mt-8">
                    <Link href={activeTab === "all" ? "/shop" : `/shop?category=${activeTab}`}>
                      <Button variant="outline" size="lg" className="gap-2">
                        View all products
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

    </section>
  )
}
