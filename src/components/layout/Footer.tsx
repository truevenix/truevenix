// Updated Footer.tsx
"use client"

import Link from "next/link"
import {
  Mail, MapPin, Phone,ShieldCheck,Truck,Wrench,
} from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import Image from "next/image"
import { Space_Grotesk } from "next/font/google"

const brandFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
})

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "Phones", href: "/shop?category=phones" },
      { label: "Computers", href: "/shop?category=computers" },
      { label: "Solar", href: "/shop?category=solar" },
      { label: "Gadgets", href: "/shop?category=gadgets" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track order", href: "/orders" },
      { label: "Checkout", href: "/checkout" },
      { label: "Contact", href: "/contact" },
      { label: "Help center", href: "/help" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
]

const SOCIALS = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Twitter", href: "#" },
]

function FooterLink({
  href,
  children,
  theme,
}: {
  href: string
  children: React.ReactNode
  theme: any
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors duration-200"
      style={{ color: "#D0D5DD" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = theme.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#D0D5DD"
      }}
    >
      {children}
    </Link>
  )
}

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="text-white" style={{ backgroundColor: "#101828" }}>
      <div className="max-w-7xl mx-auto px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src={theme.logo} alt="truevenix logo" width={24} height={24} className="h-10 w-10" />
              <span
                  className={`${brandFont.className} text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap`}
                  style={{ color: theme.primary }}
                >
                  TRUEVENIX
                </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6" style={{ color: "#98A2B3" }}>
              Reliable electronics, solar gear, computers, phones, and accessories with fast ordering and clear delivery updates.
            </p>

            <div className="mt-5 grid gap-2.5 text-sm" style={{ color: "#D0D5DD" }}>
              <span className="flex items-center gap-2.5">
                <MapPin size={15} style={{ color: theme.primary }} />
                Shop A31, Emab Plaza, Aminu Kanu Crescent, Wuse 2, FCT Abuja, Nigeria
              </span>
              <span className="flex items-center gap-2.5">
                <Phone size={15} style={{ color: theme.primary }} />
                +234 810 644 9926
              </span>
              <span className="flex items-center gap-2.5">
                <Mail size={15} style={{ color: theme.primary }} />
                support@truevenix.com
              </span>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase" style={{ color: theme.primary }}>
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href} theme={theme}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-3 border-t pt-8 sm:grid-cols-3" style={{ borderColor: "#344054" }}>
          {[
            { icon: ShieldCheck, label: "Verified products" },
            { icon: Truck, label: "Guest order tracking" },
            { icon: Wrench, label: "Warranty support" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold"
              style={{ backgroundColor: "#1D2939", color: "#D0D5DD" }}>
              <Icon size={18} style={{ color: theme.primary }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-t pb-20" style={{ borderColor: "#344054" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#98A2B3" }}>
            © {new Date().getFullYear()} truevenix. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-colors duration-200"
                style={{ backgroundColor: "#1D2939" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1D2939"}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            {[
              {label:"Privacy Policy",href:"/privacy-policy"},
              {label:"Terms of Service",href:"/terms-and-conditions"}
            ].map(item=>(
              <Link key={item.href} href={item.href}
                style={{color:"#D0D5DD"}}
                onMouseEnter={(e)=>e.currentTarget.style.color=theme.primary}
                onMouseLeave={(e)=>e.currentTarget.style.color="#D0D5DD"}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
