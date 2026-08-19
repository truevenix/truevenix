"use client"

import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import handleImageSaveToFireBase from "@/lib/upload"
import { cn } from "@/lib/utils"
import {
  PRODUCT_CATEGORY_OPTIONS,
  fromApiCategory,
  toApiCategory,
  type ProductCategoryId,
} from "@/components/admin/product-categories"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AdminProductImage = {
  id?: string
  color: string
  colorCode: string
  image: string
}

export type AdminProduct = {
  id: string
  name: string
  description: string
  descriptionP2?: string | null
  descriptionP3?: string | null
  price: number
  originalPrice: number | null
  brand: string | null
  category: string
  subCategory: string | null
  inStock: boolean
  stockCount: number
  badge: string | null
  isFeatured: boolean
  warranty: string | null
  specifications?: unknown
  keyFeatures?: string[] | null
  images: AdminProductImage[]
  sizeOptions?: {
    id?: string
    label: string
    name: string
    price: number
    isDefault: boolean
    imageUrl?: string | null
  }[]
  avgRating?: number
  reviewCount?: number
}

type Props = {
  item?: AdminProduct
  initialCategory?: ProductCategoryId
  knownSubCategories: Record<ProductCategoryId, string[]>
  onClose: () => void
  onSuccess: (product: AdminProduct, mode: "create" | "update") => void
}

type SpecRow = { key: string; value: string }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BADGES = [
  { value: "new", label: "New" },
  { value: "sale", label: "Sale" },
  { value: "hot", label: "Hot" },
  { value: "bestseller", label: "Best Seller" },
  { value: "limited", label: "Limited" },
]

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  descriptionP2: z.string(),
  descriptionP3: z.string(),
  price: z.number().min(0, "Price must be ≥ 0"),
  originalPrice: z.number().min(0).nullable(),
  brand: z.string(),
  subCategory: z.string(),
  stockCount: z.number().int().min(0, "Stock count must be ≥ 0"),
  warranty: z.string(),
  badge: z.string(),
  inStock: z.boolean(),
  isFeatured: z.boolean(),
  keyFeatures: z.array(z.string()),
  sizeOptions: z.array(z.object({
    label: z.string().min(1),
    name: z.string().min(1),
    price: z.number().min(0),
    isDefault: z.boolean(),
    imageUrl: z.string(),
  })),
})

type ProductFormValues = z.infer<typeof productSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function specsToRows(value: unknown): SpecRow[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>).map(([key, item]) => ({
    key,
    value: item === null || item === undefined ? "" : String(item),
  }))
}

function rowsToSpecs(rows: SpecRow[]) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key && value) acc[key] = value
    return acc
  }, {})
}

function parseKeyFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string")
  return []
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ItemFormModal({
  item,
  initialCategory = "gadgets",
  knownSubCategories,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(item)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const variantImageInputRef = useRef<HTMLInputElement>(null)

  const startingCategory = item ? fromApiCategory(item.category) : initialCategory
  const [category, setCategory] = useState<ProductCategoryId>(startingCategory)

  const [images, setImages] = useState<AdminProductImage[]>(item?.images ?? [])
  const [imageDraft, setImageDraft] = useState({
    color: "Default",
    colorCode: "#475569",
    image: "",
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [sizeLabel, setSizeLabel] = useState(item?.sizeOptions?.[0]?.label ?? "")
  const [sizeOptionDraft, setSizeOptionDraft] = useState({
    name: "",
    price: 0,
    imageUrl: "",
  })
  const [variantImageUploading, setVariantImageUploading] = useState(false)
  const [variantImageProgress, setVariantImageProgress] = useState(0)

  const [specRows, setSpecRows] = useState<SpecRow[]>(specsToRows(item?.specifications))

  const [subCategoryInput, setSubCategoryInput] = useState("")
  const [manualSubCategories, setManualSubCategories] = useState<Record<ProductCategoryId, string[]>>({
    gadgets: [],
    solar: [],
    electronics: [],
    phones: [],
    computers: [],
    machinery: [],
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: item?.name ?? "",
      description: item?.description ?? "",
      descriptionP2: item?.descriptionP2 ?? "",
      descriptionP3: item?.descriptionP3 ?? "",
      price: item?.price ?? 0,
      originalPrice: item?.originalPrice ?? null,
      brand: item?.brand ?? "",
      subCategory: item?.subCategory ?? "",
      stockCount: item?.stockCount ?? 0,
      warranty: item?.warranty ?? "",
      badge: item?.badge ?? "",
      inStock: item?.inStock ?? true,
      isFeatured: item?.isFeatured ?? false,
      keyFeatures: parseKeyFeatures(item?.keyFeatures),
      sizeOptions: item?.sizeOptions?.map(({ label, name, price, isDefault, imageUrl }) => ({
        label,
        name,
        price,
        isDefault,
        imageUrl: imageUrl ?? "",
      })) ?? [],
    },
  })

  const watchedBadge = watch("badge")
  const watchedInStock = watch("inStock")
  const watchedIsFeatured = watch("isFeatured")
  const watchedSubCategory = watch("subCategory")
  const watchedKeyFeatures = watch("keyFeatures")
  const watchedSizeOptions = watch("sizeOptions")

  const listedSubCategories = useMemo(() => {
    const values = [
      ...(knownSubCategories[category] ?? []),
      ...(manualSubCategories[category] ?? []),
      watchedSubCategory,
    ]
      .map((v) => v.trim())
      .filter(Boolean)
    return Array.from(new Set(values))
  }, [category, knownSubCategories, manualSubCategories, watchedSubCategory])

  const addSubCategory = () => {
    const value = subCategoryInput.trim()
    if (!value) return
    setManualSubCategories((current) => ({
      ...current,
      [category]: Array.from(new Set([...(current[category] ?? []), value])),
    }))
    setValue("subCategory", value)
    setSubCategoryInput("")
  }

  const addImage = () => {
    const image = imageDraft.image.trim()
    if (!image) {
      toast.error("Add an image URL or upload an image first.")
      return
    }
    setImages((current) => [
      ...current,
      {
        color: imageDraft.color.trim() || "Default",
        colorCode: imageDraft.colorCode.trim() || "#475569",
        image,
      },
    ])
    setImageDraft({ color: "Default", colorCode: "#475569", image: "" })
  }

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const image = await handleImageSaveToFireBase(file, setUploadProgress)
      setImageDraft((current) => ({ ...current, image }))
      toast.success("Image uploaded")
    } catch {
      toast.error("Image upload failed")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const uploadVariantImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setVariantImageUploading(true)
    setVariantImageProgress(0)
    try {
      const image = await handleImageSaveToFireBase(file, setVariantImageProgress)
      setSizeOptionDraft((c) => ({ ...c, imageUrl: image }))
      toast.success("Variant image uploaded")
    } catch {
      toast.error("Variant image upload failed")
    } finally {
      setVariantImageUploading(false)
      event.target.value = ""
    }
  }

  const addSpecRow = () => setSpecRows((current) => [...current, { key: "", value: "" }])

  const updateSpecRow = (index: number, field: keyof SpecRow, value: string) => {
    setSpecRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const addKeyFeature = () => {
    setValue("keyFeatures", [...watchedKeyFeatures, ""])
  }

  const updateKeyFeature = (index: number, value: string) => {
    const updated = watchedKeyFeatures.map((f, i) => (i === index ? value : f))
    setValue("keyFeatures", updated)
  }

  const removeKeyFeature = (index: number) => {
    setValue("keyFeatures", watchedKeyFeatures.filter((_, i) => i !== index))
  }

  const addSizeOption = () => {
    const name = sizeOptionDraft.name.trim()
    if (!sizeLabel.trim()) {
      toast.error("Set a variant type first (e.g. Amperage, Voltage)")
      return
    }
    if (!name) {
      toast.error("Enter a variant value (e.g. 30A, 48V, 5kVA)")
      return
    }
    const current = watchedSizeOptions ?? []
    setValue("sizeOptions", [
      ...current,
      {
        label: sizeLabel.trim(),
        name,
        price: sizeOptionDraft.price,
        isDefault: current.length === 0,
        imageUrl: sizeOptionDraft.imageUrl,
      },
    ])
    setSizeOptionDraft({ name: "", price: 0, imageUrl: "" })
  }

  const removeSizeOption = (index: number) => {
    const filtered = (watchedSizeOptions ?? []).filter((_, i) => i !== index)
    if (filtered.length > 0 && !filtered.some((s) => s.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true }
    }
    setValue("sizeOptions", filtered)
  }

  const setDefaultSizeOption = (index: number) => {
    setValue(
      "sizeOptions",
      (watchedSizeOptions ?? []).map((s, i) => ({ ...s, isDefault: i === index }))
    )
  }

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast.error("Add at least one product image.")
      return
    }

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      descriptionP2: values.descriptionP2.trim() || null,
      descriptionP3: values.descriptionP3.trim() || null,
      price: values.price,
      originalPrice: values.originalPrice ?? null,
      brand: values.brand.trim() || null,
      category: toApiCategory(category),
      subCategory: values.subCategory.trim() || null,
      inStock: values.inStock,
      stockCount: Math.max(0, Math.floor(values.stockCount)),
      badge: values.badge || null,
      isFeatured: values.isFeatured,
      warranty: values.warranty.trim() || null,
      specifications: rowsToSpecs(specRows),
      keyFeatures: values.keyFeatures.map((f) => f.trim()).filter(Boolean),
      sizeOptions: (values.sizeOptions ?? []).map(
        ({ label, name, price, isDefault, imageUrl }) => ({
          label,
          name,
          price,
          isDefault,
          imageUrl: imageUrl || null,
        })
      ),
      images: images.map(({ color, colorCode, image }) => ({ color, colorCode, image })),
    }

    try {
      const response = await fetch(
        isEdit ? `/api/v1/products/${item!.id}` : "/api/v1/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || "Unable to save product.")
      toast.success(isEdit ? "Product updated" : "Product created")
      onSuccess(body.product, isEdit ? "update" : "create")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product.")
    }
  }

  const categoryConfig = PRODUCT_CATEGORY_OPTIONS.find((o) => o.id === category)!
  const CategoryIcon = categoryConfig.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto min-h-full max-w-5xl overflow-hidden rounded-[24px] bg-white shadow-2xl">

        {/* Header */}
        <header className="relative overflow-hidden bg-slate-950 text-white">
          <img
            src={categoryConfig.image}
            alt={categoryConfig.alt}
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="relative flex items-start justify-between gap-4 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: `${categoryConfig.color}33` }}
              >
                <CategoryIcon size={22} style={{ color: categoryConfig.color }} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/50">
                  truevenix admin
                </p>
                <h1 className="text-xl font-black">
                  {isEdit
                    ? `Edit ${categoryConfig.labels.productName}`
                    : `Add ${categoryConfig.labels.productName}`}
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close product form"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 p-5 sm:p-7">

          {/* Main category */}
          <section className="grid gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Main category
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                Switch the product family first, then add the matching sub-category.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {PRODUCT_CATEGORY_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = option.id === category
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCategory(option.id)}
                    className={cn(
                      "flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition",
                      active ? "text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-50"
                    )}
                    style={{
                      background: active ? option.color : option.light,
                      borderColor: active ? option.color : `${option.color}44`,
                    }}
                  >
                    <Icon size={21} style={{ color: active ? "white" : option.color }} />
                    <span className="text-xs font-black">{option.labels.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Sub-category */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-black text-slate-700">Sub-category</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input
                value={subCategoryInput}
                onChange={(e) => setSubCategoryInput(e.target.value)}
                placeholder={`e.g. ${category === "phones" ? "Android phones" : "Premium picks"}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSubCategory()
                  }
                }}
              />
              <Button type="button" onClick={addSubCategory} className="gap-2">
                <Plus size={15} />
                Add
              </Button>
            </div>
            {listedSubCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {listedSubCategories.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("subCategory", value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                      watchedSubCategory === value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Core fields */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">Product name</label>
              <Input {...register("name")} placeholder="e.g. Samsung Galaxy A56" />
              {errors.name && (
                <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">Brand</label>
              <Input {...register("brand")} placeholder="e.g. Samsung" />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">Price (NGN)</label>
              <Input
                type="number"
                min="0"
                step="any"
                {...register("price", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-xs font-semibold text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">
                Original price{" "}
                <span className="font-semibold text-slate-400">(optional)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="Leave empty when not on sale"
                {...register("originalPrice", {
                  setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                })}
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">Stock count</label>
              <Input
                type="number"
                min="0"
                {...register("stockCount", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stockCount && (
                <p className="text-xs font-semibold text-red-500">{errors.stockCount.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-black text-slate-700">Warranty</label>
              <Input {...register("warranty")} placeholder="e.g. 12 months" />
            </div>
          </section>

          {/* Description — 3 paragraphs */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-black text-slate-700">Description</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                Write up to 3 paragraphs. Each paragraph renders separately on the product page for clean readability and better SEO.
              </p>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                Paragraph 1 <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register("description")}
                placeholder="Lead paragraph — introduce the product, its primary use case and standout value..."
                rows={4}
                className="min-h-28 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
              />
              {errors.description && (
                <p className="text-xs font-semibold text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                Paragraph 2 <span className="font-semibold text-slate-300">(optional)</span>
              </label>
              <textarea
                {...register("descriptionP2")}
                placeholder="Expand on key features, technical details or target use cases..."
                rows={3}
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                Paragraph 3 <span className="font-semibold text-slate-300">(optional)</span>
              </label>
              <textarea
                {...register("descriptionP3")}
                placeholder="Closing paragraph — warranty, brand promise, or why to buy from Truevenix..."
                rows={3}
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
              />
            </div>
          </section>

          {/* Key features */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-700">Key features</p>
                <p className="text-xs font-semibold text-slate-400">
                  Highlight the standout selling points of this product.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addKeyFeature} className="gap-2">
                <Plus size={15} />
                Add feature
              </Button>
            </div>
            {watchedKeyFeatures.length > 0 ? (
              <div className="grid gap-2">
                {watchedKeyFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateKeyFeature(index, e.target.value)}
                      placeholder={`Feature ${index + 1} — e.g. 5000 mAh battery`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeKeyFeature(index)}
                      aria-label="Remove feature"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No key features yet. Click &ldquo;Add feature&rdquo; to get started.
              </p>
            )}
          </section>

          {/* Badge + toggles */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap gap-2">
              {BADGES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue("badge", watchedBadge === option.value ? "" : option.value)
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-black",
                    watchedBadge === option.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-500"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-sm font-bold text-slate-600">
                In stock
                <input
                  type="checkbox"
                  checked={watchedInStock}
                  onChange={(e) => setValue("inStock", e.target.checked)}
                  className="h-5 w-5"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 text-sm font-bold text-slate-600">
                Feature product
                <input
                  type="checkbox"
                  checked={watchedIsFeatured}
                  onChange={(e) => setValue("isFeatured", e.target.checked)}
                  className="h-5 w-5"
                />
              </label>
            </div>
          </section>

          {/* Images */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-700">Images</p>
                <p className="text-xs font-semibold text-slate-400">
                  Upload or paste a product image URL, then add it to the product.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadImage}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? `${uploadProgress}%` : "Upload"}
              </Button>
            </div>
            <div className="grid gap-2 lg:grid-cols-[1fr_120px_1fr_auto]">
              <Input
                value={imageDraft.color}
                onChange={(e) => setImageDraft((c) => ({ ...c, color: e.target.value }))}
                placeholder="Color or variant"
              />
              <Input
                type="color"
                value={imageDraft.colorCode}
                onChange={(e) => setImageDraft((c) => ({ ...c, colorCode: e.target.value }))}
              />
              <Input
                value={imageDraft.image}
                onChange={(e) => setImageDraft((c) => ({ ...c, image: e.target.value }))}
                placeholder="Image URL"
              />
              <Button type="button" onClick={addImage} className="gap-2">
                <Plus size={15} />
                Add
              </Button>
            </div>
            {images.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <div
                    key={`${image.image}-${index}`}
                    className="flex gap-3 rounded-2xl border border-slate-200 p-3"
                  >
                    <img
                      src={image.image}
                      alt={image.color}
                      className="h-16 w-16 rounded-xl border object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-700">{image.color}</p>
                      <p className="truncate text-xs text-slate-400">{image.image}</p>
                      <span
                        className="mt-2 block h-4 w-10 rounded-full border"
                        style={{ background: image.colorCode }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                      className="text-slate-300 hover:text-red-500"
                      aria-label="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Specifications */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-700">Specifications</p>
                <p className="text-xs font-semibold text-slate-400">
                  Add key details like battery, capacity, screen size, or inverter wattage.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addSpecRow} className="gap-2">
                <Plus size={15} />
                Add spec
              </Button>
            </div>
            {specRows.map((row, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={row.key}
                  onChange={(e) => updateSpecRow(index, "key", e.target.value)}
                  placeholder="Spec name"
                />
                <Input
                  value={row.value}
                  onChange={(e) => updateSpecRow(index, "value", e.target.value)}
                  placeholder="Spec value"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSpecRows((current) => current.filter((_, i) => i !== index))}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </section>

          {/* Variant / Size Options */}
          <section className="grid gap-3 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-black text-slate-700">Variant Options</p>
              <p className="text-xs font-semibold text-slate-400">
                Add selectable variants with individual prices and optional images — e.g. Amperage, System Voltage, Power Rating, Capacity, Storage, RAM.
              </p>
            </div>

            {/* Variant type label */}
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                Variant Type
              </label>
              <Input
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                placeholder="e.g. Amperage, System Voltage, Power Rating, Capacity…"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  "Amperage", "System Voltage", "Power Rating",
                  "Capacity", "Storage", "RAM", "Screen Size", "Weight",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSizeLabel(label)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                      sizeLabel === label
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add variant row */}
            <div className="grid gap-2">
              <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                <Input
                  value={sizeOptionDraft.name}
                  onChange={(e) => setSizeOptionDraft((c) => ({ ...c, name: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSizeOption()
                    }
                  }}
                  placeholder={
                    sizeLabel === "Amperage" ? "e.g. 30A, 60A, 100A, 120A" :
                    sizeLabel === "System Voltage" ? "e.g. 12V, 24V, 48V" :
                    sizeLabel === "Power Rating" ? "e.g. 1kVA, 3.5kVA, 5kVA" :
                    sizeLabel === "Capacity" ? "e.g. 10000mAh, 50Ah, 5kWh" :
                    sizeLabel === "Storage" ? "e.g. 128GB, 256GB, 512GB" :
                    sizeLabel === "RAM" ? "e.g. 4GB, 8GB, 16GB" :
                    "Variant value"
                  }
                />
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={sizeOptionDraft.price || ""}
                  onChange={(e) =>
                    setSizeOptionDraft((c) => ({ ...c, price: parseFloat(e.target.value) || 0 }))
                  }
                  placeholder="Price (₦)"
                />
                <Button type="button" onClick={addSizeOption} className="gap-2">
                  <Plus size={15} />
                  Add
                </Button>
              </div>

              {/* Variant image row */}
              <div className="flex items-center gap-2">
                <input
                  ref={variantImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadVariantImage}
                />
                <Input
                  value={sizeOptionDraft.imageUrl}
                  onChange={(e) =>
                    setSizeOptionDraft((c) => ({ ...c, imageUrl: e.target.value }))
                  }
                  placeholder="Variant image URL (optional)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => variantImageInputRef.current?.click()}
                  disabled={variantImageUploading}
                  className="gap-1.5 shrink-0"
                >
                  {variantImageUploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}
                  {variantImageUploading ? `${variantImageProgress}%` : "Upload"}
                </Button>
                {sizeOptionDraft.imageUrl && (
                  <img
                    src={sizeOptionDraft.imageUrl}
                    alt="variant preview"
                    className="h-9 w-9 rounded-lg border object-contain"
                  />
                )}
              </div>
            </div>

            {/* Listed variants */}
            {(watchedSizeOptions ?? []).length > 0 && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    {sizeLabel || "Variants"} ({watchedSizeOptions.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setValue("sizeOptions", [])}
                    className="flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={11} /> Clear all
                  </button>
                </div>
                <div className="grid gap-1.5">
                  {(watchedSizeOptions ?? []).map((opt, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                        opt.isDefault ? "border-slate-800 bg-slate-50" : "border-slate-200 bg-white"
                      )}
                    >
                      {/* Default selector */}
                      <button
                        type="button"
                        title="Set as default"
                        onClick={() => setDefaultSizeOption(i)}
                        className={cn(
                          "h-4 w-4 flex-shrink-0 rounded-full border-2 transition flex items-center justify-center",
                          opt.isDefault
                            ? "border-slate-800 bg-slate-800"
                            : "border-slate-300 hover:border-slate-600"
                        )}
                      >
                        {opt.isDefault && (
                          <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </button>

                      {/* Variant image thumbnail */}
                      {opt.imageUrl ? (
                        <img
                          src={opt.imageUrl}
                          alt={opt.name}
                          className="h-8 w-8 flex-shrink-0 rounded-lg border object-contain bg-white"
                        />
                      ) : (
                        <div className="h-8 w-8 flex-shrink-0 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                          <span className="text-[8px] text-slate-300 font-bold">IMG</span>
                        </div>
                      )}

                      {/* Label badge */}
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-500 flex-shrink-0">
                        {opt.label}
                      </span>

                      {/* Value */}
                      <span className="flex-1 font-bold text-slate-800 min-w-0 truncate">
                        {opt.name}
                      </span>

                      {/* Default tag */}
                      {opt.isDefault && (
                        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400 flex-shrink-0">
                          default
                        </span>
                      )}

                      {/* Inline price input */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs font-bold text-slate-400">₦</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={opt.price || ""}
                          onChange={(e) => {
                            const updated = (watchedSizeOptions ?? []).map((s, idx) =>
                              idx === i ? { ...s, price: parseFloat(e.target.value) || 0 } : s
                            )
                            setValue("sizeOptions", updated)
                          }}
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-xs font-bold text-emerald-600 outline-none focus:border-slate-400 focus:ring-0"
                          aria-label={`Price for ${opt.name}`}
                        />
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeSizeOption(i)}
                        className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                        aria-label="Remove variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Click the circle to mark a variant as the default shown to customers.
                </p>
              </div>
            )}
          </section>

          {/* Sticky footer */}
          <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-3 border-t border-slate-200 bg-white/95 p-5 backdrop-blur sm:-mx-7 sm:-mb-7 sm:px-7">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading} className="flex-1 gap-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEdit ? "Save product" : "Add product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}