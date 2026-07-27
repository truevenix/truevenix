"use client";

import { useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, MessageCircle,
  ArrowRight, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/providers/theme-provider";

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

// ── Directions link (from the verified Google Maps location) ─────────────
const DIRECTIONS_URL =
  "https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=ng&sa=X&geocode=Kf3pL6wvDU4QMSlujI1lQTbS&daddr=Aminu+Kano+Cres,+Wuse,+Abuja+904101,+Federal+Capital+Territory";

// ── Contact info ───────────────────────────────────────────────────────────
// Replace the phone number(s) below with your actual line(s).
const CONTACT_INFO = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+234 7016341256", "+234 8125875261", "+234 8080693894"],
    action: "tel:+2347016341256",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["support@truevenix.com"],
    action: "mailto:support@truevenix.com",
  },
  {
    icon: MapPin,
    title: "Location",
    details: ["Shop A31, Emab Plaza, Aminu Kanu Crescent, Wuse 2", "Abuja, FCT, Nigeria"],
    action: DIRECTIONS_URL,
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon – Sat: 9:00 am – 7:00 pm", "Closed Sundays & public holidays"],
    action: "#hours",
  },
];

// ── Page ───────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { theme } = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const html = `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111;max-width:600px;margin:0 auto">
          <h2 style="margin:0 0 16px;color:${theme.primary};border-bottom:2px solid ${theme.border};padding-bottom:8px">
            New Contact Form — Truevenix
          </h2>
          <div style="background:${theme.bg};border-left:4px solid ${theme.primary};padding:16px;margin:16px 0;border-radius:4px">
            <p style="margin:0;color:${theme.textColor};font-weight:600">Customer Inquiry Received</p>
          </div>
          <table style="border-collapse:collapse;width:100%;background:#f8faf6;border-radius:8px;overflow:hidden">
            <tbody>
              <tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Name</td><td style="padding:12px 16px">${form.name}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Email</td><td style="padding:12px 16px">${form.email}</td></tr>
              ${form.phone ? `<tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Phone</td><td style="padding:12px 16px">${form.phone}</td></tr>` : ""}
              <tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Subject</td><td style="padding:12px 16px">${form.subject || "General Inquiry"}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Message</td><td style="padding:12px 16px;white-space:pre-wrap">${form.message}</td></tr>
              <tr><td style="padding:12px 16px;font-weight:600;background:#f0f0f0">Sent</td><td style="padding:12px 16px">${new Date().toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>`;

      const res = await fetch("/api/internal/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "support@truevenix.com",
          subject: `[Truevenix] New message from ${form.name}`,
          html,
          type: "CONTACT_FORM",
          priority: "MEDIUM",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      alert("Something went wrong. Please call us directly, or email support@truevenix.com");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all " +
    "bg-white border text-gray-900 placeholder:text-gray-400 focus:ring-2";

  return (
    <main className="bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Contact Us
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mt-3 mb-5 max-w-2xl tracking-tight"
            >
              Get in touch.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-600 text-lg leading-relaxed max-w-xl">
              Questions about a product, an installation, or a project you'd like us to take
              on? Our team is ready to help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:opacity-80 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Contact Us</span>
        </div>
      </div>

      {/* ── CONTACT INFO CARDS ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
              style={{ color: theme.textColor }}
            >
              Reach Out
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 tracking-tight">
              We'd love to hear from you.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {CONTACT_INFO.map(({ icon: Icon, title, details, action }) => (
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
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">
                  {title}
                </h3>
                {title === "Phone" ? (
                  details.map((d, i) => (
                    <a
                      key={i}
                      href={`tel:${d.replace(/\s+/g, "")}`}
                      className="block text-sm text-gray-500 leading-relaxed hover:underline"
                    >
                      {d}
                    </a>
                  ))
                ) : (
                  <a
                    href={action}
                    target={action.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="block"
                  >
                    {details.map((d, i) => (
                      <p key={i} className="text-sm text-gray-500 leading-relaxed">{d}</p>
                    ))}
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MAP + FORM ───────────────────────────────────────────────── */}
      <section className="py-6 px-6 pb-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Map ─────────────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideLeft}
              className="space-y-5"
            >
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
                  style={{ color: theme.textColor }}
                >
                  Find Us
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
                  Visit the Office
                </h3>
              </div>

              <div
                className="rounded-2xl overflow-hidden border transition-colors duration-500"
                style={{ borderColor: theme.border }}
              >
                <iframe
                  title="Truevenix Location — Emab Plaza, Wuse 2, Abuja"
                  src="https://maps.google.com/maps?q=Aminu+Kano+Cres,+Wuse,+Abuja+904101&output=embed&z=15"
                  width="100%"
                  height="380"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div
                className="rounded-2xl p-5 flex items-start gap-4 bg-white border transition-colors duration-500"
                style={{ borderColor: theme.border }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-500"
                  style={{ backgroundColor: theme.bg }}
                >
                  <MapPin size={16} style={{ color: theme.primary }} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Truevenix</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Shop A31, Emab Plaza, Aminu Kanu Crescent, Wuse 2, Abuja, FCT, Nigeria
                  </p>
                  <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold mt-2 transition-colors duration-500"
                    style={{ color: theme.primary }}
                  >
                    Get Directions <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form ────────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={slideRight}
            >
              <div
                className="rounded-2xl p-8 bg-white border transition-colors duration-500"
                style={{ borderColor: theme.border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle size={16} style={{ color: theme.primary }} />
                  <span
                    className="text-xs font-bold uppercase tracking-widest transition-colors duration-500"
                    style={{ color: theme.textColor }}
                  >
                    Send a Message
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-7 tracking-tight">
                  How can we help?
                </h3>

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-14 text-center gap-4"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500"
                      style={{ backgroundColor: theme.bg }}
                    >
                      <Send size={24} style={{ color: theme.primary }} />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">Message Sent!</h4>
                    <p className="text-sm text-gray-500">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-2 text-xs font-semibold underline transition-colors duration-500"
                      style={{ color: theme.primary }}
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-500">
                          Your Name *
                        </label>
                        <input
                          type="text" name="name" value={form.name} onChange={handleChange}
                          required placeholder="John Doe" className={inputCls}
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-500">
                          Email *
                        </label>
                        <input
                          type="email" name="email" value={form.email} onChange={handleChange}
                          required placeholder="john@email.com" className={inputCls}
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-500">
                          Phone
                        </label>
                        <input
                          type="tel" name="phone" value={form.phone} onChange={handleChange}
                          placeholder="+234 800 000 0000" className={inputCls}
                          style={{ borderColor: theme.border }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-500">
                          Subject
                        </label>
                        <div className="relative">
                          <select
                            name="subject" value={form.subject} onChange={handleChange}
                            className={inputCls + " appearance-none pr-8"}
                            style={{ borderColor: theme.border }}
                          >
                            <option value="">Select…</option>
                            <option>Product Inquiry</option>
                            <option>Installation Request</option>
                            <option>Order Issue</option>
                            <option>Final-Year Project Support</option>
                            <option>General Question</option>
                          </select>
                          <div
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] transition-colors duration-500"
                            style={{ color: theme.primary }}
                          >
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5 text-gray-500">
                        Message *
                      </label>
                      <textarea
                        rows={5} name="message" value={form.message} onChange={handleChange}
                        required placeholder="Tell us how we can help…"
                        className={inputCls + " resize-none"}
                        style={{ borderColor: theme.border }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: theme.primary, color: "white" }}
                    >
                      {loading ? "Sending…" : (
                        <>Send Message <Send size={14} /></>
                      )}
                    </button>

                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SOCIAL STRIP ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Follow Truevenix
            </h3>
            <p className="text-sm text-gray-500 mb-8">
              Stay updated with new products, installations, and project news.
            </p>
            <div className="flex justify-center gap-4">
              {[
                { label: "IG", href: "#", name: "Instagram" },
                { label: "FB", href: "#", name: "Facebook" },
                { label: "X",  href: "#", name: "Twitter / X" },
              ].map(({ label, href, name }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="w-11 h-11 rounded-full flex items-center justify-center border text-xs font-bold transition-colors duration-500"
                  style={{ borderColor: theme.border, backgroundColor: theme.bg, color: theme.primary }}
                >
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}