import React from "react";
// Code-native illustration: stays sharp at any size and represents the actual type.
export default function BoligBuildingArt({
  type = "apartment",
  className = "",
}) {
  const house = type === "house",
    duplex = type === "duplex",
    field = type === "field";
  const windows = (x, y, rows, cols, step = 22) =>
    Array.from({ length: rows * cols }, (_, i) => (
      <g key={`${x}-${i}`}>
        <rect
          x={x + (i % cols) * step}
          y={y + Math.floor(i / cols) * 24}
          width="12"
          height="16"
          rx="1"
          fill={i % 3 === 0 ? "#f7d999" : "#bce1e5"}
        />
        <path
          d={`M${x + (i % cols) * step + 6} ${y + Math.floor(i / cols) * 24}v16`}
          stroke="#65818a"
          strokeWidth="1"
        />
      </g>
    ));
  return (
    <svg
      className={`bolig-building-art ${className}`}
      viewBox="0 0 300 160"
      aria-hidden="true"
    >
      <path fill="#e6f4f6" d="M0 0h300v160H0z" />
      <circle cx="251" cy="30" r="16" fill="#fff0cc" />
      <path d="M0 130Q60 106 120 128T300 119v41H0z" fill="#d5e7dc" />
      {field ? (
        [35, 110, 185].map((x, i) => (
          <g key={x}>
            <path
              d={`M${x} ${74 + i * 4}l30-23 30 23v49h-60z`}
              fill={i === 1 ? "#cbbba3" : "#f8f5ed"}
            />
            <path
              d={`M${x - 4} ${74 + i * 4}l34-26 34 26`}
              fill="none"
              stroke="#45616a"
              strokeWidth="6"
            />
            {windows(x + 10, 83 + i * 4, 1, 2, 25)}
            <path d={`M${x + 24} 110h12v19h-12z`} fill="#547880" />
          </g>
        ))
      ) : house || duplex ? (
        <g>
          <path d="M63 69l84-43 88 43v62H63z" fill="#f3ede2" />
          <path
            d="M52 70l95-49 99 49"
            fill="none"
            stroke="#42636c"
            strokeWidth="9"
          />
          <path d="M66 88h166v43H66z" fill="#b9a285" />
          {windows(83, 67, 1, duplex ? 5 : 3, duplex ? 27 : 48)}
          {windows(83, 101, 1, 2, 92)}
          <path d="M139 99h20v32h-20z" fill="#335e68" />
          {duplex && <path d="M183 99h17v32h-17z" fill="#335e68" />}
          <path d="M74 89h149" stroke="#faf9f5" strokeWidth="4" />
        </g>
      ) : (
        <g>
          <path d="M60 39h157v92H60z" fill="#e8e2d6" />
          <path d="M217 39l26 12v80h-26z" fill="#aab9b7" />
          <path d="M56 34h165v9H56z" fill="#496770" />
          <path d="M92 26h85v9H92z" fill="#d0d9d6" />
          {windows(75, 51, type === "multi" ? 2 : 3, 6)}
          <path d="M130 108h22v23h-22z" fill="#3b6370" />
          <path d="M61 74h155M61 98h155" stroke="#f7f4ee" strokeWidth="4" />
        </g>
      )}
      <path d="M22 133h256" stroke="#91a9a4" strokeWidth="3" />
      {[29, 266].map((x) => (
        <g key={x}>
          <path d={`M${x} 130v-27`} stroke="#789185" strokeWidth="3" />
          <ellipse cx={x} cy="99" rx="14" ry="22" fill="#86b398" />
          <ellipse cx={x - 4} cy="94" rx="9" ry="16" fill="#a2c7ab" />
        </g>
      ))}
    </svg>
  );
}
