"use client"
// components/EmptyOrderMockup.tsx
//
// Illustration for the "no orders yet / nothing found" state. Same
// self-theming trick as EmptyCartMockup and EmptyProfileMockup — every
// brand-colored path (the wordmark, the search pill, the Track button, the
// ghost order card's outline, the truck, the magnifying glass, the
// mascot's shirt/arms, the highlighted "Orders" nav dot) reads
// `var(--theme-primary)` / `color-mix(in srgb, var(--theme-primary) X%,
// transparent)` straight off whatever CategoryThemeProvider has written to
// <html>.
//
// The story: this one goes back to the cart mockup's pose — the mascot
// stands behind the phone, one fist gripping it from below to hold it up
// for you — but adds a second gesture that's new to this page: the other
// hand reaches up and over the top edge with a magnifying glass, peering
// down at the screen like it's genuinely hunting for an order that isn't
// there. What it's searching *for* is a dashed, ghost-outlined order card
// (a half-drawn package icon + placeholder lines instead of a real one) and
// a delivery route that never got past the driveway — a little truck at
// the start of a dotted line that trails off into an open, undefined pin.
// Nothing has shipped, so there's nothing to trace.
//
// Non-brand elements (phone bezel, skin tone, hair, ghost-card fill,
// placeholder bar grays, the plain nav-icon outlines) stay fixed — they're
// generic mockup chrome, not identity, so they don't shift with the theme.

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

  <!-- app header -->
  <rect x="34" y="40" width="12" height="10" rx="2" fill="none" stroke="var(--theme-primary)" stroke-width="1.3" />
  <path d="M37 40 Q40 34 43 40" stroke="var(--theme-primary)" stroke-width="1.2" fill="none" />
  <text x="52" y="49" font-size="9" font-weight="800" fill="var(--theme-primary)" letter-spacing="0.5">TRUEVENIX</text>

  <!-- order search row -->
  <rect x="32" y="60" width="126" height="24" rx="12" fill="#F1F1F5" stroke="#E3E3EA" />
  <circle cx="46" cy="72" r="4.5" stroke="#9A9AA6" stroke-width="1.5" fill="none" />
  <line x1="49.2" y1="75.2" x2="53" y2="79" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <rect x="60" y="68" width="50" height="4" rx="2" fill="#D8D8E0" />
  <rect x="120" y="64" width="32" height="16" rx="8" fill="var(--theme-primary)" />
  <text x="136" y="75" font-size="6.5" font-weight="800" fill="#FFFFFF" text-anchor="middle">Track</text>

  <!-- section label -->
  <text x="32" y="102" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">YOUR ORDERS</text>

  <!-- ghost / dashed order card -->
  <rect x="30" y="108" width="132" height="118" rx="16" fill="#FFFFFF" stroke="color-mix(in srgb, var(--theme-primary) 35%, transparent)" stroke-width="2" stroke-dasharray="6 5" />
  <rect x="46" y="124" width="34" height="30" rx="4" fill="none" stroke="color-mix(in srgb, var(--theme-primary) 45%, transparent)" stroke-width="2" />
  <path d="M46 134 L63 124 L80 134" fill="none" stroke="color-mix(in srgb, var(--theme-primary) 45%, transparent)" stroke-width="2" stroke-linejoin="round" />
  <line x1="63" y1="124" x2="63" y2="154" stroke="color-mix(in srgb, var(--theme-primary) 30%, transparent)" stroke-width="1.3" />
  <rect x="92" y="128" width="56" height="6" rx="3" fill="#E4E4EA" />
  <rect x="92" y="140" width="40" height="5" rx="2.5" fill="#EDEDF2" />
  <rect x="46" y="168" width="48" height="12" rx="6" fill="none" stroke="#E4E4EA" stroke-width="1.5" stroke-dasharray="3 3" />
  <rect x="46" y="192" width="100" height="5" rx="2.5" fill="#F0F0F0" />
  <rect x="46" y="203" width="70" height="5" rx="2.5" fill="#F0F0F0" />
  <rect x="46" y="214" width="85" height="5" rx="2.5" fill="#F0F0F0" />

  <!-- delivery route that never left the driveway -->
  <rect x="34" y="238" width="15" height="10" rx="1.5" fill="var(--theme-primary)" />
  <rect x="49" y="242" width="9" height="6" rx="1" fill="var(--theme-primary)" opacity="0.85" />
  <circle cx="41" cy="250" r="2.6" fill="#241C15" />
  <circle cx="53" cy="250" r="2.6" fill="#241C15" />
  <line x1="62" y1="244" x2="152" y2="244" stroke="#D8D8E0" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round" />
  <circle cx="156" cy="244" r="6" fill="none" stroke="#D8D8E0" stroke-width="2" stroke-dasharray="2 3" />
  <text x="107" y="266" font-size="7" font-weight="700" fill="#9A9AA6" text-anchor="middle">Nothing to track yet</text>

  <!-- bottom nav, Orders tab lit -->
  <line x1="25" y1="280" x2="190" y2="280" stroke="#F0F0F0" />
  <circle cx="46" cy="298" r="6" fill="none" stroke="#C8C8D2" stroke-width="1.5" />
  <circle cx="76" cy="298" r="6" fill="none" stroke="#C8C8D2" stroke-width="1.5" />
  <circle cx="106" cy="298" r="6" fill="none" stroke="#C8C8D2" stroke-width="1.5" />
  <circle cx="140" cy="298" r="7.5" fill="var(--theme-primary)" />
  <circle cx="172" cy="298" r="6" fill="none" stroke="#C8C8D2" stroke-width="1.5" />

  <!-- left fist, holding the phone up (same grip as the cart mockup) -->
  <path d="M225 300 C 175 300, 120 300, 82 297" fill="none" stroke="var(--theme-primary)" stroke-width="30" stroke-linecap="round" />
  <circle cx="90" cy="298" r="15" fill="none" stroke="#FFC229" stroke-width="6" />
  <circle cx="62" cy="297" r="15" fill="#9C6B45" />
  <path d="M54 291 q8 -4 16 0" stroke="#241C15" stroke-width="1" opacity="0.25" fill="none" />

  <!-- right arm, reaching up with the magnifying glass -->
  <path d="M215 155 C 205 128, 198 98, 193 76" stroke="var(--theme-primary)" stroke-width="10" fill="none" stroke-linecap="round" />
  <circle cx="190" cy="70" r="9" fill="#9C6B45" />
  <circle cx="178" cy="50" r="13" fill="none" stroke="var(--theme-primary)" stroke-width="3.5" />
  <line x1="187" y1="59" x2="197" y2="69" stroke="var(--theme-primary)" stroke-width="4.5" stroke-linecap="round" />
  <path d="M172 44 q4 -4 8 0" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" fill="none" />

  <!-- head, drawn last so it sits in front of the reaching arm -->
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

export function EmptyOrderMockup({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="No orders yet illustration"
      dangerouslySetInnerHTML={{ __html: SVG_MARKUP }}
    />
  )
}