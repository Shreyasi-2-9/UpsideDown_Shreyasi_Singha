interface BrandLogoProps {
  size?: number
  className?: string
  variant?: "blue" | "dark"
}

export function BrandLogo({
  size = 48,
  className,
  variant = "blue",
}: BrandLogoProps) {
  const isBlue = variant === "blue"
  const gradId = isBlue ? "blBlueBg" : "blDarkBg"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {isBlue ? (
            <>
              <stop offset="0%" stopColor="#436bfa" />
              <stop offset="100%" stopColor="#244be8" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#24262c" />
              <stop offset="100%" stopColor="#17181c" />
            </>
          )}
        </linearGradient>
        <filter id="blDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            floodColor="#315cf5"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      {/* Rounded Squircle Base */}
      <rect
        width="192"
        height="192"
        rx="46"
        fill={`url(#${gradId})`}
        filter="url(#blDropShadow)"
      />
      <rect
        x="1.5"
        y="1.5"
        width="189"
        height="189"
        rx="44.5"
        stroke="#ffffff"
        strokeOpacity={isBlue ? "0.24" : "0.1"}
        strokeWidth="3"
      />

      {/* House & Civic Shield Structure */}
      <g>
        {/* House outline */}
        <path
          d="M48 94L96 52L144 94V140C144 144.418 140.418 148 136 148H56C51.5817 148 48 144.418 48 140V94Z"
          stroke="#ffffff"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Chimney */}
        <path
          d="M124 76V58H138V88"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Central Protection Shield */}
        <path
          d="M96 82C96 82 114 87 114 103C114 119 96 130 96 130C96 130 78 119 78 103C78 87 96 82 96 82Z"
          fill="#ffffff"
          fillOpacity="0.2"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Verification Checkmark */}
        <path
          d="M88 104L94 110L105 97"
          stroke="#ffffff"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
