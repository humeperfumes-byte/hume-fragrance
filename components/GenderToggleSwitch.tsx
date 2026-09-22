"use client";

import React from "react";

interface GenderToggleSwitchProps {
  value: "Men" | "Women";
  onChange: (value: "Men" | "Women") => void;
  className?: string;
}

export function GenderToggleSwitch({
  value,
  onChange,
  className = "",
}: GenderToggleSwitchProps) {
  const isChecked = value === "Women";

  return (
    <div className={`gender-toggle-wrapper flex items-center gap-2.5 ${className}`}>
      <span
        onClick={() => onChange("Men")}
        className={`cursor-pointer select-none text-xs tracking-wider uppercase transition-all duration-300 font-bold ${
          !isChecked
            ? "text-[#6cf] drop-shadow-[0_0_8px_rgba(102,204,255,0.4)]"
            : "text-muted-foreground/50 hover:text-foreground font-medium"
        }`}
      >
        Men
      </span>

      <div className="checkbox-wrapper-25">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked ? "Women" : "Men")}
          aria-label="Toggle between Men and Women"
        />
      </div>

      <span
        onClick={() => onChange("Women")}
        className={`cursor-pointer select-none text-xs tracking-wider uppercase transition-all duration-300 font-bold ${
          isChecked
            ? "text-[#f66] drop-shadow-[0_0_8px_rgba(255,102,102,0.4)]"
            : "text-muted-foreground/50 hover:text-foreground font-medium"
        }`}
      >
        Women
      </span>

      <style jsx>{`
        .checkbox-wrapper-25 input[type="checkbox"] {
          background-image: -webkit-linear-gradient(
              hsla(0, 0%, 0%, 0.1),
              hsla(0, 0%, 100%, 0.1)
            ),
            -webkit-linear-gradient(left, #6cf 50%, #f66 50%);
          background-image: linear-gradient(
              hsla(0, 0%, 0%, 0.1),
              hsla(0, 0%, 100%, 0.1)
            ),
            linear-gradient(to right, #6cf 50%, #f66 50%);
          background-size: 100% 100%, 200% 100%;
          background-position: 0 0, 15px 0;
          border-radius: 25px;
          box-shadow:
            inset 0 1px 4px hsla(0, 0%, 0%, 0.5),
            inset 0 0 10px hsla(0, 0%, 0%, 0.5),
            0 0 0 1px hsla(0, 0%, 0%, 0.1),
            0 -1px 2px 2px hsla(0, 0%, 0%, 0.25),
            0 2px 2px 2px hsla(0, 0%, 100%, 0.75);
          cursor: pointer;
          height: 25px;
          padding-right: 25px;
          width: 75px;
          -webkit-appearance: none;
          appearance: none;
          -webkit-transition: 0.25s;
          transition: 0.25s;
          display: block;
          outline: none;
        }

        .checkbox-wrapper-25 input[type="checkbox"]:after {
          background-color: #eee;
          background-image: -webkit-linear-gradient(
            hsla(0, 0%, 100%, 0.1),
            hsla(0, 0%, 0%, 0.1)
          );
          background-image: linear-gradient(
            hsla(0, 0%, 100%, 0.1),
            hsla(0, 0%, 0%, 0.1)
          );
          border-radius: 25px;
          box-shadow:
            inset 0 1px 1px 1px hsla(0, 0%, 100%, 1),
            inset 0 -1px 1px 1px hsla(0, 0%, 0%, 0.25),
            0 1px 3px 1px hsla(0, 0%, 0%, 0.5),
            0 0 2px hsla(0, 0%, 0%, 0.25);
          content: "";
          display: block;
          height: 25px;
          width: 50px;
        }

        .checkbox-wrapper-25 input[type="checkbox"]:checked {
          background-position: 0 0, 35px 0;
          padding-left: 25px;
          padding-right: 0;
        }
      `}</style>
    </div>
  );
}
