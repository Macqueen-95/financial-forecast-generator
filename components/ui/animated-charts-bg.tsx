import React from "react";

// Lightweight animated charts background: subtle moving lines/bars
export default function AnimatedChartsBg() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 select-none pointer-events-none">
      {/* Moving line chart */}
      <svg className="absolute -left-10 top-10 w-[140%] h-40 animate-[slideX_12s_linear_infinite]" viewBox="0 0 600 120" fill="none">
        <path d="M0 100 L50 80 L120 95 L180 60 L240 75 L300 40 L360 55 L420 30 L480 45 L540 25 L600 35" stroke="#111" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Second line chart, slower */}
      <svg className="absolute -right-10 top-40 w-[140%] h-40 animate-[slideXRev_18s_linear_infinite]" viewBox="0 0 600 120" fill="none">
        <path d="M0 80 L60 70 L120 90 L180 50 L240 85 L300 65 L360 95 L420 60 L480 90 L540 70 L600 85" stroke="#111" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* Faint bar chart columns */}
      <svg className="absolute left-1/2 bottom-10 -translate-x-1/2 w-[120%] h-48 animate-[pulseBars_6s_ease-in-out_infinite]" viewBox="0 0 600 200" fill="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={i * 30} y={40 + (i % 5) * 6} width="14" height={120 - (i % 5) * 10} fill="#111" rx="3" />
        ))}
      </svg>

      <style jsx>{`
        @keyframes slideX { from { transform: translateX(0); } to { transform: translateX(-10%); } }
        @keyframes slideXRev { from { transform: translateX(0); } to { transform: translateX(10%); } }
        @keyframes pulseBars { 0%,100% { opacity: .25 } 50% { opacity: .6 } }
      `}</style>
    </div>
  );
}


