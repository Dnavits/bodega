export function WaveDivider({ color, flip = false }: { color: string; flip?: boolean }) {
  return (
    <div className={flip ? "rotate-180" : ""}>
      <svg viewBox="0 0 1440 60" className="wave-divider" preserveAspectRatio="none">
        <path
          d="M0,32 C240,60 480,0 720,20 C960,40 1200,60 1440,28 L1440,60 L0,60 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
