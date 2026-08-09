"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, MapPin, Clock, ShieldCheck,
  Truck, Wrench, Camera, Sun, Zap, Code2, GraduationCap,
  BadgeCheck, CircleCheck,
} from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

// ── Motion ──────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

// ── Data ────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Sun,
    title: "Solar Installation & Maintenance",
    body: "We install solar power systems and provide ongoing maintenance to keep them running.",
  },
  {
    icon: Camera,
    title: "CCTV Installation & Maintenance",
    body: "Surveillance systems installed and maintained for homes, offices, and businesses.",
  },
  {
    icon: Zap,
    title: "Electrical & Electronic Projects",
    body: "Custom electrical work and machine installation handled by our in-house engineers.",
  },
  {
    icon: Code2,
    title: "Programming & IoT",
    body: "Software and IoT builds delivered by our development team — 50+ projects to date.",
  },
  {
    icon: GraduationCap,
    title: "Final-Year Project Support",
    body: "We help engineering students design and build their final-year electrical projects.",
  },
];

const SPECS = [
  { k: "Location",  v: "Shop A31, Emab Plaza" },
  { k: "Area",      v: "Aminu Kanu Crescent, Wuse 2" },
  { k: "City",      v: "Abuja, FCT, Nigeria" },
  { k: "Hours",     v: "Mon – Sat, 9:00 – 19:00" },
];

type Installation = {
  images: string[];
  caption: string;
};

const INSTALLATIONS : Installation[] = [
  {
    images: ["/installation1.jpg"],
    caption: "Three 25kWh/48V Felicity Lithium Iron Phosphate batteries installed and commissioned on site, paired with multiple inverters to deliver reliable full-day backup power. The solar energy storage system is designed to support the operations of a full supermarket, including refrigeration systems and a cold room powered by an LG cooling unit rated at 12,000 BTU/h with a 1.17kW power consumption, ensuring uninterrupted preservation of perishable goods and smooth business operations even during power outages.",
  },
  {
    images: ["/installation2.jpg"],
    caption: "Installation of 2 Felicity Solar Hybrid Inverters (10kW each, 48V DC) and 2 Felicity Lithium Batteries (51.2V, 200Ah, 10.24kWh each) to provide reliable and uninterrupted power for a full-scale restaurant operation. The system is designed to efficiently power critical loads including refrigerators, freezers, air conditioners, lighting, baking equipment, bread production machines, kitchen appliances, and other commercial electrical loads. This solar energy solution ensures stable power supply, reduced dependence on the grid, improved energy efficiency, and extended backup capacity for seamless daily business operations.",
  },
  {
    images: ["/installation6.jpg"],
    caption: "Installation of commercial electric food dehydrators in Abuja, Nigeria, used for drying and preserving food items at controlled temperatures. These multi-tray stainless steel units support efficient, large-scale food processing for businesses looking to extend shelf life and maintain product quality.",
  },
  {
    images: ["/installation3.jpg"],
    caption: "Unboxing and installation preparation of a 25kWh/48V Felicity Lithium Iron Phosphate (LiFePO₄) battery system. This high capacity energy storage solution is designed to power an entire home with clean, reliable backup electricity, delivering long lasting performance for lights, air conditioners, refrigerators, TVs, water pumps, and other essential appliances while reducing dependence on fuel generators.",
  },
   {
  images: ["/installation8.jpg", "/installation7.jpg"],
  caption: "Successful upgrade from Starlink Gen 2 to the latest Starlink Gen 3 dish at a residential property in Jahi, Abuja. The new Gen 3 hardware delivers improved performance, a slimmer profile, and better reliability. installed on the rooftop alongside an existing solar panel array we integrated before for a fully integrated power and connectivity setup.",},
  {
    images: ["/installation4.jpg"],
    caption: "Solar panel installation in progress on site in Abuja, Nigeria, building a reliable renewable energy system for uninterrupted power supply across homes and businesses in Nigeria.",
  },
  {
    images: ["/installation5.jpg"],
    caption: "Complete CCTV surveillance installation for a supermarket in Lagos, Nigeria, featuring Hikvision high definition security cameras and a 360 degree PTZ control camera for full area monitoring. This intelligent security system provides crystal clear video coverage, remote viewing, and enhanced protection for customers, staff, inventory, and business operations around the clock.",
  },

];

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <>
    <Navbar showSearch={false} />
    
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO — looping video of recent work ─────────────────────── */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-gray-900">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.webm"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 h-full flex items-center px-6">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-6xl mx-auto w-full"
          >
           <motion.h1
  variants={fadeUp}
  className="hero-font mb-15 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white text-center"
>
  Small Steps Today {" "} <br/>
  <span className="text-primary">Big Impact Tomorrow</span>
</motion.h1>
            <motion.p variants={fadeUp} className="  text-[#fca966] flex flex-col item-center justify-center text-xl text-center md:text-2xl leading-relaxed ">
              Engineering First. Renewable Energy. Security & Trust.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── HERO CTAs ────────────────────────────────────────────────── */}
      <section className="py-10 px-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-500"
            style={{ backgroundColor: theme.primary, color: "white" }}
          >
            Shop Products <ArrowRight size={15} />
          </Link>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ borderColor: theme.border }}
          >
            Book an Installation
          </Link>
        </div>
      </section>

      {/* ── WHO WE ARE ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <span
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Who We Are
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-primary mt-2 mb-6 tracking-tight">
              A team of engineers, working across disciplines.
            </h2>
         <div className="space-y-5 text-gray-600 leading-relaxed text-base md:text-lg">
  <p>
    TrueVenix is made up of engineers covering solar installation, electrical
    machine installation, and complete house wiring - the physical, hands-on work
    that keeps power running safely in homes and businesses.
  </p>
  <p>
    We also handle industrial machinery installation and conversion, executed with
    precision from initial setup through to full commissioning, backed by ongoing
    maintenance and technical support to keep equipment running efficiently and
    minimize downtime — including energy conversion work between gasoline, CNG, and
    electric systems, such as CNG-to-electric and electric-to-CNG conversions across
    a range of equipment sizes and capacities.
  </p>
  <p>
    Solar power installation is a core part of what we do, from Felicity lithium
    batteries to Felicity and Deye inverters, sized and installed to keep homes,
    supermarkets, restaurants, and other businesses running through power outages.
  </p>
  <p>
    Our team also handles CCTV installation, general IT engineering, and
    networking, including Starlink setup and full building network infrastructure,
    alongside software engineering, IoT, and real-time systems built for practical
    use.
  </p>
  <p>
    We also plan and architect digital products — websites, apps, and AI-driven
    tools and have helped different brands build their websites and apps in ways
    that go on to support their sales. Our engineers work hand in hand with our
    designers at every stage, from architecture through to the final interface, so
    what gets built actually works the way it was planned.
  </p>
</div>
          </motion.div>
        </div>
      </section>

      {/* ── RECENT INSTALLATIONS ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-2xl mb-14"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Our Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 tracking-tight">
              Installations, on site.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
       {INSTALLATIONS.map((item, i) => {
  const { images, caption } = item;

  return (
    <motion.div
      key={`${images[0] ?? "image"}-${i}`}
      variants={fadeUp}
      className="rounded-xl border overflow-hidden transition-colors duration-500"
      style={{ borderColor: theme.border }}
    >
      <div className="w-full aspect-[3/4] bg-gray-100">
        {images.length === 1 ? (
          <Image
            src={images[0]}
            alt={caption}
            width={700}
            height={500}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="grid grid-cols-2 h-full gap-0.5">
            {images.map((src, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <Image
                  src={src}
                  alt={`${caption} — image ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-gray-500 leading-relaxed">{caption}</p>
      </div>
    </motion.div>
  );
})}
          </motion.div>
        </div>
      </section>

      {/* ── OUR SERVICES ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-2xl mb-12"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Beyond Retail
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4 tracking-tight">
              An engineering team, not just a storefront.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Alongside our online shop, our engineers and developers install, build, and
              maintain electrical and electronic systems on the ground.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {SERVICES.map(({ icon: Icon, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="p-6 rounded-xl border transition-colors duration-500"
                style={{ borderColor: theme.border, backgroundColor: theme.bg }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 transition-colors duration-500"
                  style={{ backgroundColor: "white", border: `1px solid ${theme.border}` }}
                >
                  <Icon size={18} style={{ color: theme.primary }} />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      
      {/* ── FIND US ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <span
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Find Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-5 tracking-tight">
              Visit our office in Abuja.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Test a device in person, ask any question, or talk to us about an installation.
              We're at Emab Plaza, Wuse 2, ready to help.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-2xl p-7 md:p-8 bg-white border transition-colors duration-500"
            style={{ borderColor: theme.border }}
          >
            <dl className="space-y-5">
              {SPECS.map(({ k, v }) => (
                <div key={k} className="flex items-start justify-between gap-6">
                  <dt className="text-xs uppercase tracking-wider text-gray-400 pt-0.5 shrink-0 font-semibold">
                    {k}
                  </dt>
                  <dd className="text-gray-900 text-sm md:text-base font-medium text-right">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs text-gray-400">
                <Clock size={13} style={{ color: theme.primary }} />
                Closed Sundays & public holidays
              </span>
              <Link
                href="https://www.google.com/maps/search/?api=1&query=New+Banex+Plaza+Aminu+Kanu+Crescent+Wuse+2+Abuja"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-colors duration-500"
                style={{ color: theme.primary }}
              >
                <MapPin size={14} /> Directions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Ready to find your next device — or your next installation?
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Browse the catalogue online, or stop by Shop A31 at Emab Plaza, Wuse 2 Abuja — we're happy
              to help either way.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-bold text-sm transition-colors duration-500"
                style={{ backgroundColor: theme.primary, color: "white" }}
              >
                Shop Now <ArrowRight size={15} />
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-bold text-sm border transition-colors duration-500"
                style={{ borderColor: theme.border, color: theme.textColor }}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
    </>
  );
}