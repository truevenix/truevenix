/**
 * Flat gadget artwork for the installment mockup.
 *
 * Drawn rather than photographed so the illustration always loads, stays
 * crisp at any size, and re-tints with the active category theme
 * (`var(--tv-primary)`) exactly like the RN mockups do.
 */

const INK = "#1C2230";
const INK_SOFT = "#2A3345";
const LIGHT = "#E8EBF2";
const WARM = "#FFC229";

type ArtProps = { className?: string };

/* ------------------------------------------------------------------ */

export function PowerBankArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* Orange handle strap extending to the right */}
      <path d="M 31 16 L 43 27 A 2 2 0 0 1 41 30 L 31 21 Z" fill={WARM} />
      
      {/* Handle pivot joint */}
      <circle cx="32" cy="19" r="4.5" fill={INK_SOFT} />
      <circle cx="32" cy="19" r="2.5" fill={INK} />
      
      {/* Main chunky black body */}
      <rect x="11" y="9" width="22" height="33" rx="4" fill={INK} />
      
      {/* Top surface/bevel edge */}
      <path d="M 11 13 Q 22 9 33 13 L 33 15 L 11 15 Z" fill={INK_SOFT} />
      
      {/* Small top ports */}
      <rect x="17" y="10.5" width="4" height="1.5" rx="0.5" fill="#fff" opacity="0.4" />
      <rect x="23" y="10.5" width="4" height="1.5" rx="0.5" fill="#fff" opacity="0.4" />
      
      {/* Abstracted vertical "NEW AGE" branding in orange */}
      <rect x="15" y="21" width="3" height="14" rx="1" fill={WARM} />
      <rect x="20" y="25" width="3" height="10" rx="1" fill={WARM} opacity="0.8" />
      <rect x="25" y="21" width="3" height="14" rx="1" fill={WARM} opacity="0.6" />
      
      {/* Left-edge shine highlight */}
      <path
        d="M 13 15.5 L 13 39"
        stroke="#fff"
        strokeOpacity="0.14"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeadsetArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* headband */}
      <path
        d="M9.5 28v-5a14.5 14.5 0 0 1 29 0v5"
        fill="none"
        stroke={INK}
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      {/* cups */}
      <rect x="4.5" y="25" width="10" height="16" rx="5" fill={INK} />
      <rect x="33.5" y="25" width="10" height="16" rx="5" fill={INK} />
      <rect
        x="7"
        y="27.6"
        width="5"
        height="10.8"
        rx="2.5"
        fill="var(--tv-primary)"
      />
      <rect
        x="36"
        y="27.6"
        width="5"
        height="10.8"
        rx="2.5"
        fill="var(--tv-primary)"
      />
      {/* mic boom */}
      <path
        d="M39 40.5c0 4.6-3.4 6.6-7.4 6.6h-3.2"
        fill="none"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <ellipse cx="26.6" cy="47.1" rx="3" ry="2.1" fill={WARM} />
    </svg>
  );
}

export function SolarGeneratorArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {/* Tangled black cables and plugs resting on top */}
      <path 
        d="M 16 12 C 12 4, 25 2, 23 9 C 21 16, 35 5, 31 11" 
        fill="none" 
        stroke={INK} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      <rect x="25" y="5" width="7" height="9" rx="1.5" fill={INK_SOFT} />
      <rect x="27.5" y="2" width="2" height="4" fill={INK} />
      
      {/* Main white rectangular body */}
      <rect x="5" y="11" width="38" height="35" rx="3.5" fill={LIGHT} />
      <rect x="6" y="12" width="36" height="33" rx="2.5" fill="#fff" />
      
      {/* Central black rounded display with active theme ring */}
      <rect x="17" y="18" width="14" height="14" rx="5" fill={INK} />
      <rect 
        x="17" 
        y="18" 
        width="14" 
        height="14" 
        rx="5" 
        fill="none" 
        stroke="var(--tv-primary)" 
        strokeWidth="1.2" 
      />
      
      {/* Inner display details */}
      <rect x="20" y="21" width="8" height="4.5" fill={INK_SOFT} />
      <circle cx="21" cy="29" r="1.2" fill="var(--tv-primary)" />
      <circle cx="27" cy="29" r="1.2" fill="var(--tv-primary)" />
      
      {/* Abstracted Red "itel" Logo Bubble */}
      <path 
        d="M 24 36 C 27.5 36, 29.5 37.2, 29.5 38.5 C 29.5 39.8, 27.5 41, 24 41 C 20.5 41, 18.5 39.8, 18.5 38.5 C 18.5 37.2, 20.5 36, 24 36 Z" 
        fill="#E3000F" 
      />
      {/* Logo bubble tail */}
      <path d="M 18.5 38.5 L 17 40 L 20 39 Z" fill="#E3000F" />
    </svg>
  );
}

export function SmartwatchArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="17" y="2.5" width="14" height="12" rx="4" fill={INK_SOFT} />
      <rect x="17" y="33.5" width="14" height="12" rx="4" fill={INK_SOFT} />
      <rect x="11" y="11" width="26" height="26" rx="8" fill={INK} />
      <rect
        x="14.5"
        y="14.5"
        width="19"
        height="19"
        rx="5.5"
        fill="var(--tv-primary)"
      />
      <path
        d="M18.5 25.5h3l2-4 3 7 2-3h3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="37" y="20" width="2.6" height="6" rx="1.3" fill={LIGHT} />
    </svg>
  );
}

