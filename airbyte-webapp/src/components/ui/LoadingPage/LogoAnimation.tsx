import React from "react";

type LogoAnimationProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const LogoAnimation: React.FC<LogoAnimationProps> = ({ title, ...props }) => {
  return (
    <div
      role="img"
      aria-label={title || "Ailiv"}
      {...props}
      style={{
        width: 180,
        maxWidth: "42vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        filter: "drop-shadow(0 12px 28px rgba(163, 40, 224, 0.28))",
        ...props.style,
      }}
    >
      <style>
        {"@keyframes ailivLogoPulse{0%,100%{opacity:.72;transform:scale(.98)}50%{opacity:1;transform:scale(1.02)}}"}
      </style>
      <img
        src="/logo_ailiv.png"
        alt=""
        style={{
          width: "100%",
          height: "auto",
          animation: "ailivLogoPulse 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
};
