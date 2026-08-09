"use client"

// components/EmptyOrderMockup.tsx
//
// Illustration for the "no orders yet" state. The character is now positioned
// to be looking at a phone screen, with their hand/arm covering the bottom
// portion of the phone for a more natural and engaging pose.
//
// Brand colors follow the same theme-primary CSS variable pattern as the
// EmptyCartMockup for automatic theme adaptation.

const SVG_MARKUP = `<svg viewBox="0 0 320 380" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica, Arial, sans-serif">
  <!-- Background accents - subtle sparkles -->
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

  <!-- Character's left arm reaching toward the phone -->
  <path d="M155 280 C 130 300, 95 310, 75 315" fill="none" stroke="var(--theme-primary)" stroke-width="32" stroke-linecap="round" />
  
  <!-- Character's left hand/fingers (skin tone) - positioned at bottom of phone -->
  <ellipse cx="62" cy="318" rx="18" ry="14" fill="#9C6B45" transform="rotate(-15, 62, 318)" />
  <ellipse cx="50" cy="312" rx="6" ry="10" fill="#9C6B45" transform="rotate(-20, 50, 312)" />
  <ellipse cx="44" cy="306" rx="5" ry="9" fill="#9C6B45" transform="rotate(-25, 44, 306)" />
  <ellipse cx="40" cy="298" rx="5" ry="9" fill="#9C6B45" transform="rotate(-30, 40, 298)" />
  <ellipse cx="38" cy="290" rx="4" ry="8" fill="#9C6B45" transform="rotate(-35, 38, 290)" />
  
  <!-- Phone - held at an angle, tilted slightly toward the character -->
  <g transform="rotate(-8, 100, 190)">
    <rect x="60" y="140" width="120" height="210" rx="24" fill="#0B0F19" />
    <rect x="68" y="148" width="104" height="194" rx="16" fill="#FFFFFF" />
    
    <!-- Phone notch -->
    <rect x="100" y="144" width="40" height="8" rx="4" fill="#0B0F19" />
    
    <!-- Status bar -->
    <rect x="78" y="156" width="30" height="4" rx="2" fill="#D1D5DB" />
    <rect x="148" y="156" width="22" height="4" rx="2" fill="#D1D5DB" />
    
    <!-- App header -->
    <rect x="78" y="168" width="84" height="18" rx="4" fill="var(--theme-primary)" opacity="0.15" />
    <rect x="84" y="172" width="20" height="10" rx="2" fill="var(--theme-primary)" />
    <rect x="110" y="172" width="40" height="10" rx="2" fill="var(--theme-primary)" opacity="0.6" />
    
    <!-- Search bar -->
    <rect x="78" y="194" width="84" height="20" rx="10" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="1" />
    <circle cx="86" cy="204" r="3.5" stroke="#9CA3AF" stroke-width="1.2" fill="none" />
    <line x1="88.5" y1="206.5" x2="91" y2="209" stroke="#9CA3AF" stroke-width="1.2" stroke-linecap="round" />
    
    <!-- Category pills -->
    <rect x="78" y="220" width="24" height="16" rx="8" fill="var(--theme-primary)" />
    <rect x="106" y="220" width="28" height="16" rx="8" fill="#F3F4F6" />
    <rect x="138" y="220" width="22" height="16" rx="8" fill="#F3F4F6" />
    
    <!-- Empty state message on phone screen -->
    <rect x="78" y="248" width="84" height="56" rx="8" fill="#FEFCE8" stroke="#FDE68A" stroke-width="1" />
    <text x="102" y="268" font-size="10" font-weight="700" fill="#92400E" text-anchor="middle" letter-spacing="0.3">No orders yet</text>
    <text x="102" y="283" font-size="8" fill="#A16207" text-anchor="middle" opacity="0.8">Your purchases will</text>
    <text x="102" y="295" font-size="8" fill="#A16207" text-anchor="middle" opacity="0.8">appear here</text>
    
    <!-- Bottom navigation bar (covered by character's hand) -->
    <rect x="68" y="320" width="104" height="22" rx="11" fill="#F9FAFB" />
    <circle cx="86" cy="331" r="5" fill="var(--theme-primary)" opacity="0.3" />
    <circle cx="106" cy="331" r="5" fill="var(--theme-primary)" opacity="0.7" />
    <circle cx="126" cy="331" r="5" fill="var(--theme-primary)" opacity="0.3" />
    <circle cx="146" cy="331" r="5" fill="var(--theme-primary)" opacity="0.3" />
  </g>
  
  <!-- Character's right arm - holding the phone from the other side -->
  <path d="M185 280 C 210 300, 215 315, 210 335" fill="none" stroke="var(--theme-primary)" stroke-width="28" stroke-linecap="round" />
  
  <!-- Character's right hand (skin tone) - gripping the phone edge -->
  <ellipse cx="208" cy="340" rx="14" ry="10" fill="#9C6B45" transform="rotate(20, 208, 340)" />
  <ellipse cx="215" cy="330" rx="5" ry="8" fill="#9C6B45" transform="rotate(25, 215, 330)" />
  <ellipse cx="220" cy="322" rx="5" ry="8" fill="#9C6B45" transform="rotate(30, 220, 322)" />
  
  <!-- Character's body/torso - behind the phone -->
  <path d="M160 170 C 115 140, 70 145, 55 195 L 55 330 C 55 350, 65 360, 80 360 L 180 360 C 195 360, 200 350, 200 330 L 200 195 C 195 155, 185 155, 160 170 Z" fill="var(--theme-primary)" />
  
  <!-- Body subtle highlight -->
  <path d="M70 200 Q85 180 110 185" stroke="#FFFFFF" stroke-width="2" opacity="0.15" fill="none" stroke-linecap="round" />
  <path d="M65 230 Q80 215 105 220" stroke="#FFFFFF" stroke-width="2" opacity="0.12" fill="none" stroke-linecap="round" />
  
  <!-- Character's head - looking toward the phone (slightly turned) -->
  <g transform="rotate(15, 145, 115)">
    <!-- Head base -->
    <circle cx="145" cy="105" r="38" fill="#9C6B45" />
    
    <!-- Hair -->
    <path d="M107 100 C 103 68, 125 50, 145 50 C 165 50, 187 68, 183 100 C 172 85, 160 78, 145 78 C 130 78, 118 85, 107 100 Z" fill="#241C15" />
    <path d="M110 95 Q115 82 130 80" stroke="#3D2B1F" stroke-width="1.5" fill="none" opacity="0.3" />
    <path d="M160 80 Q170 85 178 95" stroke="#3D2B1F" stroke-width="1.5" fill="none" opacity="0.3" />
    
    <!-- Eyes - looking at the phone (directed downward and to the left) -->
    <!-- Left eye -->
    <ellipse cx="128" cy="98" rx="7" ry="6" fill="white" />
    <circle cx="125" cy="100" r="3.5" fill="#241C15" />
    <circle cx="124" cy="99" r="1.2" fill="white" />
    
    <!-- Right eye -->
    <ellipse cx="152" cy="98" rx="7" ry="6" fill="white" />
    <circle cx="149" cy="100" r="3.5" fill="#241C15" />
    <circle cx="148" cy="99" r="1.2" fill="white" />
    
    <!-- Eyebrows - slightly raised with curiosity -->
    <path d="M119 89 Q128 85 136 88" stroke="#241C15" stroke-width="2" fill="none" stroke-linecap="round" />
    <path d="M143 88 Q151 85 160 89" stroke="#241C15" stroke-width="2" fill="none" stroke-linecap="round" />
    
    <!-- Small smile - gentle, pleasant -->
    <path d="M134 116 Q145 124 156 114" stroke="#241C15" stroke-width="1.8" fill="none" stroke-linecap="round" />
    
    <!-- Blush/slight rosy cheeks -->
    <circle cx="120" cy="112" r="5" fill="#E8A0A0" opacity="0.25" />
    <circle cx="160" cy="112" r="5" fill="#E8A0A0" opacity="0.25" />
    
    <!-- Ears -->
    <ellipse cx="108" cy="105" rx="4" ry="7" fill="#9C6B45" />
    <ellipse cx="182" cy="105" rx="4" ry="7" fill="#9C6B45" />
  </g>
  
  <!-- Engagement/surprise sparkles near the phone -->
  <g transform="translate(115, 175)">
    <path d="M0 0 L2 -6 L4 0 L10 -2 L4 2 L6 8 L2 4 L-2 6 L0 2 L-6 4 L-2 -2 L-8 -6 L0 -4 Z" fill="var(--theme-primary)" opacity="0.6" />
    <animateTransform attributeName="transform" type="rotate" from="0 115 175" to="360 115 175" dur="4s" repeatCount="indefinite" />
  </g>
  
  <circle cx="200" cy="185" r="2" fill="var(--theme-primary)" opacity="0.5">
    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
  </circle>
  <circle cx="80" cy="240" r="1.5" fill="var(--theme-primary)" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
  </circle>
</svg>`

export function EmptyOrderMockup({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Empty orders illustration - character looking at phone"
      dangerouslySetInnerHTML={{ __html: SVG_MARKUP }}
    />
  )
}