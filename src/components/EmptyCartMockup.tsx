"use client"

import { TruevenixLogo } from "./theme-logo"

// components/EmptyCartMockup.tsx



const SVG_MARKUP = `<svg viewBox="0 0 320 380" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">
  <!-- background accents -->
  <path d="M8 14 Q22 2 36 12 T66 8" stroke="var(--theme-primary)" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M256 20 L270 34 L256 48 L242 34 Z" fill="none" stroke="var(--theme-primary)" stroke-width="2.5" />
  <path d="M242 34 H270" stroke="var(--theme-primary)" stroke-width="1.5" />
  <path d="M206 28 L223 24 L215 44 Z" fill="var(--theme-primary)" />
  <path d="M278 76 L296 72 L287 92 Z" fill="var(--theme-primary)" opacity="0.9" />
  <path d="M300 128 L313 126 L306 140 Z" fill="var(--theme-primary)" opacity="0.85" />
  <circle cx="18" cy="60" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="305" cy="200" r="5" fill="color-mix(in srgb, var(--theme-primary) 15%, transparent)" />
  <circle cx="300" cy="300" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="12" cy="300" r="3" fill="color-mix(in srgb, var(--theme-primary) 25%, transparent)" />

  <!-- caricature torso, behind the phone -->
  <path d="M190 165 C 245 135, 305 145, 320 195 L 320 380 L 205 380 C 198 320, 188 225, 190 165 Z" fill="var(--theme-primary)" />
  <path d="M205 168 Q228 150 255 165" stroke="#FFFFFF" stroke-width="3" opacity="0.25" fill="none" stroke-linecap="round" />

  <!-- phone -->
  <rect x="15" y="15" width="185" height="320" rx="32" fill="#0B0F19" />
  <rect x="100" y="25" width="56" height="14" rx="7" fill="#0B0F19" />
  <rect x="25" y="27" width="165" height="296" rx="24" fill="#FFFFFF" />

  <!-- app header text (logo will be overlaid via React component) -->
  <text x="50" y="52" font-size="9" font-weight="800" fill="var(--theme-primary)" letter-spacing="0.5">TRUEVENIX</text>
  <rect x="170" y="42" width="14" height="10" rx="2" fill="none" stroke="var(--theme-primary)" stroke-width="1.3" />
  <circle cx="173" cy="54" r="1.3" fill="var(--theme-primary)" />
  <circle cx="181" cy="54" r="1.3" fill="var(--theme-primary)" />

  <!-- search bar -->
  <rect x="32" y="60" width="126" height="22" rx="11" fill="#F1F1F5" stroke="#E3E3EA" />
  <circle cx="44" cy="71" r="4" stroke="#9A9AA6" stroke-width="1.5" fill="none" />
  <line x1="47" y1="74" x2="50" y2="77" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <rect x="56" y="68" width="60" height="4" rx="2" fill="#D8D8E0" />

  <!-- category pills -->
  <rect x="32" y="90" width="28" height="22" rx="9" fill="#FFF4EA" stroke="#FDBA74" stroke-width="1.2" />
  <rect x="64" y="90" width="32" height="22" rx="9" fill="var(--theme-primary)" />
  <rect x="76" y="98" width="8" height="6" rx="1.5" fill="#FFFFFF" opacity="0.9" />
  <rect x="100" y="90" width="28" height="22" rx="9" fill="#E8F1FF" stroke="#BFD9FF" stroke-width="1" />
  <rect x="132" y="90" width="26" height="22" rx="9" fill="#E9FBF5" stroke="#B9EFDD" stroke-width="1" />

  <!-- section labels -->
  <text x="32" y="128" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">TRUEVENIX GADGETS</text>
  <text x="32" y="142" font-size="13" font-weight="800" fill="#111111">Browse Gadgets</text>

  <!-- filter pills -->
  <rect x="32" y="150" width="22" height="16" rx="8" fill="var(--theme-primary)" />
  <rect x="58" y="150" width="44" height="16" rx="8" fill="#EFEFF3" />
  <rect x="106" y="150" width="40" height="16" rx="8" fill="#EFEFF3" opacity="0.9" />

  <!-- product grid -->
  <!-- card 1 -->
  <rect x="29" y="172" width="74" height="68" rx="8" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="33" y="176" width="66" height="30" rx="6" fill="#F97316" />
  <rect x="36" y="179" width="16" height="9" rx="4.5" fill="#111111" />
  <circle cx="92" cy="183" r="5" fill="#FFFFFF" opacity="0.9" />
  <rect x="33" y="211" width="22" height="5" rx="2.5" fill="#C8C8D2" />
  <rect x="59" y="210" width="26" height="7" rx="3.5" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <rect x="33" y="221" width="58" height="5" rx="2.5" fill="#3A3A3A" opacity="0.6" />
  <text x="33" y="235" font-size="9" font-weight="800" fill="var(--theme-primary)">&#8358;55,000</text>

  <!-- card 2 -->
  <rect x="111" y="172" width="74" height="68" rx="8" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="115" y="176" width="66" height="30" rx="6" fill="#F97316" />
  <rect x="118" y="179" width="16" height="9" rx="4.5" fill="#111111" />
  <circle cx="174" cy="183" r="5" fill="#FFFFFF" opacity="0.9" />
  <rect x="115" y="211" width="22" height="5" rx="2.5" fill="#C8C8D2" />
  <rect x="141" y="210" width="26" height="7" rx="3.5" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <rect x="115" y="221" width="58" height="5" rx="2.5" fill="#3A3A3A" opacity="0.6" />
  <text x="115" y="235" font-size="9" font-weight="800" fill="var(--theme-primary)">&#8358;42,000</text>

  <!-- card 3 -->
  <rect x="29" y="248" width="74" height="68" rx="8" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="33" y="252" width="66" height="30" rx="6" fill="#22C55E" />
  <rect x="36" y="255" width="16" height="9" rx="4.5" fill="#111111" />
  <circle cx="92" cy="259" r="5" fill="#FFFFFF" opacity="0.9" />
  <rect x="33" y="287" width="22" height="5" rx="2.5" fill="#C8C8D2" />
  <rect x="59" y="286" width="26" height="7" rx="3.5" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <rect x="33" y="297" width="58" height="5" rx="2.5" fill="#3A3A3A" opacity="0.6" />
  <text x="33" y="311" font-size="9" font-weight="800" fill="var(--theme-primary)">&#8358;18,500</text>

  <!-- card 4 -->
  <rect x="111" y="248" width="74" height="68" rx="8" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="115" y="252" width="66" height="30" rx="6" fill="#F97316" />
  <rect x="118" y="255" width="16" height="9" rx="4.5" fill="#111111" />
  <circle cx="174" cy="259" r="5" fill="#FFFFFF" opacity="0.9" />
  <rect x="115" y="287" width="22" height="5" rx="2.5" fill="#C8C8D2" />
  <rect x="141" y="286" width="26" height="7" rx="3.5" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <rect x="115" y="297" width="58" height="5" rx="2.5" fill="#3A3A3A" opacity="0.6" />
  <text x="115" y="311" font-size="9" font-weight="800" fill="var(--theme-primary)">&#8358;65,000</text>

  <!-- left arm, fist (only hand shown, holding the phone) -->
  <path d="M225 300 C 175 300, 120 300, 82 297" fill="none" stroke="var(--theme-primary)" stroke-width="30" stroke-linecap="round" />
  <circle cx="90" cy="298" r="15" fill="none" stroke="#FFC229" stroke-width="6" />
  <circle cx="62" cy="297" r="15" fill="#9C6B45" />
  <path d="M54 291 q8 -4 16 0" stroke="#241C15" stroke-width="1" opacity="0.25" fill="none" />

  <!-- head -->
  <circle cx="236" cy="128" r="36" fill="#9C6B45" />
  <path d="M204 120 C 201 92, 220 74, 236 74 C 254 74, 271 91, 269 118 C 258 106, 247 100, 236 100 C 225 100, 212 108, 204 120 Z" fill="#241C15" />
  <circle cx="212" cy="86" r="6" fill="#241C15" />
  <circle cx="228" cy="76" r="6" fill="#241C15" />
  <circle cx="246" cy="76" r="6" fill="#241C15" />
  <circle cx="262" cy="88" r="6" fill="#241C15" />
  <circle cx="228" cy="134" r="2.2" fill="#241C15" />
  <circle cx="246" cy="132" r="2.2" fill="#241C15" />
  <path d="M224 146 Q236 154 250 142" stroke="#241C15" stroke-width="2" fill="none" stroke-linecap="round" />
</svg>`

export function EmptyCartMockup({ className }: { className?: string }) {
  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label="Empty cart illustration"
    >
      <div dangerouslySetInnerHTML={{ __html: SVG_MARKUP }} />
      
      {/* Truevenix logo overlaid at the correct position */}
      <div className="absolute left-[9.4%] top-[9%] w-[12.5%]">
        <TruevenixLogo className="w-full h-auto" />
      </div>
    </div>
  )
}