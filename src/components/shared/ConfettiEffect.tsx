"use client";

import { useEffect, useState } from "react";

const COLORS = ["#FF6B6B", "#1B2A4A", "#10B981", "#F59E0B", "#DBEAFE"];
const PARTICLE_COUNT = 35;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: "square" | "circle";
  angle: number;
  velocity: number;
  rotation: number;
  rotationSpeed: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    shape: Math.random() > 0.5 ? "square" : "circle",
    angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5,
    velocity: Math.random() * 200 + 100,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 720,
  }));
}

export default function ConfettiEffect({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setParticles(generateParticles());
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active]);

  if (!visible || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(-50%, -50%) translate(0px, 0px) rotate(var(--start-rot));
            opacity: 1;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) rotate(var(--end-rot));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => {
        const tx = Math.cos(p.angle) * p.velocity;
        const ty = Math.sin(p.angle) * p.velocity - 60;
        return (
          <div
            key={p.id}
            style={
              {
                position: "absolute",
                left: "50%",
                top: "45%",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
                "--tx": `${tx}px`,
                "--ty": `${ty}px`,
                "--start-rot": `${p.rotation}deg`,
                "--end-rot": `${p.rotation + p.rotationSpeed}deg`,
                animation: "confetti-burst 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
