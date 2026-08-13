"use client";

import { useState } from "react";
import {
  amountOnly,
  splitInstallments,
  themeVars,
} from "@/lib/installment";
import {
  DEFAULT_PRODUCT,
  InstallmentMockup,
  PLANS,
  type MockProduct,
  type PlanCount,
} from "./Installment-mockup";
import { TruevenixLogo } from "./theme-logo";
import { useTheme } from "@/providers/theme-provider";

/* ------------------------------------------------------------------ *
 * Icons
 * ------------------------------------------------------------------ */

const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SplitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconBase}>
      <title>Split payment</title>
      <path d="M3 7h5a4 4 0 0 1 4 4v2a4 4 0 0 0 4 4h5" />
      <path d="M3 17h5a4 4 0 0 0 4-4" />
      <path d="M18 4l3 3-3 3" />
      <path d="M18 14l3 3-3 3" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconBase}>
      <title>No hidden fees</title>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8-7 9.5-4.1-1.5-7-5.2-7-9.5V6l7-3Z" />
      <path d="M9 12.2l2.1 2.1L15 10.4" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconBase}>
      <title>Instant decision</title>
      <path d="M13 2 4.5 13.2h6.2L10 22l8.7-11.4h-6.3L13 2Z" />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconBase}>
      <title>Ships immediately</title>
      <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5v-7Z" />
      <path d="M3 8.5 12 13l9-4.5M12 13v7" />
      <path d="M7.5 6.2 16.5 10.8" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconBase}>
      <title>Go</title>
      <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

const BENEFITS = [
  {
    icon: ShieldIcon,
    title: "0% interest, no hidden fees",
    body: "The price you see is the price you split. No service charge, no late-payment traps.",
  },
  {
    icon: BoltIcon,
    title: "Approved at checkout in seconds",
    body: "Pick your plan on the product page. No paperwork, no bank visit, no guarantor.",
  },
  {
    icon: BoxIcon,
    title: "Order Confirmed once first payment is made",
    body: "We package your order as soon as the first instalment lands — we don't wait for the last one.",
  },
];

const TRUST = [
  "Available for all products",
  "Debit or transfer",
  "Cancel anytime before dispatch",
  "No credit check, no guarantor",
];

export function InstallmentSection({
  product = DEFAULT_PRODUCT,
}: {
  product?: MockProduct;
}) {
  const [plan, setPlan] = useState<PlanCount>(4);
  const { theme } = useTheme();

  return (
    <section
      style={themeVars(theme.primary)}
      className="relative isolate overflow-hidden bg-[#FFFCFA] py-16 sm:py-20 lg:py-28"
    >
      {/* ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--tv-primary-35),transparent)]" />
        <div className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,var(--tv-primary-12),transparent_65%)]" />
        <div className="absolute -bottom-52 -left-40 size-[30rem] rounded-full bg-[radial-gradient(circle,var(--tv-primary-08),transparent_68%)]" />
        <div className="absolute inset-0 tv-dots text-[var(--tv-primary-12)] opacity-60" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1fr] lg:gap-16 xl:gap-24">
          {/* ---- 1. mockup — first in the DOM, so mobile sees it first ---- */}
          <div className="tv-anim-rise mx-auto w-full max-w-[26rem] sm:max-w-[30rem] lg:mx-0 lg:max-w-[31rem]">
            <InstallmentMockup
              plan={plan}
              onPlanChange={setPlan}
              product={product}
            />
          </div>

          {/* ---- 2. copy ---- */}
          <div
            className="tv-anim-rise"
            style={{ animationDelay: "120ms" }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--tv-primary-20)] bg-[var(--tv-primary-08)] py-1.5 pl-2 pr-3.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--tv-primary)]">
              <TruevenixLogo className="size-5" />
              Instalment payments
            </span>

            <h2 className="font-display mt-5 text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.025em] text-[#191F27] sm:text-5xl lg:text-[3.4rem]">
              Buy the gadget today.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-[var(--tv-primary)]">
                  Pay in 2, 3 or 4.
                </span>
                <svg
                  viewBox="0 0 340 16"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[0.55em] w-full text-[var(--tv-primary)]"
                >
                  <path
                    d="M3 11.5C64 4.5 232 2.5 337 8.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.28"
                    style={{
                      strokeDasharray: 360,
                      animation:
                        "tv-draw 1.1s cubic-bezier(0.22,1,0.36,1) 0.35s both",
                      ["--tv-dash" as string]: "360",
                    }}
                  />
                </svg>
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[#5B6472] sm:text-lg">
              Every product, including power banks, headsets, smartwatches and solar generators on
              truevenix can be spread across up to{" "}
              <strong className="font-semibold text-[#191F27]">
                four monthly payments
              </strong>
              . Choose your plan at checkout, pay the first instalment, and
              we&apos;ll confirm your order straight away.
            </p>

            {/* plan selector */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#98A0AF]">
                  Try a plan
                </p>
                <p className="text-[0.78rem] font-medium text-[#98A0AF]">
                  on a {"\u20A6"}
                  {amountOnly(product.price)} power bank
                </p>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
                {PLANS.map((p:any) => {
                  const per = splitInstallments(product.price, p)[0];
                  const active = p === plan;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlan(p)}
                      aria-pressed={active}
                      className={`group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 ${
                        active
                          ? "-translate-y-0.5 border-[var(--tv-primary)] bg-[var(--tv-primary-08)] shadow-[0_12px_28px_-14px_var(--tv-primary-60)]"
                          : "border-[#EAE6E2] bg-white hover:-translate-y-0.5 hover:border-[var(--tv-primary-35)]"
                      }`}
                    >
                      <span
                        className={`font-display block text-2xl font-extrabold leading-none transition-colors sm:text-[1.75rem] ${
                          active ? "text-[var(--tv-primary)]" : "text-[#191F27]"
                        }`}
                      >
                        {p}
                        <span className="text-[0.7em] font-bold">&times;</span>
                      </span>
                      <span className="mt-1.5 block text-[0.72rem] font-semibold uppercase tracking-wider text-[#98A0AF]">
                        {p} months
                      </span>
                      <span
                        className={`mt-2 block text-sm font-bold tabular-nums sm:text-[0.95rem] ${
                          active ? "text-[#191F27]" : "text-[#5B6472]"
                        }`}
                      >
                        <span className="font-normal opacity-60">
                          {"\u20A6"}
                        </span>
                        {amountOnly(per)}
                        <span className="text-[0.72rem] font-medium text-[#98A0AF]">
                          /mo
                        </span>
                      </span>
                      <span
                        className={`absolute right-3 top-3 grid size-4 place-items-center rounded-full bg-[var(--tv-primary)] text-white transition-all duration-300 sm:right-3.5 sm:top-3.5 ${
                          active ? "scale-100 opacity-100" : "scale-50 opacity-0"
                        }`}
                      >
                        <svg viewBox="0 0 12 12" className="size-2.5">
                          <title>Selected</title>
                          <path
                            d="M2.5 6.2 4.8 8.5 9.5 3.8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* benefits */}
            <ul className="mt-9 space-y-5 border-t border-[#F0E9E4] pt-8">
              {BENEFITS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--tv-primary-20)] bg-[var(--tv-primary-08)] text-[var(--tv-primary)]">
                    <Icon className="size-[1.15rem]" />
                  </span>
                  <div>
                    <p className="font-display text-[1.02rem] font-bold leading-snug text-[#191F27]">
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7381]">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--tv-primary)] px-7 py-3.5 text-[0.95rem] font-bold text-white shadow-[0_14px_30px_-12px_var(--tv-primary-60)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_var(--tv-primary-60)]"
              >
                Shop with instalments
                <ArrowIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E4DED9] bg-white px-7 py-3.5 text-[0.95rem] font-bold text-[#191F27] transition-colors duration-300 hover:border-[var(--tv-primary-35)] hover:text-[var(--tv-primary)]"
              >
                How it works
              </a>
            </div>

            {/* trust strip */}
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] font-medium text-[#8B93A1]">
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[var(--tv-primary-60)]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}