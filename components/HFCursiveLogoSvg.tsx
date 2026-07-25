import React from "react";

interface HFCursiveLogoSvgProps {
  color?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function HFCursiveLogoSvg({
  color = "#000000",
  width = "100%",
  height = "100%",
  className = "",
}: HFCursiveLogoSvgProps) {
  return (
    <svg
      viewBox="0 0 500 240"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 
        Signature "hf" vector path with tall elegant loops 
        and flowing horizontal flourish baseline lines matching HUME brand signature logo.
      */}
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {/* Left Horizontal Flourish Line -> h stem */}
        <path
          d="M 15 125 C 65 118, 125 138, 175 118 C 182 85, 192 38, 206 32 C 218 26, 226 48, 214 88 C 206 115, 195 146, 190 172 C 188 182, 194 185, 201 170 C 212 145, 228 118, 240 108 C 250 100, 258 112, 250 128 C 256 90, 268 38, 280 32 C 292 26, 300 48, 288 88 C 276 128, 262 176, 255 212 C 248 248, 270 215, 282 165 C 286 145, 292 128, 298 125 C 345 128, 425 118, 485 124"
          strokeWidth="8"
        />

        {/* Inner loop detailing for h and f */}
        <path
          d="M 203 52 C 210 38, 218 42, 212 65 C 208 80, 202 105, 198 130"
          strokeWidth="4"
          opacity="0.9"
        />
        <path
          d="M 277 52 C 284 38, 292 42, 286 65 C 280 88, 268 135, 260 180"
          strokeWidth="4"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
