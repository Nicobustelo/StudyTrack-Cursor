import React from "react";
import { colors } from "../theme";

/**
 * Mockup genérico de teléfono (dibujado a mano, sin assets de terceros).
 * children se renderiza como "pantalla" con overflow hidden.
 */
export const PhoneFrame: React.FC<{
  width: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, children, style }) => {
  const height = width * 2.05;
  const bezel = width * 0.032;
  const radius = width * 0.14;
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        background: colors.textPrimary,
        padding: bezel,
        boxShadow: "0 40px 90px rgba(22,37,28,0.28)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          background: colors.background,
          overflow: "hidden",
        }}
      >
        {children}
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: width * 0.028,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.28,
            height: width * 0.06,
            borderRadius: 999,
            background: colors.textPrimary,
          }}
        />
      </div>
    </div>
  );
};
