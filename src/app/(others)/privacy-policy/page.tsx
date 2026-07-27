import {
  Shield,
  Eye,
  Lock,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Bell,
  Users,
  CreditCard,
  Globe,
  FileText,
  AlertCircle,
  ShoppingCart,
  ArrowRight,
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

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: PRIMARY }} />
      <span>{children}</span>
    </li>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div style={{ background: PRIMARY }} className="text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Privacy Policy</h1>
          <p className="text-red-100 text-sm max-w-lg mx-auto leading-relaxed">
            <span className="text-white font-semibold">truevenix</span> is committed to protecting
            your personal information. This policy explains what we collect, how we use it, and
            your rights.
          </p>
          <p className="text-red-200 text-xs mt-4 font-semibold uppercase tracking-widest">
            Effective Date: June 2026 &nbsp;·&nbsp; truevenix.com
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-6">

        {/* 1. Introduction */}
        <Card>
          <SectionHeading number="1" title="Introduction" />
          <p className="text-sm text-gray-600 leading-relaxed">
            truevenix is a Nigerian electronics and gadgets e-commerce platform. We value your
            privacy and are committed to handling your personal information responsibly. This policy
            describes the data we collect, how it is used, who it may be shared with, and the
            rights available to you as a user of our platform.
          </p>
        </Card>

        {/* 2. Information We Collect */}
        <Card>
          <SectionHeading number="2" title="Information We Collect" />
          <p className="text-sm text-gray-600 mb-4">Depending on how you use truevenix, we may collect:</p>
          <div className="flex flex-col gap-5">
            {[
              {
                icon: Users,
                title: "Account Information",
                items: [
                  "Full name, email address, and phone number",
                  "Password (stored in encrypted form, never in plain text)",
                  "Profile image and account preferences",
                ],
              },
              {
                icon: ShoppingCart,
                title: "Order Information",
                items: [
                  "Products selected, quantities, variants, and order history",
                  "Delivery address and contact details for fulfilment",
                  "Cart contents and saved items",
                ],
              },
              {
                icon: CreditCard,
                title: "Payment Information",
                items: [
                  "Billing details and chosen payment method",
                  "Transaction records, invoice history, and payment status",
                  "Full card numbers are never stored by us — all payments are processed by Paystack's secure PCI-compliant infrastructure",
                ],
              },
              {
                icon: Bell,
                title: "Communications",
                items: [
                  "Messages, inquiries, and feedback you send us",
                  "Customer service interactions and dispute submissions",
                  "Marketing preferences and consent records",
                ],
              },
            ].map(({ icon: Icon, title, items }) => (
              <div key={title}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: PRIMARY_LIGHT }}
                  >
                    <Icon size={13} style={{ color: PRIMARY }} />
                  </div>
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                </div>
                <ul className="flex flex-col gap-1 ml-9">
                  {items.map((item) => <BulletItem key={item}>{item}</BulletItem>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* 3. How We Use Your Information */}
        <Card>
          <SectionHeading number="3" title="How We Use Your Information" />
          <p className="text-sm text-gray-600 mb-4">Your information is used to:</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Create and manage your truevenix account",
              "Process and fulfil your orders, including delivery coordination",
              "Process payments, generate invoices, and manage refunds",
              "Send order confirmations, shipping updates, and service notifications",
              "Respond to your inquiries and customer service requests",
              "Improve our platform, personalise your experience, and enhance product recommendations",
              "Detect and prevent fraud, ensure platform security, and comply with legal obligations",
              "Send promotional communications where you have given consent",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 4. Sharing of Information */}
        <Card>
          <SectionHeading number="4" title="Sharing of Information" />
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-4 text-sm font-semibold"
            style={{ background: PRIMARY_LIGHT, border: `1px solid ${PRIMARY_BORDER}`, color: PRIMARY }}
          >
            <Lock size={15} className="flex-shrink-0 mt-0.5" style={{ color: PRIMARY }} />
            We do not sell your personal information to third parties. Ever.
          </div>
          <p className="text-sm text-gray-600 mb-3">We may share your information only in the following circumstances:</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "With Paystack and banking partners strictly for the purpose of processing your payments",
              "With delivery personnel solely to complete your order fulfilment",
              "With regulatory authorities and law enforcement when required by Nigerian law or a valid court order",
              "With third-party service providers who assist in operating our platform, subject to confidentiality agreements",
              "With your explicit permission for any specific third-party integrations you opt into",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
        </Card>

        {/* 5. Data Security */}
        <Card>
          <SectionHeading number="5" title="Data Security" />
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            We implement strong technical and administrative safeguards to protect your personal information:
          </p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Encrypted databases with access controls limited to authorised personnel",
              "SSL encryption for all data transmitted through our platform",
              "Hashed and salted password storage so your password is never readable",
              "Paystack-grade PCI-compliant payment infrastructure for all financial transactions",
              "Regular security reviews and vulnerability assessments",
            ].map((item) => <BulletItem key={item}>{item}</BulletItem>)}
          </ul>
          <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              No online system is completely immune to risk. We encourage you to use a strong,
              unique password and contact us immediately if you suspect any unauthorised activity on
              your account.
            </p>
          </div>
        </Card>

        {/* 6. Data Retention */}
        <Card>
          <SectionHeading number="6" title="Data Retention" />
          <p className="text-sm text-gray-600 leading-relaxed">
            We retain your personal information only for as long as necessary to provide our
            services and fulfil the purposes described in this policy, unless a longer period is
            required by Nigerian law. Order and transaction records may be retained to comply with
            tax and financial regulations. You may request deletion of your data at any time,
            subject to applicable legal obligations.
          </p>
        </Card>

        {/* 7. Your Rights */}
        <Card>
          <SectionHeading number="7" title="Your Rights" />
          <p className="text-sm text-gray-600 mb-4">You have the following rights over your personal information:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Eye, label: "Access", desc: "Request a copy of the personal data we hold about you" },
              { icon: FileText, label: "Correction", desc: "Ask us to correct inaccurate or incomplete information" },
              { icon: Trash2, label: "Deletion", desc: "Request deletion of your data, subject to legal obligations" },
              { icon: Lock, label: "Restriction", desc: "Object to or restrict certain processing activities" },
              { icon: Globe, label: "Portability", desc: "Receive your data in a structured, machine-readable format" },
              { icon: Bell, label: "Withdraw Consent", desc: "Withdraw consent at any time where processing is consent-based" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: PRIMARY_LIGHT }}
                >
                  <Icon size={13} style={{ color: PRIMARY }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            To exercise any of these rights, contact us using the details below. We aim to respond within 30 days.
          </p>
        </Card>

        {/* 8. Third-Party Services */}
        <Card>
          <SectionHeading number="8" title="Third-Party Services" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Our platform integrates with Paystack for payment processing. Paystack operates under
            its own privacy policy, which we encourage you to review separately. We are not
            responsible for the data practices of external services. Any third-party integrations
            we use are vetted to ensure they meet appropriate data protection standards.
          </p>
        </Card>

        {/* 9. Children */}
        <Card>
          <SectionHeading number="9" title="Children" />
          <p className="text-sm text-gray-600 leading-relaxed">
            Our services are intended for individuals who are at least 18 years old. We do not
            knowingly collect personal information from persons under 18. If you believe we have
            inadvertently collected information from a minor, please contact us immediately so we
            can promptly delete it.
          </p>
        </Card>

        {/* 10. Updates */}
        <Card>
          <SectionHeading number="10" title="Updates to This Policy" />
          <p className="text-sm text-gray-600 leading-relaxed">
            We may update this Privacy Policy periodically to reflect changes in our services,
            technology, or legal requirements. Material changes will be posted on this page with an
            updated effective date. Your continued use of our platform after changes are posted
            constitutes your acceptance of the updated policy.
          </p>
        </Card>

        {/* Contact */}
        <Card style={{ borderColor: PRIMARY_BORDER }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: PRIMARY }}>
            Contact Us
          </p>
          <h3 className="text-base font-bold text-gray-900 mb-4">Questions About Your Privacy?</h3>
          <div className="flex flex-col gap-3">
            <a
              href="mailto:support@truevenix.com"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: PRIMARY_LIGHT }}>
                <Mail size={14} style={{ color: PRIMARY }} />
              </div>
              support@truevenix.com
            </a>
            <a
              href="tel:+2347016341256"
              className="flex items-center gap-3 text-sm font-semibold text-gray-700 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: PRIMARY_LIGHT }}>
                <Phone size={14} style={{ color: PRIMARY }} />
              </div>
              +234 7016341256
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: PRIMARY_LIGHT }}>
                <MapPin size={14} style={{ color: PRIMARY }} />
              </div>
              truevenix · Abuja, Nigeria
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/terms-and-conditions"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: PRIMARY }}
            >
              <FileText size={14} /> Read Our Terms
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