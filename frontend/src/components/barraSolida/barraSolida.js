import { useEffect, useState } from "react";
import './barraSolida.css'

export function BarraSolida({
  atual,
  max = 100,
  label = "Progresso",
  color = 'var(--terciaria)'
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const percent = Math.min(100, (atual / max) * 100);
    setWidth(percent);
  }, [atual, max]);

  return (
    <div className="progress">
      <div className="progress-header">
        <span>{label}</span>
        <span>{atual}g / {max}g</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
