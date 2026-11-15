interface StoreBrandLogoProps {
  size?: 'sm' | 'md';
}

export function StoreBrandLogo({ size = 'md' }: StoreBrandLogoProps) {
  const dim = size === 'sm' ? 'w-7 h-7 rounded-lg' : 'w-8 h-8 rounded-lg';
  const svgDim = size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5';

  return (
    <span
      aria-hidden="true"
      className={`${dim} bg-[#0D0F12] text-white inline-flex items-center justify-center shrink-0`}
    >
      <svg viewBox="0 0 24 24" fill="none" className={svgDim}>
        <path
          d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 10.5H15.5M12 10.5V16.5"
          stroke="#10B981"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
