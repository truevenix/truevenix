"use client"
// components/EmptyProfileMockup.tsx
//
// Illustration for the "not signed in" profile state. Same self-theming
// trick as EmptyCartMockup: every brand-colored path — the wordmark, the
// header icon, the character's hair-free "shirt" (its arms), the section
// labels, the address-card home glyph, the card icon dots, and the Sign In
// pill — reads `var(--theme-primary)` / `color-mix(in srgb, var(--theme-primary)
// X%, transparent)` straight off whatever CategoryThemeProvider has written
// to <html>. Drop it into any category and it re-colors itself for free.
//
// The story, vs. the cart version: on the cart page the mascot stands
// *behind* the phone, one fist gripping it from outside, peering in at
// products that aren't there yet. Here there's nothing to peer at — there's
// no account yet — so the mascot climbs inside the frame instead, arms
// thrown open shoulder-to-shoulder like it's presenting the empty screen to
// you ("here's your profile — come fill it in"). Its open hands push past
// the glass edge on purpose, a small break-the-frame gesture that mirrors
// the cart illustration's torso bleeding off-canvas. The phone itself is
// widened to give those open arms somewhere to go.
//
// Everything below the arms — the name/email placeholder bars, the
// Personal Information card, the Saved Addresses card, the bottom Sign In
// pill — is decorative chrome tracing the real profile page's layout, the
// same way the cart mockup traced a product grid. None of it is
// interactive; it exists to make the empty state read as "this is what
// your profile will look like," with a real, clickable Sign In button
// living below the illustration in the page itself (see ProfilePage).
//
// Non-brand elements (phone bezel, skin tone, hair, card icon-chip fills,
// placeholder bar grays) are intentionally left as fixed colors — they're
// generic mockup chrome / sample content, not identity, so they shouldn't
// shift with the theme.

const SVG_MARKUP = `<svg viewBox="0 0 340 430" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">
  <!-- background accents -->
  <path d="M8 20 Q24 4 40 18 T74 14" stroke="var(--theme-primary)" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M300 26 L316 42 L300 58 L284 42 Z" fill="none" stroke="var(--theme-primary)" stroke-width="2.2" />
  <path d="M284 42 H316" stroke="var(--theme-primary)" stroke-width="1.3" />
  <path d="M312 88 L330 84 L321 104 Z" fill="var(--theme-primary)" opacity="0.85" />
  <path d="M298 156 L311 154 L304 168 Z" fill="var(--theme-primary)" opacity="0.8" />
  <path d="M12 236 L26 232 L18 250 Z" fill="var(--theme-primary)" opacity="0.85" />
  <circle cx="16" cy="76" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="322" cy="230" r="5" fill="color-mix(in srgb, var(--theme-primary) 15%, transparent)" />
  <circle cx="312" cy="344" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="14" cy="366" r="3" fill="color-mix(in srgb, var(--theme-primary) 25%, transparent)" />

  <!-- phone (wider than the cart version, no torso — the mascot lives inside now) -->
  <rect x="22" y="14" width="258" height="400" rx="36" fill="#0B0F19" />
  <circle cx="151" cy="20" r="3" fill="#1A1F2E" />
  <rect x="36" y="28" width="230" height="372" rx="26" fill="#FFFFFF" />

  <!-- app header -->
  <rect x="48" y="38" width="12" height="10" rx="2" fill="none" stroke="var(--theme-primary)" stroke-width="1.3" />
  <path d="M51 38 Q54 32 57 38" stroke="var(--theme-primary)" stroke-width="1.2" fill="none" />
  <text x="66" y="47" font-size="8" font-weight="800" fill="var(--theme-primary)" letter-spacing="0.4">TRUEVENIX</text>
  <line x1="246" y1="40" x2="258" y2="40" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <line x1="246" y1="44" x2="258" y2="44" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <line x1="246" y1="48" x2="258" y2="48" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />

  <!-- mascot head, standing in for the avatar -->
  <circle cx="151" cy="92" r="28" fill="#9C6B45" />
  <path d="M123 85 C 120 62, 136 48, 151 48 C 167 48, 183 62, 179 84 C 169 74, 159 68, 151 68 C 142 68, 132 76, 123 85 Z" fill="#241C15" />
  <circle cx="131" cy="58" r="4.5" fill="#241C15" />
  <circle cx="145" cy="50" r="4.5" fill="#241C15" />
  <circle cx="157" cy="50" r="4.5" fill="#241C15" />
  <circle cx="171" cy="60" r="4.5" fill="#241C15" />
  <circle cx="144" cy="94" r="2" fill="#241C15" />
  <circle cx="158" cy="92" r="2" fill="#241C15" />
  <path d="M140 104 Q151 111 163 101" stroke="#241C15" stroke-width="2" fill="none" stroke-linecap="round" />

  <!-- camera badge, echoing the real avatar upload affordance -->
  <circle cx="175" cy="114" r="8" fill="#FFFFFF" stroke="var(--theme-primary)" stroke-width="2" />
  <rect x="171" y="111" width="8" height="6" rx="1.3" fill="var(--theme-primary)" />
  <circle cx="175" cy="114" r="1.4" fill="#FFFFFF" />

  <!-- arms thrown open, shoulder to shoulder -->
  <path d="M132 128 C 104 130, 76 132, 54 130" stroke="var(--theme-primary)" stroke-width="14" fill="none" stroke-linecap="round" />
  <path d="M170 128 C 198 130, 226 132, 248 130" stroke="var(--theme-primary)" stroke-width="14" fill="none" stroke-linecap="round" />

  <!-- open hands, breaking past the glass edge on purpose -->
  <circle cx="52" cy="130" r="15" fill="none" stroke="#FFC229" stroke-width="3.5" />
  <circle cx="52" cy="130" r="12" fill="#9C6B45" />
  <circle cx="250" cy="130" r="15" fill="none" stroke="#FFC229" stroke-width="3.5" />
  <circle cx="250" cy="130" r="12" fill="#9C6B45" />
  <line x1="48" y1="119" x2="42" y2="108" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />
  <line x1="56" y1="118" x2="58" y2="105" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />
  <line x1="40" y1="126" x2="30" y2="122" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />
  <line x1="254" y1="119" x2="260" y2="108" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />
  <line x1="246" y1="118" x2="244" y2="105" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />
  <line x1="262" y1="126" x2="272" y2="122" stroke="#9C6B45" stroke-width="3.5" stroke-linecap="round" />

  <!-- name / email placeholders -->
  <rect x="121" y="152" width="60" height="10" rx="5" fill="#111111" opacity="0.85" />
  <rect x="112" y="168" width="10" height="8" rx="1" fill="none" stroke="#9A9AA6" stroke-width="1.3" />
  <path d="M112 168 L117 173 L122 168" stroke="#9A9AA6" stroke-width="1.1" fill="none" />
  <rect x="126" y="170" width="76" height="6" rx="3" fill="#D8D8E0" />

  <!-- personal information card -->
  <text x="44" y="196" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">PERSONAL INFORMATION</text>
  <rect x="41" y="198" width="220" height="92" rx="12" fill="#FFFFFF" stroke="#EDEDF2" />

  <rect x="47" y="204" width="18" height="18" rx="6" fill="#FEF3E2" />
  <circle cx="56" cy="213" r="3" fill="#D97706" />
  <rect x="72" y="210" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="210" width="48" height="6" rx="3" fill="#C8C8D2" />
  <line x1="47" y1="228" x2="257" y2="228" stroke="#F0F0F0" />

  <rect x="47" y="234" width="18" height="18" rx="6" fill="#E8F1FF" />
  <circle cx="56" cy="243" r="3" fill="#2563EB" />
  <rect x="72" y="240" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="240" width="48" height="6" rx="3" fill="#C8C8D2" />
  <line x1="47" y1="258" x2="257" y2="258" stroke="#F0F0F0" />

  <rect x="47" y="264" width="18" height="18" rx="6" fill="#E9FBF5" />
  <circle cx="56" cy="273" r="3" fill="#059669" />
  <rect x="72" y="270" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="270" width="48" height="6" rx="3" fill="#C8C8D2" />

  <!-- saved addresses card -->
  <text x="44" y="308" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">SAVED ADDRESSES</text>
  <text x="257" y="308" font-size="6.5" font-weight="800" fill="var(--theme-primary)" text-anchor="end">+ ADD</text>
  <rect x="41" y="310" width="220" height="52" rx="12" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="47" y="318" width="16" height="16" rx="6" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <path d="M49 326 L55 320 L61 326 Z" fill="var(--theme-primary)" />
  <rect x="51" y="326" width="8" height="6" fill="var(--theme-primary)" opacity="0.85" />
  <rect x="71" y="320" width="50" height="6" rx="3" fill="#3A3A3A" opacity="0.8" />
  <rect x="71" y="330" width="130" height="4" rx="2" fill="#C8C8D2" />
  <rect x="71" y="337" width="96" height="4" rx="2" fill="#C8C8D2" />
  <circle cx="244" cy="320" r="3" fill="color-mix(in srgb, var(--theme-primary) 15%, transparent)" />
  <circle cx="254" cy="320" r="3" fill="#FDE8E8" />

  <!-- decorative Sign In pill, tracing the real CTA below the illustration -->
  <rect x="81" y="370" width="140" height="24" rx="12" fill="var(--theme-primary)" />
  <text x="145" y="386" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">Sign In</text>
  <path d="M203 380 L209 383 L203 386" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
</svg>`

export function EmptyProfileMockup({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Not signed in illustration"
      dangerouslySetInnerHTML={{ __html: SVG_MARKUP }}
    />
  )
}