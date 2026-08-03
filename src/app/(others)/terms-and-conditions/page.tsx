import {
  Scale,
  ShoppingCart,
  CreditCard,
  Shield,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Users,
  Globe,
  Truck,
  RotateCcw,
  AlertCircle,
  Lock,
  Eye,
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

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
        style={{ background: PRIMARY }}
      />
      <span>{children}</span>
    </li>
  )
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div style={{ background: PRIMARY }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl mb-4">
            <Scale size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Terms & Conditions</h1>
          <p className="text-red-100 text-sm max-w-lg mx-auto leading-relaxed">
            These Terms govern your use of{" "}
            <span className="text-white font-semibold">truevenix</span> — our electronics and
            gadgets e-commerce platform at truevenix.com.
          </p>
          <p className="text-red-200 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: June 2026 &nbsp;·&nbsp; truevenix.com
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">

        {/* Quick reference strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
          
            {
              icon: Globe,
              title: "Nigeria Only",
              desc: "All services and deliveries are currently available within Nigeria exclusively",
            },
            {
              icon: Lock,
              title: "Secure Payments",
              desc: "All transactions are processed through Paystack's secure payment infrastructure",
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

        {/* 1. Introduction */}
        <Card>
          <SectionHeading number="1" title="Introduction" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Welcome to truevenix. By accessing our website at{" "}
            <a
              href="https://www.truevenix.com"
              className="font-semibold hover:underline"
              style={{ color: PRIMARY }}
              target="_blank"
              rel="noopener noreferrer"
            >
              truevenix.com
            </a>
            , creating an account, or placing any order, you agree to be bound by these Terms and
            Conditions in full. truevenix is an electronics and gadgets retail platform serving
            customers across Nigeria.
          </p>
          <div
            className="flex items-start gap-3 p-4 rounded-xl border text-sm font-semibold leading-relaxed"
            style={{ background: PRIMARY_LIGHT, borderColor: PRIMARY_BORDER, color: PRIMARY }}
          >
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
            If you do not agree with any part of these Terms, please do not use our platform.
          </div>
        </Card>

        {/* 2. Eligibility & Account */}
        <Card>
          <SectionHeading number="2" title=" Account Registration" />
          <ul className="flex flex-col gap-1.5">
            {[
             
              "When creating an account, you agree to provide accurate, current, and complete information and to keep it up to date.",
              "You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
              "Notify us immediately at support@truevenix.com if you suspect any unauthorised use of your account.",
              "truevenix reserves the right to refuse service, suspend accounts, or cancel orders at our discretion, particularly where we suspect fraud, abuse, or violation of these Terms.",
              "One account per person. Creating multiple accounts to circumvent restrictions or promotions is prohibited.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 3. Products & Orders */}
        <Card>
          <SectionHeading number="3" title="Products & Orders" />
          <ul className="flex flex-col gap-1.5">
            {[
              "All products listed on truevenix are subject to availability. Stock levels may change without prior notice.",
              "Product images, descriptions, and specifications are provided for informational purposes and are as accurate as possible. Minor variations may occur.",
              "Placing an order does not guarantee fulfilment until you receive an explicit order confirmation via email.",
              "truevenix reserves the right to cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity.",
              "If we cancel an order you have already paid for, a full refund will be issued to the original payment method within 1–3 business days.",
              "You are responsible for providing a correct and accessible delivery address. Failed deliveries due to incorrect or inaccessible addresses are the customer's responsibility.",
              "Bulk or commercial orders may be subject to additional review and approval before processing.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 4. Pricing */}
        <Card>
          <SectionHeading number="4" title="Pricing" />
          <ul className="flex flex-col gap-1.5">
            {[
              "All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes unless explicitly stated otherwise.",
              "We reserve the right to update or correct prices at any time before an order is confirmed.",
              "Promotional prices and discounts are only valid for the specified period and cannot be applied retroactively.",
              "truevenix is not obligated to honour orders placed at prices resulting from a pricing error.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 5. Payment */}
        <Card>
          <SectionHeading number="5" title="Payment Terms" />
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-4 border text-sm font-semibold"
            style={{ background: PRIMARY_LIGHT, borderColor: PRIMARY_BORDER, color: PRIMARY }}
          >
            <Lock size={15} className="flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
            All online payments are processed securely through Paystack. We never store your full card details.
          </div>
          <ul className="flex flex-col gap-1.5">
            {[
              "Accepted payment methods include Paystack (debit/credit cards, bank transfer, USSD) and pay-on-delivery for eligible orders.",
              "All transactions are denominated in Nigerian Naira (₦). No foreign currency transactions are supported at this time.",
              "If a payment fails or is declined, your order will not be confirmed. Please contact your bank or reach out to us for assistance.",
              "Invoices and receipts are generated automatically and sent to the email address on your account.",
              "Any applicable promotional discounts or promo codes must be applied at checkout and cannot be applied retroactively.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 6. Delivery */}
        <Card>
          <SectionHeading number="6" title="Delivery" />
          <ul className="flex flex-col gap-1.5">
            {[
              "Delivery is available within our serviceable zones across Nigeria. Coverage may vary by product type and location.",
              "Delivery time estimates are provided at checkout but are not guaranteed. Delays may occur due to traffic, weather, or high order volume.",
              "Delivery fees are calculated based on your location and are displayed clearly before payment.",
              "Original delivery fees are non-refundable unless the return or cancellation was caused by our error.",
              "Someone must be available to receive the delivery at the specified address. Failed deliveries due to unavailability may incur a redelivery fee.",
              "truevenix is not liable for delays caused by circumstances outside our reasonable control, including force majeure events.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 7. Cancellations & Refunds */}
        <Card>
          <SectionHeading number="7" title="Cancellations & Refunds" />
          <ul className="flex flex-col gap-1.5">
            {[
              "Orders may be cancelled before they are dispatched. Once an order has been dispatched, it cannot be cancelled.",
              "Returns and refunds are governed by our separate Return & Exchange Policy available at truevenix.com/return-policy.",
              "Approved refunds are processed within 1–3 business days after the return has been verified and accepted.",
              "Products that are damaged, misused, or show signs of tampering after delivery are not eligible for return or refund.",
              "If you receive a wrong or defective item, contact us within 48 hours of delivery to initiate a resolution.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 8. Acceptable Use */}
        <Card>
          <SectionHeading number="8" title="Acceptable Use" />
          <ul className="flex flex-col gap-1.5">
            {[
              "You will not use our platform for any unlawful purpose or in any way that may harm truevenix, our staff, or other customers.",
              "You will not attempt to gain unauthorised access to any part of our systems or another user's account.",
              "You will not submit false, misleading, or fraudulent orders, reviews, or payment information.",
              "Scraping, crawling, or automated data collection from our platform without prior written consent is prohibited.",
              "truevenix reserves the right to suspend or terminate accounts that violate these acceptable use standards.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 9. Intellectual Property */}
        <Card>
          <SectionHeading number="9" title="Intellectual Property" />
          <ul className="flex flex-col gap-1.5">
            {[
              "All content on the truevenix platform — including logos, images, text, product descriptions, and software — is owned by or licensed to truevenix and is protected by applicable intellectual property laws.",
              "You may not reproduce, distribute, display, or create derivative works from any content without our prior written permission.",
              "The truevenix name and brand may not be used in any way that implies affiliation, endorsement, or sponsorship without our explicit authorisation.",
              "User-submitted content such as reviews or feedback may be displayed and moderated by truevenix for quality and safety purposes.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 10. Privacy */}
        <Card>
          <SectionHeading number="10" title="Privacy & Data" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Your use of truevenix is subject to our Privacy Policy, which explains how we collect,
            use, store, and protect your personal information. By using our platform, you consent
            to the data practices described therein.
          </p>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-opacity hover:opacity-80"
            style={{ background: PRIMARY_LIGHT, color: PRIMARY, borderColor: PRIMARY_BORDER }}
          >
            <Eye size={14} /> Read Our Privacy Policy
          </Link>
        </Card>

        {/* 11. Limitation of Liability */}
        <Card>
          <SectionHeading number="11" title="Limitation of Liability" />
          <div className="flex items-start gap-3 p-4 rounded-xl mb-4 bg-amber-50 border border-amber-100">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800 font-semibold leading-relaxed">
              Our services are provided on an "as available" basis. To the maximum extent permitted
              by Nigerian law, truevenix's total liability for any claim shall not exceed the total
              amount you paid for the relevant order.
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {[
              "We are not liable for any indirect, incidental, special, or consequential loss arising from your use of our services.",
              "We do not guarantee that the platform will be error-free, uninterrupted, or free from harmful components.",
              "We are not liable for delays or failures caused by events beyond our reasonable control, including power outages, flooding, or other force majeure events.",
              "truevenix is not responsible for the actions or omissions of third-party delivery partners once an item has been dispatched.",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 12. Disputes */}
        <Card>
          <SectionHeading number="12" title="Disputes & Resolution" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We aim to resolve all concerns quickly and fairly. If you have a dispute:
          </p>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Contact Our Team",
                desc: "Reach out via email or phone. Most issues are resolved at this stage within 24–48 hours.",
              },
              {
                step: "2",
                title: "Escalate to Management",
                desc: "If unresolved, you may request escalation to a senior manager who will review your case within 3 business days.",
              },
              {
                step: "3",
                title: "Mediation",
                desc: "If we cannot resolve the matter informally, both parties agree to attempt good-faith mediation before pursuing legal proceedings.",
              },
              {
                step: "4",
                title: "Legal Proceedings",
                desc: "Unresolved disputes will be governed by the laws of the Federal Republic of Nigeria. Any proceedings must be brought in the courts of Abuja, FCT, and filed within one (1) year of the relevant event.",
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

        {/* 13. Modifications */}
        <Card>
          <SectionHeading number="13" title="Modifications to These Terms" />
          <p className="text-sm text-gray-600 leading-relaxed">
            truevenix reserves the right to update or modify these Terms at any time. Where changes
            are material, we will notify registered users via email at least 7 days before the
            changes take effect. Your continued use of the platform after any update constitutes
            your acceptance of the revised Terms.
          </p>
        </Card>

        {/* 14. Governing Law */}
        <Card>
          <SectionHeading number="14" title="Governing Law" />
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the
            Federal Republic of Nigeria. If any provision is found to be invalid or unenforceable,
            the remaining provisions shall continue in full force and effect.
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
          <h3 className="text-base font-bold text-gray-900 mb-4">Questions About These Terms?</h3>
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
              href="/privacy-policy"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: PRIMARY }}
            >
              <Shield size={14} /> Privacy Policy
            </Link>
            <Link
              href="/return-policy"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
              style={{ border: `2px solid ${PRIMARY}`, color: PRIMARY }}
            >
              <RotateCcw size={14} /> Return Policy
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors"
            >
              <Truck size={14} /> Browse Products
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} truevenix. All rights reserved. &nbsp;·&nbsp; truevenix.com
          </p>
        </Card>

      </div>
    </div>
  )
}