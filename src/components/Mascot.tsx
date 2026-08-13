/**
 * The truevenix mascot, ported from the Expo app's `EmptyProfileMockup`.
 *
 * Same construction and palette as the RN asset (skin #9C6B45, hair #241C15,
 * #FFC229 wrist bands, theme-coloured shirt + shorts) — but re-centred into
 * its own viewBox and re-posed: the right arm is raised in an open-palm
 * "here's your plan" gesture toward the phone, the left arm rests at the hip.
 *
 * Colors are controlled by the active category theme via CSS custom properties:
 * - var(--theme-primary): main brand color (shirt, shorts, arms, accents)
 * - var(--tv-primary): fallback if --theme-primary is not set
 */

const SKIN = "#9C6B45";
const HAIR = "#241C15";
const WRIST = "#FFC229";

export function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-18 -6 236 306"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* ground shadow */}
      <ellipse
        cx="100"
        cy="276"
        rx="66"
        ry="9"
        fill="var(--theme-primary, var(--tv-primary, #EC5518))"
        opacity="0.13"
      />

      {/* torso (shirt) — drawn first so head and arms sit on top */}
      <path
        d="M47 104C47 88 70 80 100 80C130 80 153 88 153 104L156 146C156 172 137 188 100 192C63 188 44 172 44 146Z"
        fill="var(--theme-primary, var(--tv-primary, #EC5518))"
      />
      <path
        d="M67 92Q100 82 133 92"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeOpacity="0.22"
        strokeLinecap="round"
      />

      {/* neck */}
      <rect x="92" y="76" width="16" height="16" fill={SKIN} />

      {/* head */}
      <circle cx="100" cy="54" r="27" fill={SKIN} />
      <path
        d="M72 47C69 24 85 10 100 10C116 10 132 24 128 46C118 36 108 30 100 30C91 30 81 38 72 47Z"
        fill={HAIR}
      />
      <circle cx="80" cy="20" r="4.5" fill={HAIR} />
      <circle cx="94" cy="12" r="4.5" fill={HAIR} />
      <circle cx="106" cy="12" r="4.5" fill={HAIR} />
      <circle cx="120" cy="22" r="4.5" fill={HAIR} />
      <circle cx="93" cy="56" r="2" fill={HAIR} />
      <circle cx="107" cy="54" r="2" fill={HAIR} />
      <path
        d="M89 66Q100 73 112 63"
        stroke={HAIR}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* arms (sleeves) */}
      <path
        d="M55 96C38 106 27 124 29 146"
        stroke="var(--theme-primary, var(--tv-primary, #EC5518))"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        d="M145 94C167 90 185 75 190 51"
        stroke="var(--theme-primary, var(--tv-primary, #EC5518))"
        strokeWidth="17"
        strokeLinecap="round"
      />

      {/* hands */}
      <circle
        cx="29"
        cy="152"
        r="14"
        fill="none"
        stroke={WRIST}
        strokeWidth="3.2"
      />
      <circle cx="29" cy="152" r="11" fill={SKIN} />
      <circle
        cx="191"
        cy="45"
        r="14"
        fill="none"
        stroke={WRIST}
        strokeWidth="3.2"
      />
      <circle cx="191" cy="45" r="11" fill={SKIN} />

      {/* shorts */}
      <rect
        x="65"
        y="190"
        width="34"
        height="40"
        rx="15"
        fill="var(--theme-primary, var(--tv-primary, #EC5518))"
      />
      <rect
        x="109"
        y="190"
        width="34"
        height="40"
        rx="15"
        fill="var(--theme-primary, var(--tv-primary, #EC5518))"
      />

      {/* lower legs */}
      <rect x="71" y="222" width="20" height="42" rx="9" fill={SKIN} />
      <rect x="117" y="222" width="20" height="42" rx="9" fill={SKIN} />

      {/* shoes */}
      <rect x="65" y="256" width="32" height="16" rx="8" fill={HAIR} />
      <rect x="111" y="256" width="32" height="16" rx="8" fill={HAIR} />
    </svg>
  );
}