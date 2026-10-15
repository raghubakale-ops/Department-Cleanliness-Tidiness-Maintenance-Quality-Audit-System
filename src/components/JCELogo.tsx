import React from 'react';

interface JCELogoProps {
  className?: string;
  size?: number;
  showSubtitle?: boolean;
  customLogoUrl?: string | null;
  color?: string;
  withWhiteBackdrop?: boolean;
  onDark?: boolean;
}

export const JCELogo: React.FC<JCELogoProps> = ({
  className = '',
  size = 64,
  showSubtitle = true,
  customLogoUrl,
  color = '#1F3864',
  withWhiteBackdrop = true,
  onDark = false
}) => {
  if (customLogoUrl) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={withWhiteBackdrop ? 'bg-white rounded-full p-1 shadow-sm' : ''}>
          <img
            src={customLogoUrl}
            alt="Jain College of Engineering Logo"
            style={{ width: size, height: size }}
            className="object-contain"
          />
        </div>
        {showSubtitle && (
          <span className={`text-[10px] font-extrabold tracking-wider mt-0.5 ${onDark ? 'text-amber-300' : 'text-slate-800'}`}>
            Estd. 2010
          </span>
        )}
      </div>
    );
  }

  // 32 Outer Gear Teeth
  const numTeeth = 32;
  const teeth = Array.from({ length: numTeeth }, (_, i) => {
    const angle = (i * 360) / numTeeth;
    return (
      <rect
        key={i}
        x="95"
        y="4"
        width="10"
        height="14"
        rx="2"
        fill={color}
        transform={`rotate(${angle} 100 100)`}
      />
    );
  });

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Jain College of Engineering Belagavi Crest"
      >
        <defs>
          <path id="topTextArc" d="M 32 100 A 68 68 0 0 1 168 100" fill="none" />
          <path id="bottomTextArc" d="M 166 106 A 68 68 0 0 1 34 106" fill="none" />
          <radialGradient id="centerBadgeGrad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#2A4B82" />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor="#0B132B" />
          </radialGradient>
        </defs>

        {/* High-contrast solid white backing disc - guarantees teeth and outer cogs NEVER merge with background */}
        {withWhiteBackdrop && (
          <>
            <circle cx="100" cy="100" r="100" fill="#FFFFFF" />
            <circle cx="100" cy="100" r="99.5" fill="none" stroke="#E2E8F0" strokeWidth="1" />
          </>
        )}

        {/* Outer Gear Teeth */}
        {teeth}

        {/* Outer Ring */}
        <circle cx="100" cy="100" r="88" fill={color} />

        {/* Thin Gold accent highlight ring */}
        <circle cx="100" cy="100" r="86.5" fill="none" stroke="#F59E0B" strokeWidth="0.8" opacity="0.8" />

        {/* Inner White Field */}
        <circle cx="100" cy="100" r="66" fill="#FFFFFF" />

        {/* Circular text: JAIN COLLEGE OF ENGINEERING */}
        <text
          fill="#FFFFFF"
          fontSize="11.5"
          fontWeight="800"
          letterSpacing="1.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#topTextArc" startOffset="50%" textAnchor="middle">
            JAIN COLLEGE OF ENGINEERING
          </textPath>
        </text>

        {/* Stars */}
        <text x="26" y="104" fill="#FFFFFF" fontSize="12" fontWeight="bold">★</text>
        <text x="166" y="104" fill="#FFFFFF" fontSize="12" fontWeight="bold">★</text>

        {/* Circular text: BELAGAVI */}
        <text
          fill="#FFFFFF"
          fontSize="12"
          fontWeight="800"
          letterSpacing="2.5"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#bottomTextArc" startOffset="50%" textAnchor="middle">
            BELAGAVI
          </textPath>
        </text>

        {/* Quadrant Divider Lines */}
        <line x1="34" y1="100" x2="166" y2="100" stroke={color} strokeWidth="2.5" />
        <line x1="100" y1="34" x2="100" y2="166" stroke={color} strokeWidth="2.5" />

        {/* Quadrant 1 (Top-Left): Science / Atom Orbit */}
        <g transform="translate(68, 68)">
          <ellipse cx="0" cy="0" rx="18" ry="7" fill="none" stroke="#475569" strokeWidth="1.2" transform="rotate(-30)" />
          <ellipse cx="0" cy="0" rx="18" ry="7" fill="none" stroke="#475569" strokeWidth="1.2" transform="rotate(30)" />
          <ellipse cx="0" cy="0" rx="18" ry="7" fill="none" stroke="#475569" strokeWidth="1.2" transform="rotate(90)" />
          <circle cx="0" cy="0" r="3.2" fill="#DC2626" />
          <circle cx="10" cy="-6" r="1.8" fill={color} />
          <circle cx="-11" cy="5" r="1.8" fill={color} />
        </g>

        {/* Quadrant 2 (Top-Right): Electronics / Microchip & Circuit */}
        <g transform="translate(132, 68)">
          <rect x="-14" y="-12" width="28" height="24" rx="2" fill="#334155" />
          {/* Chip Pins */}
          <line x1="-18" y1="-8" x2="-14" y2="-8" stroke="#D97706" strokeWidth="1.5" />
          <line x1="-18" y1="-2" x2="-14" y2="-2" stroke="#D97706" strokeWidth="1.5" />
          <line x1="-18" y1="4" x2="-14" y2="4" stroke="#D97706" strokeWidth="1.5" />
          <line x1="14" y1="-8" x2="18" y2="-8" stroke="#D97706" strokeWidth="1.5" />
          <line x1="14" y1="-2" x2="18" y2="-2" stroke="#D97706" strokeWidth="1.5" />
          <line x1="14" y1="4" x2="18" y2="4" stroke="#D97706" strokeWidth="1.5" />
          {/* PCB Traces */}
          <polyline points="-10,-18 -10,-12 -6,-12" fill="none" stroke="#D97706" strokeWidth="1" />
          <polyline points="0,-18 0,-12 4,-12" fill="none" stroke="#D97706" strokeWidth="1" />
          <circle cx="0" cy="0" r="4" fill="#1E293B" stroke="#64748B" strokeWidth="0.8" />
        </g>

        {/* Quadrant 3 (Bottom-Left): Civil Engineering / Hardhat & Blueprint */}
        <g transform="translate(68, 132)">
          {/* Hard Hat */}
          <path d="M -12,-4 Q 0,-14 12,-4 L 14,-2 Q 0,-3 -14,-2 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          {/* Engineer Body / Blueprint */}
          <path d="M -10,0 L 10,0 L 14,14 L -14,14 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
          <line x1="-12" y1="4" x2="12" y2="4" stroke="#0284C7" strokeWidth="1" />
          <line x1="-10" y1="8" x2="10" y2="8" stroke="#0284C7" strokeWidth="1" />
          <line x1="-8" y1="11" x2="6" y2="11" stroke="#0284C7" strokeWidth="1" />
        </g>

        {/* Quadrant 4 (Bottom-Right): Mechanical Gears */}
        <g transform="translate(132, 132)">
          <circle cx="-4" cy="4" r="10" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
          <circle cx="-4" cy="4" r="4" fill="#FFFFFF" />
          <circle cx="8" cy="-4" r="7" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
          <circle cx="8" cy="-4" r="2.5" fill="#FFFFFF" />
          {/* Gear teeth notches */}
          <line x1="-4" y1="-9" x2="-4" y2="17" stroke="#1E293B" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="-17" y1="4" x2="9" y2="4" stroke="#1E293B" strokeWidth="2" strokeDasharray="3 3" />
        </g>

        {/* Center Medallion: JGi Badge */}
        <circle cx="100" cy="100" r="32" fill="url(#centerBadgeGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Subtle highlight arc */}
        <path d="M 75 92 A 26 26 0 0 1 125 92" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.3" />

        {/* JGi Text */}
        <text
          x="96"
          y="108"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="900"
          letterSpacing="-0.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          JG
        </text>
        <text
          x="116"
          y="108"
          fill="#FFFFFF"
          fontSize="23"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="middle"
        >
          i
        </text>
        {/* Yellow Dot on 'i' */}
        <circle cx="116" cy="91" r="3.2" fill="#FBBF24" />
      </svg>

      {showSubtitle && (
        <span
          className={`text-[11px] font-extrabold tracking-wider mt-1 ${
            onDark ? 'text-amber-300' : 'text-slate-800'
          }`}
        >
          Estd. 2010
        </span>
      )}
    </div>
  );
};
