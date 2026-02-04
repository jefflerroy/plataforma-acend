import { useMemo } from "react";
import "./penasCaindo.css";
import logo from "../../assets/logo.png";

export function PenasCaindo({  
  quantidade = 200,
}) {
  const itens = useMemo(() => {
    const arr = [];
    for (let i = 0; i < quantidade; i++) {
      const left = Math.random() * 100;
      const size = 18 + Math.random() * 44;
      const duration = 7 + Math.random() * 10;
      const delay = -(Math.random() * duration);
      const drift = (Math.random() * 2 - 1) * 80;
      const rot = (Math.random() * 2 - 1) * 220;
      const opacity = 0.2 + Math.random() * 0.65;
      const blur = Math.random() < 0.2 ? 1 : 0;

      arr.push({
        key: i,
        style: {
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          "--dur": `${duration}s`,
          "--del": `${delay}s`,
          "--drift": `${drift}px`,
          "--rot": `${rot}deg`,
          opacity,
          filter: blur ? `blur(${blur}px)` : "none",
        },
      });
    }
    return arr;
  }, [quantidade]);

  return (
    <div className="penas" style={{ height: '100vh' }}>
      {itens.map((it) => (
        <img
          key={it.key}
          className="pena"
          src={logo}
          alt=""
          draggable={false}
          style={it.style}
        />
      ))}
    </div>
  );
}
