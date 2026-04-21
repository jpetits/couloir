export default function CouloirLogo({
  width = 300,
  height = 60,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 190 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>Couloir</title>
      <g transform="translate(0, 0)">
        <polygon points="0,56 20,8 28,56" fill="#111" opacity="0.18" />
        <polygon points="55,56 39,4 31,56" fill="#111" opacity="0.18" />
        <polygon points="20,8 39,4 35,56 24,56" fill="#111" />
      </g>
      <text
        x="68"
        y="40"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="400"
        letterSpacing="8"
        fill="#B8B0A8"
      >
        couloir
      </text>
      <text
        x="70"
        y="55"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="9"
        fontWeight="400"
        letterSpacing="3.5"
        fill="#1a1a1a"
        opacity="0.5"
      >
        track every activity
      </text>
    </svg>
  );
}
