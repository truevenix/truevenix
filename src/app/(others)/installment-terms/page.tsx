import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
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

export default function InstallmentTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div style={{ background: PRIMARY }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl mb-4">
            <Calendar size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Installment Payment Terms</h1>
          <p className="text-red-100 text-sm max-w-lg mx-auto leading-relaxed">
            How &quot;Pay in installments&quot; works on{" "}
            <span className="text-white font-semibold">truevenix</span>, in plain language.
          </p>
          <p className="text-red-200 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: August 2026 &nbsp;·&nbsp; truevenix.com
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">

        {/* Quick summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: CreditCard,
              title: "2, 3 or 4 payments",
              desc: "Choose how many installments to split your order into at checkout",
            },
            {
              icon: Clock,
              title: "Up to 4 months",
              desc: "1 installment = 1 month, so 4x gives you 4 months to finish paying",
            },
            {
              icon: CheckCircle2,
              title: "Account required",
              desc: "Sign in so you can track and pay the remaining installments anytime",
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

        {/* 1. How it works */}
        <Card>
          <SectionHeading number="1" title="How Installments Work" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            When you choose <strong>&quot;Pay in installments&quot;</strong> at checkout on{" "}
            <a
              href="https://www.truevenix.com"
              className="font-semibold hover:underline"
              style={{ color: PRIMARY }}
              target="_blank"
              rel="noopener noreferrer"
            >
              truevenix.com
            </a>{" "}
            or the truevenix app, your order total is split into equal parts and charged over
            time instead of all at once. Each installment is billed one month apart, so the
            installment count you pick also sets how many months you have to finish paying:
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { n: "2x", desc: "2 months to pay" },
              { n: "3x", desc: "3 months to pay" },
              { n: "4x", desc: "4 months maximum" },
            ].map(({ n, desc }) => (
              <div
                key={n}
                className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center"
                style={{ borderColor: PRIMARY_BORDER, background: PRIMARY_LIGHT }}
              >
                <span className="text-sm font-black" style={{ color: PRIMARY }}>{n}</span>
                <span className="text-[11px] text-gray-600 leading-tight">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            4 installments (4 months) is currently the maximum we offer. Every installment except
            the last is rounded down to the nearest Naira, and the final installment covers
            whatever small remainder is left — so the parts always add up to your exact order
            total.
          </p>
        </Card>

        {/* 2. Eligibility & first payment */}
        <Card>
          <SectionHeading number="2" title="Eligibility & First Payment" />
          <div className="divide-y divide-gray-50">
            <PolicyRow
              accepted={true}
              label="Account Required"
              note="Installments are only available to signed-in customers, so you can track and pay the rest of your plan from your profile at any time. Guest checkout does not support installments."
            />
            <PolicyRow
              accepted={true}
              label="First Installment Charged Immediately"
              note="The first installment is charged right away via Paystack, the same way a regular order payment is processed. Your order is confirmed once this first payment succeeds."
            />
            <PolicyRow
              accepted={true}
              label="Remaining Installments Are Self-Serve"
              note="You pay each remaining installment yourself from the Installment Payments section of your profile, whenever you're ready — there's no auto-billing."
            />
          </div>
        </Card>

        {/* 3. Payments, delays & order fulfillment */}
        <Card>
          <SectionHeading number="3" title="Payments, Delays & Fulfillment" />
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Your order is confirmed and prepared for shipping once the <strong>first
                installment</strong> is paid — you do not need to complete the full plan before
                we ship.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                An installment plan is considered <strong>fully paid</strong> only once every
                installment has been received. Delivery timelines and any after-sales support are
                unaffected by how many installments remain outstanding, but we may reach out if a
                plan is significantly overdue.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard size={16} style={{ color: PRIMARY }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                All installment payments are processed securely through <strong>Paystack</strong>.
                We never store your card details.
              </p>
            </div>
          </div>
        </Card>

        {/* 4. Missed payments */}
        <Card style={{ borderColor: PRIMARY_BORDER }}>
          <SectionHeading number="4" title="Missed Payments" />
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>We don&apos;t penalize a missed installment.</strong> There&apos;s no late fee, no
                interest, and no lockout on your account if an installment goes past its expected
                date.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} style={{ color: PRIMARY }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Simply pay the missed installment whenever you&apos;re next ready to pay — the{" "}
                <strong>&quot;Pay next installment&quot;</strong> button in your Installment Payments
                section always charges whichever installment is still outstanding, so there&apos;s
                nothing extra to catch up on beyond that amount.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard size={16} style={{ color: PRIMARY }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 leading-relaxed">
                Don&apos;t want to wait out the rest of the schedule? Open the plan&apos;s details page
                and use <strong>&quot;Pay everything now&quot;</strong> to settle the full remaining
                balance in a single payment — your order is treated as fully paid the moment that
                goes through.
              </p>
            </div>
          </div>
        </Card>

        

        {/* 6. Returns & installments */}
        <Card>
          <SectionHeading number="6" title="Returns, Refunds & Installments" />
          <p className="text-sm text-gray-600 leading-relaxed">
            If an item bought on installments is eligible for a return or refund under our{" "}
            <Link href="/return-policy" className="font-semibold hover:underline" style={{ color: PRIMARY }}>
              Return &amp; Exchange Policy
            </Link>
            , any installments already paid toward that order will be refunded using the same
            method set out in that policy, and any remaining unpaid installments on the plan are
            cancelled.
          </p>
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
            Have a Question About Installments?
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
              href="/return-policy"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ border: `2px solid ${PRIMARY}`, color: PRIMARY }}
            >
              <ArrowRight size={14} /> Return Policy
            </Link>
          </div>
        </Card>

      </div>
    </div>
  )
}