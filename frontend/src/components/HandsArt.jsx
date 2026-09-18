export default function HandsArt() {
  const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393'];

  const hands = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * 360;
    return { angle, color: colors[i % colors.length] };
  });

  return (
    <svg className="hands-art" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de mãos coloridas erguidas, simbolizando diversidade e inclusão">
      <circle cx="200" cy="200" r="150" fill="var(--color-paper-alt)" />
      {hands.map((h, i) => (
        <g key={i} transform={`rotate(${h.angle} 200 200)`}>
          <path
            d="M200 200 L192 90 Q192 78 200 78 Q208 78 208 90 L208 130
               L214 92 Q215 82 223 84 Q231 86 229 96 L221 134
               L232 100 Q236 91 244 95 Q252 99 248 108 L234 140
               L200 200 Z"
            fill={h.color}
            opacity="0.92"
          />
        </g>
      ))}
      <circle cx="200" cy="200" r="34" fill="var(--color-ink)" />
      <circle cx="200" cy="200" r="34" fill="none" stroke="var(--color-white)" strokeWidth="3" />
    </svg>
  );
}
