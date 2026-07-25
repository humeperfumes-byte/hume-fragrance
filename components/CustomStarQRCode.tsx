"use client";

import { useMemo } from "react";
import qrcode from "qrcode-generator";
import { HUME_HF_LOGO_BASE64 } from "@/lib/hume-logo-base64";

interface CustomStarQRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function CustomStarQRCode({
  value,
  size = 500,
  className = "",
}: CustomStarQRCodeProps) {
  const { svgContent } = useMemo(() => {
    // Generate QR matrix using Error Correction Level 'H' (High - 30% tolerance)
    const qr = qrcode(0, "H");
    qr.addData(value || "https://www.humefragrance.com");
    qr.make();

    const moduleCount = qr.getModuleCount();
    const cellSize = 10;
    const padding = 20;
    const viewSize = moduleCount * cellSize + padding * 2;

    // Helper to identify finder pattern (corner eye) modules
    const isFinderPattern = (r: number, c: number) => {
      // Top-Left Eye
      if (r < 7 && c < 7) return true;
      // Top-Right Eye
      if (r < 7 && c >= moduleCount - 7) return true;
      // Bottom-Left Eye
      if (r >= moduleCount - 7 && c < 7) return true;
      return false;
    };

    // Helper to calculate 5-point star SVG path definition string
    const getStarPath = (cx: number, cy: number, outerRadius: number, innerRadius: number) => {
      const points = [];
      const numPoints = 5;
      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / numPoints - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
      }
      points.push("Z");
      return points.join(" ");
    };

    // Center Emblem Cutout Radius
    const centerMatrixIndex = moduleCount / 2;
    const centerMaskRadiusMatrix = moduleCount * 0.16; // ~16% radius for center emblem

    const isCenterMask = (r: number, c: number) => {
      const dist = Math.hypot(r + 0.5 - centerMatrixIndex, c + 0.5 - centerMatrixIndex);
      return dist < centerMaskRadiusMatrix;
    };

    const stars: string[] = [];

    // Iterate through matrix modules
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.isDark(r, c)) {
          if (!isFinderPattern(r, c) && !isCenterMask(r, c)) {
            const cx = padding + c * cellSize + cellSize / 2;
            const cy = padding + r * cellSize + cellSize / 2;
            const outerR = cellSize * 0.58;
            const innerR = outerR * 0.42;
            stars.push(getStarPath(cx, cy, outerR, innerR));
          }
        }
      }
    }

    // Corner Eye Positions (Top-Left, Top-Right, Bottom-Left)
    const eyes = [
      { r: 0, c: 0 },
      { r: 0, c: moduleCount - 7 },
      { r: moduleCount - 7, c: 0 },
    ];

    return {
      svgContent: {
        viewSize,
        cellSize,
        padding,
        moduleCount,
        stars,
        eyes,
        centerCx: viewSize / 2,
        centerCy: viewSize / 2,
        centerRadius: (moduleCount * cellSize) * 0.14,
      },
    };
  }, [value]);

  const { viewSize, cellSize, padding, stars, eyes, centerCx, centerCy, centerRadius } = svgContent;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        className="w-full h-full bg-white rounded-xl shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White background canvas */}
        <rect x="0" y="0" width={viewSize} height={viewSize} fill="#FFFFFF" rx="16" />

        {/* Custom Finder Patterns (Smooth Rounded Corner Eyes) */}
        {eyes.map((eye, idx) => {
          const x = padding + eye.c * cellSize;
          const y = padding + eye.r * cellSize;
          const eyeSize = 7 * cellSize;

          return (
            <g key={idx}>
              {/* Outer Eye Border (Rounded Square) */}
              <rect
                x={x}
                y={y}
                width={eyeSize}
                height={eyeSize}
                rx={eyeSize * 0.28}
                ry={eyeSize * 0.28}
                fill="#000000"
              />
              {/* Eye Inner Cutout (White Space) */}
              <rect
                x={x + cellSize}
                y={y + cellSize}
                width={eyeSize - 2 * cellSize}
                height={eyeSize - 2 * cellSize}
                rx={(eyeSize - 2 * cellSize) * 0.22}
                ry={(eyeSize - 2 * cellSize) * 0.22}
                fill="#FFFFFF"
              />
              {/* Eye Pupil (Solid Center Square) */}
              <rect
                x={x + 2 * cellSize}
                y={y + 2 * cellSize}
                width={eyeSize - 4 * cellSize}
                height={eyeSize - 4 * cellSize}
                rx={(eyeSize - 4 * cellSize) * 0.26}
                ry={(eyeSize - 4 * cellSize) * 0.26}
                fill="#000000"
              />
            </g>
          );
        })}

        {/* Render All Internal Data Modules as 5-Pointed Stars (★) */}
        <path d={stars.join(" ")} fill="#000000" />

        {/* Center White Circle Mask for Emblem */}
        <circle cx={centerCx} cy={centerCy} r={centerRadius} fill="#FFFFFF" />

        {/* Pixel-Perfect Signature "hf" Logo Image Overlay */}
        <image
          href={HUME_HF_LOGO_BASE64}
          x={centerCx - centerRadius * 0.88}
          y={centerCy - centerRadius * 0.88}
          width={centerRadius * 1.76}
          height={centerRadius * 1.76}
          preserveAspectRatio="xMidYMid meet"
        />
      </svg>
    </div>
  );
}
