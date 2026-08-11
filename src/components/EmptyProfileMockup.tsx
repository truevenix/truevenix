"use client"
// components/EmptyProfileMockup.tsx
//
// Illustration for the "not signed in" profile state. Same self-theming
// trick as EmptyCartMockup: every brand-colored path — the wordmark, the
// header icon, the character's shirt + shorts, the section labels, the
// address-card home glyph, the card icon dots, and the Sign In pill — reads
// `var(--theme-primary)` / `color-mix(in srgb, var(--theme-primary) X%,
// transparent)` straight off whatever CategoryThemeProvider has written to
// <html>. Drop it into any category and it re-colors itself for free.
//
// v2 — full body, bigger phone. The previous version only showed the
// mascot's head with two arms floating open past the screen edges; there
// was no torso connecting them. This version gives the phone more height
// so the whole character — head, neck, a theme-colored shirt, arms, hands,
// shorts and legs down to its shoes — stands fully inside the frame, feet
// planted above the fold, presenting the (empty) profile content stacked
// below it: name/email placeholders, the Personal Information card, the
// Saved Addresses card, and the decorative Sign In pill. Unlike the cart
// mascot (which bleeds off-canvas behind the phone), this character is
// fully contained — nothing crosses the screen edge — since the point here
// is "here's your whole profile, come fill it in," not a peek from outside.
//
// Everything below the legs — the name/email placeholder bars, the
// Personal Information card, the Saved Addresses card, the bottom Sign In
// pill — is decorative chrome tracing the real profile page's layout, the
// same way the cart mockup traced a product grid. None of it is
// interactive; it exists to make the empty state read as "this is what
// your profile will look like," with a real, clickable Sign In button
// living below the illustration in the page itself (see ProfilePage).
//
// Non-brand elements (phone bezel, skin tone, hair, shoe color, card
// icon-chip fills, placeholder bar grays) are intentionally left as fixed
// colors — they're generic mockup chrome / sample content, not identity,
// so they shouldn't shift with the theme. The shirt and shorts are the
// character's "clothes" and always take the theme color.

const SVG_MARKUP = `<svg viewBox="0 0 340 608" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">
  <!-- background accents -->
  <path d="M8 20 Q24 4 40 18 T74 14" stroke="var(--theme-primary)" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9" />
  <path d="M300 26 L316 42 L300 58 L284 42 Z" fill="none" stroke="var(--theme-primary)" stroke-width="2.2" />
  <path d="M284 42 H316" stroke="var(--theme-primary)" stroke-width="1.3" />
  <path d="M312 90 L330 86 L321 106 Z" fill="var(--theme-primary)" opacity="0.85" />
  <path d="M300 210 L313 208 L306 222 Z" fill="var(--theme-primary)" opacity="0.8" />
  <path d="M12 300 L26 296 L18 314 Z" fill="var(--theme-primary)" opacity="0.85" />
  <path d="M306 460 L319 458 L312 472 Z" fill="var(--theme-primary)" opacity="0.8" />
  <path d="M14 540 L28 536 L20 554 Z" fill="var(--theme-primary)" opacity="0.85" />
  <circle cx="16" cy="80" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="326" cy="260" r="5" fill="color-mix(in srgb, var(--theme-primary) 15%, transparent)" />
  <circle cx="316" cy="460" r="4" fill="color-mix(in srgb, var(--theme-primary) 20%, transparent)" />
  <circle cx="14" cy="580" r="3" fill="color-mix(in srgb, var(--theme-primary) 25%, transparent)" />

  <!-- phone (taller than v1 so the full body fits above the fold) -->
  <rect x="22" y="14" width="258" height="578" rx="36" fill="#0B0F19" />
  <circle cx="151" cy="20" r="3" fill="#1A1F2E" />
  <rect x="36" y="28" width="230" height="550" rx="26" fill="#FFFFFF" />

  <!-- app header -->
  <rect x="48" y="38" width="12" height="10" rx="2" fill="none" stroke="var(--theme-primary)" stroke-width="1.3" />
  <path d="M51 38 Q54 32 57 38" stroke="var(--theme-primary)" stroke-width="1.2" fill="none" />
  <text x="66" y="47" font-size="8" font-weight="800" fill="var(--theme-primary)" letter-spacing="0.4">TRUEVENIX</text>
  <line x1="246" y1="40" x2="258" y2="40" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <line x1="246" y1="44" x2="258" y2="44" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />
  <line x1="246" y1="48" x2="258" y2="48" stroke="#9A9AA6" stroke-width="1.5" stroke-linecap="round" />

  <!-- torso (shirt) -- drawn first so the head and arms sit on top of it -->
  <path d="M98 150 C98 134 121 126 151 126 C181 126 204 134 204 150 L207 192 C207 218 188 234 151 238 C114 234 95 218 95 192 Z" fill="var(--theme-primary)" />
  <path d="M118 138 Q151 128 184 138" stroke="#FFFFFF" stroke-width="2.5" opacity="0.22" fill="none" stroke-linecap="round" />

  <!-- neck -->
  <rect x="143" y="122" width="16" height="16" fill="#9C6B45" />

  <!-- head -->
  <circle cx="151" cy="100" r="27" fill="#9C6B45" />
  <path d="M123 93 C 120 70, 136 56, 151 56 C 167 56, 183 70, 179 92 C 169 82, 159 76, 151 76 C 142 76, 132 84, 123 93 Z" fill="#241C15" />
  <circle cx="131" cy="66" r="4.5" fill="#241C15" />
  <circle cx="145" cy="58" r="4.5" fill="#241C15" />
  <circle cx="157" cy="58" r="4.5" fill="#241C15" />
  <circle cx="171" cy="68" r="4.5" fill="#241C15" />
  <circle cx="144" cy="102" r="2" fill="#241C15" />
  <circle cx="158" cy="100" r="2" fill="#241C15" />
  <path d="M140 112 Q151 119 163 109" stroke="#241C15" stroke-width="2" fill="none" stroke-linecap="round" />

  <!-- camera badge, echoing the real avatar upload affordance -->
  <circle cx="175" cy="122" r="8" fill="#FFFFFF" stroke="var(--theme-primary)" stroke-width="2" />
  <rect x="171" y="119" width="8" height="6" rx="1.3" fill="var(--theme-primary)" />
  <circle cx="175" cy="122" r="1.4" fill="#FFFFFF" />

  <!-- arms (sleeves), attached at the shoulders, hands resting near the hips -->
  <path d="M110 142 C88 150 68 168 64 205" stroke="var(--theme-primary)" stroke-width="17" fill="none" stroke-linecap="round" />
  <path d="M192 142 C214 150 234 168 238 205" stroke="var(--theme-primary)" stroke-width="17" fill="none" stroke-linecap="round" />

  <!-- hands -->
  <circle cx="64" cy="212" r="14" fill="none" stroke="#FFC229" stroke-width="3.2" />
  <circle cx="64" cy="212" r="11" fill="#9C6B45" />
  <circle cx="238" cy="212" r="14" fill="none" stroke="#FFC229" stroke-width="3.2" />
  <circle cx="238" cy="212" r="11" fill="#9C6B45" />

  <!-- shorts -->
  <rect x="116" y="236" width="34" height="40" rx="15" fill="var(--theme-primary)" />
  <rect x="160" y="236" width="34" height="40" rx="15" fill="var(--theme-primary)" />

  <!-- lower legs -->
  <rect x="122" y="268" width="20" height="42" rx="9" fill="#9C6B45" />
  <rect x="168" y="268" width="20" height="42" rx="9" fill="#9C6B45" />

  <!-- shoes -->
  <rect x="116" y="302" width="32" height="16" rx="8" fill="#241C15" />
  <rect x="162" y="302" width="32" height="16" rx="8" fill="#241C15" />

  <!-- name / email placeholders -->
  <rect x="121" y="332" width="60" height="10" rx="5" fill="#111111" opacity="0.85" />
  <rect x="112" y="348" width="10" height="8" rx="1" fill="none" stroke="#9A9AA6" stroke-width="1.3" />
  <path d="M112 348 L117 353 L122 348" stroke="#9A9AA6" stroke-width="1.1" fill="none" />
  <rect x="126" y="350" width="76" height="6" rx="3" fill="#D8D8E0" />

  <!-- personal information card -->
  <text x="44" y="374" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">PERSONAL INFORMATION</text>
  <rect x="41" y="376" width="220" height="92" rx="12" fill="#FFFFFF" stroke="#EDEDF2" />

  <rect x="47" y="382" width="18" height="18" rx="6" fill="#FEF3E2" />
  <circle cx="56" cy="391" r="3" fill="#D97706" />
  <rect x="72" y="388" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="388" width="48" height="6" rx="3" fill="#C8C8D2" />
  <line x1="47" y1="406" x2="257" y2="406" stroke="#F0F0F0" />

  <rect x="47" y="412" width="18" height="18" rx="6" fill="#E8F1FF" />
  <circle cx="56" cy="421" r="3" fill="#2563EB" />
  <rect x="72" y="418" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="418" width="48" height="6" rx="3" fill="#C8C8D2" />
  <line x1="47" y1="436" x2="257" y2="436" stroke="#F0F0F0" />

  <rect x="47" y="442" width="18" height="18" rx="6" fill="#E9FBF5" />
  <circle cx="56" cy="451" r="3" fill="#059669" />
  <rect x="72" y="448" width="44" height="6" rx="3" fill="#3A3A3A" opacity="0.7" />
  <rect x="176" y="448" width="48" height="6" rx="3" fill="#C8C8D2" />

  <!-- saved addresses card -->
  <text x="44" y="486" font-size="6.5" font-weight="700" fill="var(--theme-primary)" letter-spacing="0.5">SAVED ADDRESSES</text>
  <text x="257" y="486" font-size="6.5" font-weight="800" fill="var(--theme-primary)" text-anchor="end">+ ADD</text>
  <rect x="41" y="488" width="220" height="52" rx="12" fill="#FFFFFF" stroke="#EDEDF2" />
  <rect x="47" y="496" width="16" height="16" rx="6" fill="color-mix(in srgb, var(--theme-primary) 12%, transparent)" />
  <path d="M49 504 L55 498 L61 504 Z" fill="var(--theme-primary)" />
  <rect x="51" y="504" width="8" height="6" fill="var(--theme-primary)" opacity="0.85" />
  <rect x="71" y="498" width="50" height="6" rx="3" fill="#3A3A3A" opacity="0.8" />
  <rect x="71" y="508" width="130" height="4" rx="2" fill="#C8C8D2" />
  <rect x="71" y="515" width="96" height="4" rx="2" fill="#C8C8D2" />
  <circle cx="244" cy="498" r="3" fill="color-mix(in srgb, var(--theme-primary) 15%, transparent)" />
  <circle cx="254" cy="498" r="3" fill="#FDE8E8" />

  <!-- decorative Sign In pill, tracing the real CTA below the illustration -->
  <rect x="81" y="548" width="140" height="24" rx="12" fill="var(--theme-primary)" />
  <text x="151" y="564" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">Sign In</text>
  <path d="M203 558 L209 561 L203 564" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
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