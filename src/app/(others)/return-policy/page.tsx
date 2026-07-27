import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react"
import Link from "next/link"

const PRIMARY = "#B45309"
const PRIMARY_LIGHT = "#fcd9c6"
const PRIMARY_BORDER = "#fcd9c6"

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center"
        style={{ background: PRIMARY }}
      >
        {number}
      </span>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  )
}

function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div style={style} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  )
}

function PolicyRow({
  accepted,
  label,
  note,
}: {
  accepted: boolean
  label: string
  note?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {accepted ? (
        <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {note && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{note}</p>}
      </div>
    </div>
  )
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div style={{ background: PRIMARY }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl mb-4">
            <RotateCcw size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Return & Exchange Policy</h1>
          <p className="text-red-100 text-sm max-w-lg mx-auto leading-relaxed">
            We want you to be completely satisfied with every purchase from{" "}
            <span className="text-white font-semibold">truevenix</span>. If something isn't
            right, here's exactly how we make it right.
          </p>
          <p className="text-red-200 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: June 2026 &nbsp;·&nbsp; truevenix.com
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">

        {/* Quick summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: "7-Day Window",
              desc: "Report your return within 7 days of receiving your order",
            },
            {
              icon: PackageCheck,
              title: "Verified Returns",
              desc: "We review every return request before processing it",
            },
            {
              icon: ShieldCheck,
              title: "Your Money Back",
              desc: "Refund or exchange processed once the return is approved",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-2 bg-white rounded-xl border p-5 shadow-sm"
              style={{ borderColor: PRIMARY_BORDER }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: PRIMARY_LIGHT }}
              >
                <Icon size={16} style={{ color: PRIMARY }} />
              </div>
              <p className="font-bold text-gray-800 text-sm">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* 1. Coverage */}
        <Card>
          <SectionHeading number="1" title="Coverage" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            This return and exchange policy applies to all orders placed through{" "}
            <a
              href="https://www.truevenix.com"
              className="font-semibold hover:underline"
              style={{ color: PRIMARY }}
              target="_blank"
              rel="noopener noreferrer"
            >
              truevenix.com
            </a>{" "}
            and fulfilled within <strong>Nigeria</strong>. We accept returns exclusively within
            Nigeria at this time.
          </p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: PRIMARY_LIGHT, color: PRIMARY }}
          >
            <MapPin size={13} />
            Nigeria — All Deliverable States
          </div>
        </Card>

        {/* 2. Return Window & Conditions */}
        <Card>
          <SectionHeading number="2" title="Return Window & Conditions" />

          <div
            className="flex items-start gap-4 p-4 rounded-xl mb-5 border"
            style={{ background: PRIMARY_LIGHT, borderColor: PRIMARY_BORDER }}
          >
            <Clock size={18} className="flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
            <div>
              <p className="font-bold text-sm" style={{ color: PRIMARY }}>
                7-Day Return Window
              </p>
              <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#7b1a10" }}>
                You must report your return request within <strong>7 calendar days</strong> of
                receiving your order. Requests submitted after this window will not be accepted
                except in cases of significant product defects or undisclosed faults.
              </p>
            </div>
          </div>

          <p className="text-sm font-bold text-gray-700 mb-3">
            Returns are accepted under the following conditions:
          </p>

          <div className="divide-y divide-gray-50">
            <PolicyRow
              accepted={true}
              label="Defective or Damaged Products"
              note="Item arrived with a manufacturing defect, broken screen, missing components, or physical damage from shipping."
            />
            <PolicyRow
              accepted={true}
              label="Wrong Item Delivered"
              note="You received a product different from what you ordered (wrong model, colour, or variant)."
            />
            <PolicyRow
              accepted={true}
              label="Incomplete Order"
              note="Accessories, cables, or items listed in the box contents are missing upon delivery."
            />
            <PolicyRow
              accepted={true}
              label="Unopened Products (Selected Categories)"
              note="Sealed, unused, in original factory packaging with all accessories intact."
            />
            <PolicyRow
              accepted={false}
              label="Products Damaged by Customer"
              note="Physical damage, liquid damage, or modifications made after delivery are not eligible."
            />
            <PolicyRow
              accepted={false}
              label="Items Without Original Packaging"
              note="Products must be returned in their original sealed box with all accessories and documentation."
            />
            <PolicyRow
              accepted={false}
              label="Software or Activation Issues"
              note="Products that have been registered, activated, or linked to an account are not returnable."
            />
          </div>
        </Card>

        {/* 3. Exchanges */}
        <Card>
          <SectionHeading number="3" title="Exchanges" />
          <PolicyRow
            accepted={true}
            label="We Accept Exchanges"
            note="If a product is defective or incorrect, we will replace it with the same item where stock is available."
          />
          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            Exchanges are subject to product availability. If the exact item is out of stock, we
            will issue a full refund or store credit instead. Exchange requests must be raised
            within the 7-day return window.
          </p>
        </Card>

        {/* 4. Non-Returnable Categories */}
        <Card>
          <SectionHeading number="4" title="Non-Returnable Categories" />
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            The following product categories cannot be returned or exchanged unless they arrive
            defective or incorrect:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "Activated Software Licenses",
              "Opened Earphones & Earbuds",
              "Consumable Items (Used)",
              "Gift Cards & Vouchers",
              "Clearance or Final Sale Items",
              "Items Reported After 7 Days",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100"
              >
                <XCircle size={13} className="text-red-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 5. How to Request a Return */}
        <Card>
          <SectionHeading number="5" title="How to Request a Return" />
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            To initiate a return or exchange, follow these steps:
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Contact Us Within 7 Days",
                desc: "Reach out via WhatsApp, phone, or email using the contact details below. Quote your order reference number.",
              },
              {
                step: "2",
                title: "Provide Evidence",
                desc: "Send a clear photo or short video of the item showing the defect, damage, or issue. This helps us verify your claim quickly.",
              },
              {
                step: "3",
                title: "Await Verification",
                desc: "Our team will review your request within 24 hours of receiving your evidence and contact you with a decision.",
              },
              {
                step: "4",
                title: "Return the Item",
                desc: "If approved, we will arrange item pickup or provide a drop-off location depending on your delivery area.",
              },
              {
                step: "5",
                title: "Receive Refund or Exchange",
                desc: "Once we receive and inspect the returned item, your refund or replacement will be processed within 1–3 business days.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div
                  className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0"
                  style={{ background: PRIMARY }}
                >
                  {step}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 6. Refund Method & Fees */}
        <Card>
          <SectionHeading number="6" title="Refund Method & Fees" />
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>No return shipping fees</strong> for defective or incorrect items — we
                cover the cost of collection.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Refunds are issued</strong> via bank transfer, Paystack reversal, or store
                credit — your choice.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Original delivery fees are <strong>non-refundable</strong> unless the return is
                due to an error on our part such as a wrong or defective item.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
              <p className="text-sm text-gray-700 leading-relaxed">
                Approved refunds are processed within <strong>1–3 business days</strong> after the
                returned item has been received and inspected.
              </p>
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card style={{ borderColor: PRIMARY_BORDER }}>
          <p
            className="text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: PRIMARY }}
          >
            Contact Us
          </p>
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Have a Question About Your Return?
          </h3>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@truevenix.com"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: PRIMARY_LIGHT }}
              >
                <Mail size={14} style={{ color: PRIMARY }} />
              </div>
              support@truevenix.com
            </a>
            <a
              href="tel:+2347016341256"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: PRIMARY_LIGHT }}
              >
                <Phone size={14} style={{ color: PRIMARY }} />
              </div>
              +234 7016341256
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: PRIMARY_LIGHT }}
              >
                <MapPin size={14} style={{ color: PRIMARY }} />
              </div>
              truevenix · Abuja, FCT, Nigeria
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: PRIMARY }}
            >
              <Truck size={14} /> Browse Products
            </Link>
            <Link
              href="/privacy-policy"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ border: `2px solid ${PRIMARY}`, color: PRIMARY }}
            >
              <ArrowRight size={14} /> Privacy Policy
            </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}