export const R = { card: 24, pill: 999, xl: 32 };
export const C = { cream: "#FAF9F6", ink: "#111111", dim: "#888888" };

export const glass = {
  card:   { background: "rgba(255,255,255,0.78)", backdropFilter: "blur(28px) saturate(200%)", WebkitBackdropFilter: "blur(28px) saturate(200%)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.95)" },
  dark:   { background: "rgba(17,17,17,0.88)",    backdropFilter: "blur(24px) saturate(200%)", WebkitBackdropFilter: "blur(24px) saturate(200%)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" },
  nav:    { background: "rgba(250,249,246,0.88)", backdropFilter: "blur(20px)",                WebkitBackdropFilter: "blur(20px)",                border: "none", boxShadow: "0 1px 0 rgba(0,0,0,0.05)" },
  pill:   { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" },
  accent: (color) => ({ background: `${color}EE`, backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: `1px solid ${color}44`, boxShadow: `0 12px 40px ${color}44` }),
};
