"use client";

import { amountOnly, buildSchedule } from "@/lib/installment";
import {
  HeadsetArt,
  PowerBankArt,
  SolarGeneratorArt,
} from "./gadget-art";
import { Mascot } from "./Mascot";
import { TruevenixLogo } from "./theme-logo";

export type PlanCount = 2 | 3 | 4;

export const PLANS: PlanCount[] = [2, 3, 4];

export type MockProduct = {
  name: string;
  meta: string;
  price: number;
};

export const DEFAULT_PRODUCT: MockProduct = {
  name: "New Age 66000mAh Power Bank",
  meta: "22.5W fast charge · LED torch",
  price: 72000,
};

/** ₦ rendered as its own node so it can be optically sized down. */
function Naira({ className = "" }: { className?: string }) {
  return (
    <span className={`font-normal opacity-70 ${className}`}>{"\u20A6"}</span>
  );
}

/* ------------------------------------------------------------------ *
 * Floating product chip
 * ------------------------------------------------------------------ */

function GadgetChip({
  art,
  label,
  category,
  count,
  amount,
  className = "",
  rotate = "0deg",
  delay = "0s",
}: {
  art: React.ReactNode;
  label: string;
  category: string;
  count: number;
  amount: number;
  className?: string;
  rotate?: string;
  delay?: string;
}) {
  return (
    <div
      className={`tv-anim-float-soft absolute ${className}`}
      style={
        {
          "--tv-rot": rotate,
          animationDelay: delay,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center gap-[2cqw] rounded-[3.2cqw] border border-white/80 bg-white/95 p-[2.2cqw] shadow-[0_1.6cqw_3.4cqw_-1cqw_rgba(25,31,39,0.22)] backdrop-blur-sm">
        <div className="grid size-[9cqw] shrink-0 place-items-center rounded-[2.4cqw] bg-[color-mix(in_srgb,var(--theme-primary)_8%,transparent)]">
          <div className="size-[6.4cqw]">{art}</div>
        </div>
        <div className="min-w-0">
          <p className="text-[1.7cqw] font-bold uppercase tracking-[0.14em] text-[var(--theme-primary)]">
            {category}
          </p>
          <p className="truncate text-[2.2cqw] font-semibold leading-tight text-[#191F27]">
            {label}
          </p>
          <p className="mt-[0.4cqw] text-[2.1cqw] font-bold leading-none text-[#4A5262]">
            <span className="text-[var(--theme-primary)]">{count}&times;</span>{" "}
            <Naira className="text-[1.8cqw]" />
            {amountOnly(amount)}
            <span className="font-medium text-[#98A0AF]">/mo</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Mockup
 * ------------------------------------------------------------------ */

export function InstallmentMockup({
  plan,
  onPlanChange,
  product = DEFAULT_PRODUCT,
  className = "",
}: {
  plan: PlanCount;
  onPlanChange?: (plan: PlanCount) => void;
  product?: MockProduct;
  className?: string;
}) {
  const schedule = buildSchedule(product.price, plan);
  const perMonth = schedule[0].amount;

  return (
    <div
      className={`relative aspect-[100/126] w-full [container-type:inline-size] ${className}`}
    >
      {/* ---------------- panel ---------------- */}
      <div className="absolute inset-0 overflow-hidden rounded-[6cqw] border border-[color-mix(in_srgb,var(--theme-primary)_15%,white)] bg-[linear-gradient(158deg,color-mix(in_srgb,var(--theme-primary)_2%,white)_0%,color-mix(in_srgb,var(--theme-primary)_6%,white)_46%,color-mix(in_srgb,var(--theme-primary)_12%,white)_100%)]">
        <div className="absolute inset-0 tv-dots text-[color-mix(in_srgb,var(--theme-primary)_20%,transparent)] opacity-70" />
        <div className="absolute -left-[16cqw] -top-[12cqw] size-[52cqw] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--theme-primary)_20%,transparent),transparent_68%)] blur-[2cqw]" />
        <div className="absolute -bottom-[18cqw] -right-[10cqw] size-[56cqw] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--theme-primary)_12%,transparent),transparent_70%)] blur-[2cqw]" />
        <div className="absolute inset-0 tv-grain opacity-[0.05] mix-blend-multiply" />
      </div>

      {/* ---------------- decorative accents ---------------- */}
      <svg
        viewBox="0 0 100 126"
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d="M3 5 Q8 0.5 13 4.5 T23 3"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M42.5 1.5 L47 6 L42.5 10.5 L38 6 Z"
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="0.7"
          opacity="0.85"
        />
        <path
          d="M38 6 H47"
          stroke="var(--theme-primary)"
          strokeWidth="0.45"
          opacity="0.85"
        />
        <path
          d="M1.5 28 L5.5 26.8 L3.2 32 Z"
          fill="var(--theme-primary)"
          opacity="0.8"
        />
        <path
          d="M43.5 27 L47.5 25.8 L45.2 31 Z"
          fill="var(--theme-primary)"
          opacity="0.55"
        />
        <path
          d="M92 116 L96.5 114.6 L94 120 Z"
          fill="var(--theme-primary)"
          opacity="0.7"
        />
        <circle cx="44.5" cy="20" r="1.1" fill="color-mix(in srgb, var(--theme-primary) 35%, transparent)" />
        <circle cx="2.6" cy="47" r="1.5" fill="color-mix(in srgb, var(--theme-primary) 35%, transparent)" />
        <circle cx="97" cy="112" r="1.2" fill="color-mix(in srgb, var(--theme-primary) 35%, transparent)" />
        <circle cx="55" cy="122" r="1" fill="color-mix(in srgb, var(--theme-primary) 35%, transparent)" />
        {/* floor shadow under the phone */}
        <ellipse
          cx="72"
          cy="109.5"
          rx="24"
          ry="2.6"
          fill="var(--theme-primary)"
          opacity="0.12"
        />
      </svg>

      {/* ---------------- phone ---------------- */}
      <div className="absolute left-[47cqw] top-[3cqw] h-[104cqw] w-[50cqw] -rotate-[1.6deg]">
        <div className="size-full rounded-[6.4cqw] bg-[#0B0F19] p-[1.1cqw] shadow-[0_5cqw_9cqw_-3cqw_rgba(11,15,25,0.5),0_1cqw_2cqw_-0.5cqw_rgba(11,15,25,0.3)]">
          <div className="relative flex size-full flex-col overflow-hidden rounded-[5.5cqw] bg-white">
            {/* notch */}
            <div className="flex shrink-0 justify-center pt-[1cqw]">
              <div className="h-[0.8cqw] w-[8cqw] rounded-full bg-[#E9EBF0]" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-[3.2cqw] pb-[0.8cqw] pt-[1.2cqw]">
              {/* app header */}
              <div className="flex shrink-0 items-center gap-[1.2cqw]">
                <TruevenixLogo className="size-[7cqw]" />
                <span className="text-[2cqw] font-extrabold tracking-[0.1em] text-[var(--theme-primary)]">
                  TRUEVENIX
                </span>
                <div className="ml-auto flex flex-col gap-[0.4cqw]">
                  <span className="block h-[0.3cqw] w-[3.2cqw] rounded-full bg-[#B9BFCB]" />
                  <span className="block h-[0.3cqw] w-[3.2cqw] rounded-full bg-[#B9BFCB]" />
                  <span className="block h-[0.3cqw] w-[3.2cqw] rounded-full bg-[#B9BFCB]" />
                </div>
              </div>

              {/* product */}
              <div className="mt-[1.8cqw] flex shrink-0 items-center gap-[1.8cqw] rounded-[2.6cqw] border border-[#F1F1F5] bg-[#FCFCFD] p-[1.6cqw]">
                <div className="grid size-[9.5cqw] shrink-0 place-items-center rounded-[2.2cqw] bg-[color-mix(in_srgb,var(--theme-primary)_8%,transparent)]">
                  <PowerBankArt className="size-[7cqw]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[2.1cqw] font-semibold leading-[1.2] text-[#191F27]">
                    {product.name}
                  </p>
                  <p className="mt-[0.4cqw] truncate text-[1.7cqw] leading-none text-[#98A0AF]">
                    {product.meta}
                  </p>
                </div>
                <p className="shrink-0 self-start text-[2.3cqw] font-bold leading-none text-[#191F27]">
                  <Naira className="text-[1.8cqw]" />
                  {amountOnly(product.price)}
                </p>
              </div>

              {/* plan tabs */}
              <p className="mt-[2.2cqw] shrink-0 text-[1.65cqw] font-bold uppercase tracking-[0.16em] text-[#98A0AF]">
                Split this payment
              </p>
              <div className="mt-[1cqw] flex shrink-0 gap-[1.2cqw]">
                {PLANS.map((p) => {
                  const active = p === plan;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPlanChange?.(p)}
                      aria-pressed={active}
                      className={`flex-1 rounded-[2cqw] border py-[1.2cqw] text-[2.2cqw] font-bold transition-colors duration-200 ${
                        active
                          ? "border-transparent bg-[var(--theme-primary)] text-white shadow-[0_1cqw_2.4cqw_-0.8cqw_color-mix(in_srgb,var(--theme-primary)_60%,transparent)]"
                          : "border-[#EBECF1] bg-white text-[#7A8391] hover:border-[color-mix(in_srgb,var(--theme-primary)_35%,transparent)]"
                      }`}
                    >
                      {p}&times;
                    </button>
                  );
                })}
              </div>

              {/* per-month hero */}
              <div className="relative mt-[1.8cqw] shrink-0 overflow-hidden rounded-[2.6cqw] bg-[var(--theme-primary)] p-[2cqw]">
                <div className="absolute -right-[4cqw] -top-[6cqw] size-[18cqw] rounded-full bg-white/10" />
                <div className="absolute -bottom-[8cqw] right-[6cqw] size-[14cqw] rounded-full bg-white/[0.07]" />
                <p className="relative text-[1.6cqw] font-bold uppercase tracking-[0.16em] text-white/70">
                  You pay monthly
                </p>
                <div className="relative mt-[0.4cqw] flex items-end gap-[1.2cqw]">
                  <p className="text-[5.2cqw] font-extrabold leading-[0.95] tracking-tight text-white">
                    <span className="text-[3.4cqw] font-normal opacity-75">
                      {"\u20A6"}
                    </span>
                    {amountOnly(perMonth)}
                  </p>
                  <p className="pb-[0.4cqw] text-[1.8cqw] font-semibold leading-none text-white/80">
                    &times; {plan} months
                  </p>
                </div>
                <div className="relative mt-[1.2cqw] inline-flex items-center gap-[0.8cqw] rounded-full bg-white/20 px-[1.6cqw] py-[0.6cqw]">
                  <svg viewBox="0 0 12 12" className="size-[1.6cqw]">
                    <title>Included</title>
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.8"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[1.6cqw] font-bold text-white">
                    0% interest
                  </span>
                </div>
              </div>

              {/* schedule */}
              <div
                key={plan}
                className="relative mt-[1.6cqw] flex min-h-0 flex-1 flex-col justify-between gap-[0.7cqw]"
              >
                <div className="absolute bottom-[2.4cqw] left-[1.7cqw] top-[2.4cqw] w-[0.35cqw] rounded-full bg-[linear-gradient(to_bottom,transparent,#E9EBF2_12%,#E9EBF2_88%,transparent)]" />
                {schedule.map((item: any, i: number) => {
                  const paid = item.status === "paid";
                  return (
                    <div
                      key={item.index}
                      className="tv-anim-rise relative flex items-center gap-[1.8cqw]"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <span
                        className={`grid size-[3.8cqw] shrink-0 place-items-center rounded-full border-[0.4cqw] bg-white ${
                          paid
                            ? "border-[var(--theme-primary)]"
                            : "border-[#E1E4EC]"
                        }`}
                      >
                        {paid ? (
                          <span className="block size-[1.5cqw] rounded-full bg-[var(--theme-primary)]" />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[1.9cqw] font-semibold leading-none text-[#191F27]">
                          {item.label}
                        </p>
                        <p className="mt-[0.4cqw] truncate text-[1.6cqw] leading-none text-[#A3AAB7]">
                          {paid ? "Paid on checkout" : `Installment ${i + 1}`}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-[2cqw] font-bold leading-none ${
                          paid ? "text-[var(--theme-primary)]" : "text-[#3B4353]"
                        }`}
                      >
                        <Naira className="text-[1.6cqw]" />
                        {amountOnly(item.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* footer */}
              <div className="mt-[1.8cqw] flex shrink-0 items-center gap-[1.8cqw] border-t border-[#F1F1F5] pt-[1.6cqw]">
                <div className="min-w-0">
                  <p className="text-[1.5cqw] uppercase tracking-[0.14em] text-[#A3AAB7]">
                    Total
                  </p>
                  <p className="text-[2.2cqw] font-bold leading-tight text-[#191F27]">
                    <Naira className="text-[1.8cqw]" />
                    {amountOnly(product.price)}
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- floating gadget chips ---------------- */}
      <GadgetChip
        art={<HeadsetArt className="size-full" />}
        category="Headsets"
        label="Logitech H340"
        count={2}
        amount={24500}
        rotate="-2.5deg"
        delay="0.4s"
        className="left-[1.5cqw] top-[7cqw] w-[38cqw]"
      />
      <GadgetChip
        art={<SolarGeneratorArt className="size-full" />}
        category="Solar & Energy"
        label="2.5kVA Generator"
        count={4}
        amount={120000}
        rotate="2deg"
        delay="1.2s"
        className="left-[0.5cqw] top-[32cqw] w-[40cqw]"
      />

      {/* ---------------- mascot ---------------- */}
      <div className="absolute bottom-[2cqw] left-[3.5cqw] h-[64cqw] w-[49.4cqw]">
        <Mascot className="size-full" />
      </div>
    </div>
  );
}