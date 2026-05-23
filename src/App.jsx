import { useState, useCallback, useMemo, useRef, useEffect, Component } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw, BarChart2,
  Home, ChevronLeft, Target, ArrowRight, Bookmark, BookMarked, Sparkles,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette, Users, Heart,
  Smile, Globe, Volume2, VolumeX, Search, Award, HelpCircle, RefreshCw,
  BookMarked as BookMarkedIcon, Star, Lock
} from "lucide-react";
import { LANG_META, DECKS, DECK_KEYS, VOCAB, getDeckLabel } from "./data.js";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function getStorage(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } }
function setStorage(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── LEVEL / XP ───────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 100;
function getLevel(xp)     { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function getXPInLevel(xp) { return xp % XP_PER_LEVEL; }

const LANG_UNLOCK_LEVEL = { es: 1, it: 1, ru: 3, fr: 3 };

function getStreakMultiplier(streak) {
  if (streak >= 14) return 3;
  if (streak >= 7)  return 2;
  if (streak >= 3)  return 1.5;
  return 1;
}
function getMultiplierLabel(m) { return m === 1 ? null : `×${m}`; }

const BADGES = [
  { id: "first_deck", icon: "⚡", label: "Primeira categoria",  check: (s)       => Object.keys(s.completedDecks || {}).length >= 1 },
  { id: "perfect",    icon: "🎯", label: "Sem erros",           check: (s)       => (s.perfectSessions || 0) >= 1 },
  { id: "streak_7",   icon: "🔥", label: "7 dias seguidos",     check: (_, str)  => str >= 7 },
  { id: "streak_30",  icon: "🌙", label: "30 dias seguidos",    check: (_, str)  => str >= 30 },
  { id: "polyglot",   icon: "🌍", label: "Poliglota",           check: (s)       => Object.keys(s.studied || {}).length >= 4 },
  { id: "cards_100",  icon: "💬", label: "100 cards",           check: (s)       => (s.totalAttempts || 0) >= 100 },
  { id: "cards_500",  icon: "📚", label: "500 cards",           check: (s)       => (s.totalAttempts || 0) >= 500 },
  { id: "all_it",     icon: "🏆", label: "Mestre Italiano",     check: (s)       => DECK_KEYS.every(k => s.completedDecks?.[k]?.includes("it")) },
  { id: "all_es",     icon: "🏆", label: "Mestre Espanhol",     check: (s)       => DECK_KEYS.every(k => s.completedDecks?.[k]?.includes("es")) },
  { id: "sharp",      icon: "✨", label: "Afiado",              check: (s)       => (s.totalAttempts || 0) >= 20 && Math.round((s.totalCorrect || 0) / (s.totalAttempts || 1) * 100) >= 90 },
];

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const R = { card: 24, pill: 999, xl: 32 };
const C = { cream: "#FAF9F6", ink: "#111111", dim: "#888888" };

// ─── GLASS STYLES ─────────────────────────────────────────────────────────────
const glass = {
  card:   { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" },
  dark:   { background: "rgba(17,17,17,0.82)",   backdropFilter: "blur(24px) saturate(200%)", WebkitBackdropFilter: "blur(24px) saturate(200%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" },
  nav:    { background: "rgba(250,249,246,0.88)", backdropFilter: "blur(20px)",                WebkitBackdropFilter: "blur(20px)",                border: "none", boxShadow: "0 1px 0 rgba(0,0,0,0.05)" },
  pill:   { background: "rgba(255,255,255,0.55)", backdropFilter: "blur(12px)",                WebkitBackdropFilter: "blur(12px)",                border: "1px solid rgba(255,255,255,0.7)",  boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  accent: (color) => ({ background: `${color}EE`, backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)", border: `1px solid ${color}44`, boxShadow: `0 12px 40px ${color}44` }),
};

// ─── BADGE ILLUSTRATIONS ──────────────────────────────────────────────────────
const BadgeIllustrations = {
  first_deck: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FFF0B2"} />
      <path d="M18 8 L20.5 14.5 L27.5 15 L22.5 19.5 L24 26.5 L18 23 L12 26.5 L13.5 19.5 L8.5 15 L15.5 14.5 Z" fill={dim ? "#BDBDBD" : "#F59E0B"} />
    </svg>
  ),
  perfect: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#D1FAE5"} />
      <circle cx="18" cy="18" r="6" fill={dim ? "#BDBDBD" : "#10B981"} />
      <circle cx="18" cy="18" r="10" stroke={dim ? "#BDBDBD" : "#10B981"} strokeWidth="2" fill="none" />
      <path d="M14 18 L17 21 L22 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  streak_7: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FEF3C7"} />
      <path d="M20 9 C20 9 22 13 20 16 C24 13 26 17 23 20 C25 20 26 22 24 24 C22 26 19 27 18 27 C13 27 10 23.5 10 20 C10 17 12 15 14 15 C12 12 14 9 16 10 C16 13 18 14 18 14 C18 14 18 10 20 9Z" fill={dim ? "#BDBDBD" : "#F59E0B"} />
    </svg>
  ),
  streak_30: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#EDE9FE"} />
      <path d="M18 9 L19.5 13.5 L24 12 L21 15.5 L25 18 L21 20.5 L24 24 L19.5 22.5 L18 27 L16.5 22.5 L12 24 L15 20.5 L11 18 L15 15.5 L12 12 L16.5 13.5 Z" fill={dim ? "#BDBDBD" : "#8B5CF6"} />
    </svg>
  ),
  polyglot: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#DBEAFE"} />
      <ellipse cx="18" cy="18" rx="9" ry="5.5" stroke={dim ? "#BDBDBD" : "#3B82F6"} strokeWidth="1.5" fill="none" />
      <ellipse cx="18" cy="18" rx="9" ry="9" stroke={dim ? "#BDBDBD" : "#3B82F6"} strokeWidth="1.5" fill="none" />
      <line x1="9" y1="18" x2="27" y2="18" stroke={dim ? "#BDBDBD" : "#3B82F6"} strokeWidth="1.5" />
      <line x1="18" y1="9" x2="18" y2="27" stroke={dim ? "#BDBDBD" : "#3B82F6"} strokeWidth="1.5" />
    </svg>
  ),
  cards_100: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FCE7F3"} />
      <rect x="11" y="14" width="14" height="10" rx="2.5" fill={dim ? "#BDBDBD" : "#EC4899"} opacity="0.4" />
      <rect x="13" y="12" width="14" height="10" rx="2.5" fill={dim ? "#BDBDBD" : "#EC4899"} opacity="0.65" />
      <rect x="15" y="10" width="11" height="9" rx="2.5" fill={dim ? "#BDBDBD" : "#EC4899"} />
      <path d="M17.5 14.5 L18.5 16.5 L20.5 13 L21.5 17 L23 15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  cards_500: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FFEDD5"} />
      <rect x="11" y="16" width="14" height="10" rx="2.5" fill={dim ? "#BDBDBD" : "#F97316"} opacity="0.35" />
      <rect x="12" y="13" width="14" height="10" rx="2.5" fill={dim ? "#BDBDBD" : "#F97316"} opacity="0.6" />
      <rect x="13" y="10" width="12" height="9" rx="2.5" fill={dim ? "#BDBDBD" : "#F97316"} />
      <text x="19" y="17" textAnchor="middle" fill="white" fontSize="5.5" fontWeight="900">500</text>
    </svg>
  ),
  all_it: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#D1FAE5"} />
      <rect x="13" y="22" width="10" height="3" rx="1.5" fill={dim ? "#BDBDBD" : "#059669"} />
      <rect x="15" y="13" width="6" height="9" rx="1" fill={dim ? "#BDBDBD" : "#059669"} opacity="0.4" />
      <path d="M14 13 L18 9 L22 13" fill={dim ? "#BDBDBD" : "#059669"} />
      <path d="M16 13 L18 10.5 L20 13" fill={dim ? "#BDBDBD" : "#34D399"} />
    </svg>
  ),
  all_es: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FEE2E2"} />
      <rect x="13" y="22" width="10" height="3" rx="1.5" fill={dim ? "#BDBDBD" : "#DC2626"} />
      <rect x="15" y="13" width="6" height="9" rx="1" fill={dim ? "#BDBDBD" : "#DC2626"} opacity="0.4" />
      <path d="M14 13 L18 9 L22 13" fill={dim ? "#BDBDBD" : "#DC2626"} />
      <path d="M16 13 L18 10.5 L20 13" fill={dim ? "#BDBDBD" : "#F87171"} />
    </svg>
  ),
  sharp: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#F0FDF4"} />
      <path d="M18 10 L19.5 16 L26 18 L19.5 20 L18 26 L16.5 20 L10 18 L16.5 16 Z" fill={dim ? "#BDBDBD" : "#22C55E"} />
      <path d="M26 10 L27 12.5 L29.5 13.5 L27 14.5 L26 17 L25 14.5 L22.5 13.5 L25 12.5 Z" fill={dim ? "#BDBDBD" : "#86EFAC"} />
    </svg>
  ),
};

const BADGES = [
  { id: "first_deck", label: "Primeira categoria",  check: (s)      => Object.keys(s.completedDecks || {}).length >= 1 },
  { id: "perfect",    label: "Sem erros",           check: (s)      => (s.perfectSessions || 0) >= 1 },
  { id: "streak_7",   label: "7 dias seguidos",     check: (_, str) => str >= 7 },
  { id: "streak_30",  label: "30 dias seguidos",    check: (_, str) => str >= 30 },
  { id: "polyglot",   label: "Poliglota",           check: (s)      => Object.keys(s.studied || {}).length >= 4 },
  { id: "cards_100",  label: "100 cards",           check: (s)      => (s.totalAttempts || 0) >= 100 },
  { id: "cards_500",  label: "500 cards",           check: (s)      => (s.totalAttempts || 0) >= 500 },
  { id: "all_it",     label: "Mestre Italiano",     check: (s)      => DECK_KEYS.every(k => s.completedDecks?.[k]?.includes("it")) },
  { id: "all_es",     label: "Mestre Espanhol",     check: (s)      => DECK_KEYS.every(k => s.completedDecks?.[k]?.includes("es")) },
  { id: "sharp",      label: "Afiado",              check: (s)      => (s.totalAttempts || 0) >= 20 && Math.round((s.totalCorrect || 0) / (s.totalAttempts || 1) * 100) >= 90 },
];
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", gap: 16, backgroundColor: C.cream }}>
        <p style={{ fontWeight: 900, color: C.ink, fontSize: "1.2rem" }}>Algo deu errado.</p>
        <p style={{ color: C.dim, fontSize: "0.875rem" }}>{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })}
          style={{ padding: "14px 32px", backgroundColor: C.ink, color: C.cream, fontWeight: 900, borderRadius: R.pill, border: "none", cursor: "pointer" }}>
          Tentar novamente
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Particle({ color }) {
  const angle = Math.random() * 360, dist = 100 + Math.random() * 160;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 6 + Math.random() * 8;
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ width: size, height: size, borderRadius: R.card, backgroundColor: color, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: 360 }}
      transition={{ duration: 0.9 + Math.random() * 0.5, ease: "easeOut" }} />
  );
}
function Confetti({ active, accentColor }) {
  const colors = accentColor
    ? [accentColor, C.cream, C.ink, accentColor + "AA"]
    : ["#E63329", "#1B4FD8", "#1A7A4A", C.cream];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 52 }).map((_, i) => <Particle key={i} color={colors[i % colors.length]} />)}
    </div>
  );
}

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
function NavBar({ title, subtitle, left, right, bg, textColor }) {
  const isAccent = bg && bg !== C.cream;
  return (
    <div className="sticky top-0 z-40"
      style={isAccent ? { backgroundColor: bg } : { ...glass.nav }}>
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-5">
        <div className="w-20 flex justify-start">{left}</div>
        <div className="flex flex-col items-center">
          {title    && <span className="text-xs font-black tracking-widest uppercase" style={{ color: textColor || C.ink, opacity: 0.4 }}>{title}</span>}
          {subtitle && <span className="text-xs font-semibold"                        style={{ color: textColor || C.ink, opacity: 0.35 }}>{subtitle}</span>}
        </div>
        <div className="w-20 flex justify-end">{right}</div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const steps = [
    { title: "Bem-vindo ao\nLinguaFlash",  body: "Aprenda vocabulário em 4 idiomas com flashcards. Feito para brasileiros.",        accent: "#E63329" },
    { title: "Vire o\ncard",               body: "Toque para revelar a tradução. Diga se você conhecia a palavra ou não.",           accent: "#1A7A4A" },
    { title: "Salve\nfavoritas",           body: "Toque no ícone de favorito para salvar palavras difíceis e revisar depois.",       accent: "#1B4FD8" },
    { title: "Mantenha\no streak",         body: "Estude todo dia, acumule XP, suba de nível e desbloqueie novos idiomas.",         accent: "#1251A3" },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const { title, body, accent } = steps[step];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: C.cream }}>
      <button onClick={onDone} className="absolute top-6 right-6 z-10 text-xs font-black tracking-widest uppercase"
        style={{ color: C.dim }}>Pular</button>
      {/* Accent circle — geometric decoration like ref 1 */}
      <motion.div key={`circle-${step}`}
        initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 0.13 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="absolute -top-16 -right-24 rounded-full pointer-events-none"
        style={{ width: 360, height: 360, backgroundColor: accent }} />
      <div className="flex-1 flex flex-col justify-end px-6 pb-12 max-w-md mx-auto w-full">
        <motion.div key={`text-${step}`} initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.2, 0, 0, 1] }}>
          <h2 className="font-black whitespace-pre-line mb-5"
            style={{ fontSize: "3.5rem", color: C.ink, lineHeight: 1.0, letterSpacing: "-0.02em" }}>{title}</h2>
          <p style={{ color: C.dim, fontSize: "1rem", lineHeight: 1.7 }}>{body}</p>
        </motion.div>
        <div className="flex gap-2 mt-10 mb-8">
          {steps.map((_, i) => (
            <motion.div key={i} animate={{ width: i === step ? 28 : 8 }}
              className="h-2 rounded-full" style={{ backgroundColor: i === step ? C.ink : "#DEDBD7" }} />
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.96 }}
          onClick={() => isLast ? onDone() : setStep(s => s + 1)}
          className="w-full flex items-center justify-between px-7 py-5 font-black"
          style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.xl, fontSize: "1.1rem" }}>
          <span>{isLast ? "Começar" : "Próximo"}</span>
          <ArrowRight size={22} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── HELP MODAL ───────────────────────────────────────────────────────────────
function HelpModal({ onClose }) {
  const items = [
    { Icon: RotateCcw, label: "Toque no card para revelar a tradução" },
    { Icon: Check,     label: '"Eu Conheço!" remove o card da fila' },
    { Icon: X,         label: '"Ainda Aprendendo" recicla o card para mais tarde' },
    { Icon: Bookmark,  label: "Favorito salva palavras para revisar depois" },
    { Icon: Volume2,   label: "Ícone de som toca a pronúncia" },
    { Icon: Flame,     label: "Estude todo dia para manter o streak e subir de nível" },
    { Icon: Lock,      label: "Russo e Francês desbloqueiam no nível 3" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md pb-10 px-6 pt-7"
        style={{ backgroundColor: C.cream, borderRadius: `${R.xl}px ${R.xl}px 0 0` }}>
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-black" style={{ fontSize: "1.75rem", color: C.ink }}>Como funciona</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "#EBEBEB" }}>
            <X size={18} style={{ color: C.ink }} />
          </button>
        </div>
        <div className="space-y-5">
          {items.map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EBEBEB", borderRadius: R.card }}>
                <Icon size={18} strokeWidth={1.5} style={{ color: C.ink }} />
              </div>
              <p className="text-sm font-medium" style={{ color: C.ink, opacity: 0.7 }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    const start = performance.now(), dur = 600;
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

function StatsScreen({ stats, xp, streak, onBack, onStudyDeck }) {
  const totalStudied  = Object.values(stats.studied || {}).reduce((a, b) => a + b, 0);
  const overallAcc    = stats.totalAttempts > 0 ? Math.round(stats.totalCorrect / stats.totalAttempts * 100) : 0;
  const level         = getLevel(xp);
  const xpInLevel     = getXPInLevel(xp);
  const earnedBadges  = BADGES.filter(b => b.check(stats, streak));
  const lockedBadges  = BADGES.filter(b => !b.check(stats, streak));

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen" style={{ backgroundColor: C.cream }}>
      <NavBar left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><ChevronLeft size={18} /> Voltar</button>} />
      <div className="max-w-md mx-auto px-5 pt-2 pb-20 space-y-4">

        {/* Level hero — dark glass */}
        <div className="relative overflow-hidden p-7" style={{ ...glass.dark, borderRadius: R.xl }}>
          <div className="absolute -right-8 -top-8 rounded-full pointer-events-none"
            style={{ width: 160, height: 160, background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />
          <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Nível atual</div>
          <div className="font-black leading-none mb-1" style={{ fontSize: "5rem", color: C.cream }}>
            <AnimatedNumber value={level} />
          </div>
          <div className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
            <AnimatedNumber value={xpInLevel} />/100 XP → nível {level + 1}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9))" }}
              initial={{ width: 0 }} animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }} />
          </div>
          {getStreakMultiplier(streak) > 1 && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#EF9F27", boxShadow: "0 4px 12px rgba(239,159,39,0.4)" }}>
              <Flame size={12} className="text-white" />
              <span className="text-xs font-black text-white">{getMultiplierLabel(getStreakMultiplier(streak))} XP ativo</span>
            </div>
          )}
        </div>

        {/* Stats row — glass cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Estudadas", value: totalStudied,  suffix: ""  },
            { label: "Precisão",  value: overallAcc,    suffix: "%" },
            { label: "Streak",    value: streak,        suffix: ""  },
          ].map(({ label, value, suffix }, i) => (
            <div key={i} className="p-5 flex flex-col items-center" style={{ ...glass.card, borderRadius: R.xl }}>
              <div className="font-black mb-1" style={{ fontSize: "1.75rem", color: C.ink }}>
                <AnimatedNumber value={value} suffix={suffix} />
              </div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: C.dim }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Badges — SVG illustrations */}
        <div className="p-6" style={{ ...glass.card, borderRadius: R.xl }}>
          <div className="text-xs font-black tracking-widest uppercase mb-5" style={{ color: C.dim }}>Conquistas</div>
          {earnedBadges.length === 0 && (
            <p className="text-sm text-center py-3" style={{ color: C.dim }}>Complete sessões para ganhar conquistas</p>
          )}
          <div className="grid grid-cols-4 gap-2 mb-2">
            {earnedBadges.map(b => {
              const Illus = BadgeIllustrations[b.id];
              return (
                <motion.div key={b.id} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 text-center"
                  style={{ background: "rgba(255,255,255,0.8)", borderRadius: R.card, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {Illus ? <Illus dim={false} /> : <span style={{ fontSize: 26 }}>⭐</span>}
                  <span className="text-xs font-bold leading-tight" style={{ color: C.ink }}>{b.label}</span>
                </motion.div>
              );
            })}
            {lockedBadges.map(b => {
              const Illus = BadgeIllustrations[b.id];
              return (
                <div key={b.id} className="flex flex-col items-center gap-1.5 py-3 px-1 text-center"
                  style={{ background: "rgba(255,255,255,0.4)", borderRadius: R.card, opacity: 0.45 }}>
                  {Illus ? <Illus dim={true} /> : <span style={{ fontSize: 26, filter: "grayscale(1)" }}>⭐</span>}
                  <span className="text-xs font-medium leading-tight" style={{ color: C.dim }}>{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed decks */}
        {Object.keys(stats.completedDecks || {}).length > 0 && (
          <div className="p-6" style={{ ...glass.card, borderRadius: R.xl }}>
            <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: C.dim }}>Categorias concluídas</div>
            <div className="space-y-3">
              {Object.entries(stats.completedDecks || {}).map(([key, langs]) => {
                const DeckIcon = DECKS[key]?.icon || BookOpen;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <DeckIcon size={16} strokeWidth={1.5} style={{ color: C.dim, flexShrink: 0 }} />
                    <span className="text-sm font-bold flex-1" style={{ color: C.ink }}>{DECKS[key]?.label}</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {langs.map(lc => {
                        const lm = LANG_META[lc];
                        if (!lm) return null;
                        return (
                          <button key={lc} onClick={() => onStudyDeck(lc, key)}
                            className="text-xs font-black px-2.5 py-1"
                            style={{ backgroundColor: lm.accent, color: "#fff", borderRadius: R.pill, boxShadow: `0 2px 8px ${lm.accent}55` }}>
                            {lm.name.split(" ")[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}


// ─── FLAG ICON ────────────────────────────────────────────────────────────────
const FLAG_ICONS = { es: "/espanha.png", it: "/italia.png", ru: "/russia.png", fr: "/franca.png" };
function FlagIcon({ langCode, size = 40 }) {
  const src = FLAG_ICONS[langCode];
  if (!src) return null;
  return <img src={src} alt={langCode} width={size} height={size}
    style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }} />;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ xp, streak, favorites, stats, onSelectLang, onOpenFavorites, onOpenStats, lastStudied }) {
  const [showHelp, setShowHelp] = useState(false);
  const favCount = Object.keys(favorites).length;

  const prevStreak = useRef(streak);
  const [streakPop, setStreakPop] = useState(false);
  useEffect(() => {
    if (streak !== prevStreak.current) {
      setStreakPop(true);
      setTimeout(() => setStreakPop(false), 600);
      prevStreak.current = streak;
    }
  }, [streak]);

  const prevXP = useRef(xp);
  const [displayXP, setDisplayXP] = useState(xp);
  useEffect(() => {
    if (xp === prevXP.current) return;
    const from = prevXP.current, to = xp;
    prevXP.current = xp;
    const start = performance.now(), dur = 900;
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      setDisplayXP(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [xp]);

  const currentLevel = getLevel(displayXP);
  const xpInLevel    = getXPInLevel(displayXP);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen" style={{ backgroundColor: C.cream }}>
      <NavBar right={
        <button onClick={() => setShowHelp(true)} className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ backgroundColor: "#EBEBEB" }}>
          <HelpCircle size={18} style={{ color: C.dim }} />
        </button>
      } />
      <AnimatePresence>{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}</AnimatePresence>

      <div className="max-w-md mx-auto px-5 pt-2 pb-28">
        {/* Editorial hero — streak as massive number */}
        <div className="mb-7">
          <motion.div className="font-black leading-none"
            style={{ fontSize: "5.5rem", color: C.ink, letterSpacing: "-0.03em" }}
            animate={streakPop ? { scale: [1, 1.05, 1] } : {}}>
            {streak}
            <span className="ml-3 font-semibold" style={{ fontSize: "1.5rem", color: C.dim }}>dias</span>
          </motion.div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0DDD9" }}>
              <motion.div className="h-full rounded-full" style={{ backgroundColor: C.ink }}
                animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} />
            </div>
            <button onClick={onOpenStats} className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-black" style={{ color: C.dim }}>Nível {currentLevel}</span>
              {getStreakMultiplier(streak) > 1 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EF9F27", color: "#fff" }}>
                  {getMultiplierLabel(getStreakMultiplier(streak))}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Continue card */}
        {lastStudied && LANG_META[lastStudied] && (() => {
          const lang = LANG_META[lastStudied];
          const firstIncomplete = DECK_KEYS.find(k => !(stats.completedDecks?.[k]?.includes(lastStudied)));
          const doneCount = DECK_KEYS.filter(k => stats.completedDecks?.[k]?.includes(lastStudied)).length;
          return firstIncomplete ? (
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onSelectLang(lastStudied, firstIncomplete)}
              className="w-full flex items-center justify-between px-6 py-5 mb-6 text-left"
              style={{ backgroundColor: lang.accent, borderRadius: R.xl }}>
              <div className="flex items-center gap-4">
                <FlagIcon langCode={lastStudied} size={48} />
                <div>
                  <div className="text-xs font-black tracking-widest uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Continuar</div>
                  <div className="font-black text-white" style={{ fontSize: "1.3rem", letterSpacing: "-0.01em" }}>{lang.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {getDeckLabel(firstIncomplete, lastStudied)} · {doneCount}/{DECK_KEYS.length}
                  </div>
                </div>
              </div>
              <ArrowRight size={22} className="text-white shrink-0" />
            </motion.button>
          ) : null;
        })()}

        {/* Language list */}
        <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: C.dim }}>Idiomas</div>
        <div className="space-y-3 mb-6">
          {Object.entries(LANG_META).map(([code, lang], i) => {
            const doneCount = DECK_KEYS.filter(k => stats.completedDecks?.[k]?.includes(code)).length;
            const required  = LANG_UNLOCK_LEVEL[code] || 1;
            const locked    = currentLevel < required;
            return (
              <motion.button key={code} onClick={() => !locked && onSelectLang(code)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
                whileTap={locked ? {} : { scale: 0.97 }}
                className="w-full text-left"
                style={{ ...glass.card, borderRadius: R.xl, opacity: locked ? 0.5 : 1, cursor: locked ? "default" : "pointer" }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <FlagIcon langCode={code} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="font-black leading-none" style={{ fontSize: "1.5rem", color: C.ink, letterSpacing: "-0.01em" }}>{lang.name}</div>
                    <div className="text-xs font-medium mt-1" style={{ color: C.dim }}>
                      {locked
                        ? <span className="flex items-center gap-1"><Lock size={10} /> Nível {required}</span>
                        : `${DECK_KEYS.length} categorias · ${Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras`
                      }
                    </div>
                  </div>
                  {!locked && doneCount > 0 && (
                    <span className="text-xs font-black px-2.5 py-1 shrink-0"
                      style={{ backgroundColor: "#16A34A", color: "#fff", borderRadius: R.pill }}>
                      {doneCount}/{DECK_KEYS.length}
                    </span>
                  )}
                  {locked
                    ? <Lock size={18} style={{ color: C.dim, flexShrink: 0 }} />
                    : <ChevronRight size={18} style={{ color: C.dim, flexShrink: 0 }} />
                  }
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button onClick={onOpenFavorites}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm"
            style={{ ...glass.card, borderRadius: R.xl, color: C.ink }}>
            <Bookmark size={18} strokeWidth={1.5} />
            Favoritas
            {favCount > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: C.ink, color: C.cream }}>{favCount}</span>
            )}
          </button>
          <button onClick={onOpenStats}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-sm"
            style={{ ...glass.card, borderRadius: R.xl, color: C.ink }}>
            <BarChart2 size={18} strokeWidth={1.5} />
            Estatísticas
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FAVORITES SCREEN ─────────────────────────────────────────────────────────
function FavoritesScreen({ favorites, onStudyFavs, onBack, onClearAll }) {
  const favByLang  = Object.entries(LANG_META)
    .map(([code, lang]) => ({ code, lang, count: Object.keys(favorites).filter(k => k.startsWith(`${code}:`)).length }))
    .filter(x => x.count > 0);
  const totalCount = Object.keys(favorites).length;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen" style={{ backgroundColor: C.cream }}>
      <NavBar left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><ChevronLeft size={18} /> Voltar</button>} />
      <div className="max-w-md mx-auto px-5 pt-2 pb-20">
        <h1 className="font-black mb-6" style={{ fontSize: "3rem", color: C.ink, letterSpacing: "-0.02em" }}>Favoritas</h1>
        {totalCount === 0 ? (
          <div className="flex flex-col items-center gap-5 pt-16 text-center">
            <div className="w-20 h-20 flex items-center justify-center" style={{ backgroundColor: "#EBEBEB", borderRadius: R.xl }}>
              <Bookmark size={32} strokeWidth={1.5} style={{ color: C.dim }} />
            </div>
            <p className="font-black text-xl" style={{ color: C.ink }}>Nenhuma favorita ainda</p>
            <p className="text-sm max-w-xs" style={{ color: C.dim }}>Salve palavras difíceis tocando no ícone de favorito durante os estudos.</p>
            <motion.button whileTap={{ scale: 0.96 }} onClick={onBack}
              className="px-8 py-4 font-black mt-4"
              style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.xl }}>
              Voltar
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onStudyFavs("__all__", "__favorites_all__")}
              className="w-full flex items-center gap-4 px-6 py-5 text-left"
              style={{ backgroundColor: C.ink, borderRadius: R.xl }}>
              <div className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: R.card }}>
                <BookMarkedIcon size={22} strokeWidth={1.5} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="font-black text-white" style={{ fontSize: "1.2rem" }}>Todas as palavras</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{totalCount} palavras · todos os idiomas</div>
              </div>
              <ChevronRight size={20} className="text-white shrink-0" />
            </motion.button>
            {favByLang.map(({ code, lang, count }) => (
              <motion.button key={code} whileTap={{ scale: 0.97 }}
                onClick={() => onStudyFavs(code, "__favorites__")}
                className="w-full flex items-center gap-4 px-6 py-5 text-left"
                style={{ backgroundColor: "#EBEBEB", borderRadius: R.xl }}>
                <FlagIcon langCode={code} size={52} />
                <div className="flex-1">
                  <div className="font-black" style={{ fontSize: "1.2rem", color: C.ink }}>{lang.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.dim }}>{count} {count === 1 ? "palavra" : "palavras"}</div>
                </div>
                <ChevronRight size={18} style={{ color: C.dim, flexShrink: 0 }} />
              </motion.button>
            ))}
            <button onClick={onClearAll}
              className="w-full flex items-center justify-center gap-2 py-4 font-bold text-sm mt-1"
              style={{ color: "#E63329" }}>
              <X size={15} /> Limpar tudo
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── DECK SELECTOR ────────────────────────────────────────────────────────────
function DeckSelector({ langCode, onSelectDeck, onBack, streak, completedDecks }) {
  const lang      = LANG_META[langCode];
  const [query, setQuery] = useState("");
  const filtered  = DECK_KEYS.filter(k => getDeckLabel(k, langCode).toLowerCase().includes(query.toLowerCase()));
  const doneCount = DECK_KEYS.filter(k => completedDecks[k]?.includes(langCode)).length;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen" style={{ backgroundColor: lang.accent }}>
      <NavBar bg={lang.accent} textColor="rgba(255,255,255,0.5)"
        left={
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black"
            style={{ color: "rgba(255,255,255,0.75)" }}>
            <ChevronLeft size={18} /> Início
          </button>
        }
        right={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
            <Flame size={13} className="text-white" />
            <span className="text-xs font-black text-white">{streak}</span>
          </div>
        }
      />
      <div className="max-w-md mx-auto px-5 pt-2 pb-8">
        <h1 className="font-black text-white leading-none mb-1"
          style={{ fontSize: "3.5rem", letterSpacing: "-0.02em" }}>{lang.name}</h1>
        <p className="text-sm font-medium mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
          {doneCount}/{DECK_KEYS.length} concluídas
        </p>
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.6)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-3.5 text-sm font-semibold outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.22)", borderRadius: R.pill, color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)", caretColor: "#ffffff" }}
          />
        </div>
        <div className="space-y-3">
          {filtered.map((key, i) => {
            const deck = DECKS[key];
            const Icon = deck.icon;
            const done = completedDecks[key]?.includes(langCode);
            return (
              <motion.button key={key} onClick={() => onSelectDeck(key)}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                style={done
                  ? { ...glass.card, borderRadius: R.xl }
                  : { background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: R.xl }}>
                <div className="flex items-center gap-4">
                  <Icon size={26} strokeWidth={1.5}
                    style={{ color: done ? lang.accent : "rgba(255,255,255,0.9)", flexShrink: 0 }} />
                  <div>
                    <div className="font-black leading-tight"
                      style={{ fontSize: "1.15rem", color: done ? C.ink : "#fff" }}>
                      {getDeckLabel(key, langCode)}
                    </div>
                    <div className="text-xs font-medium mt-0.5"
                      style={{ color: done ? C.dim : "rgba(255,255,255,0.55)" }}>
                      {VOCAB[langCode][key]?.length || 0} cards
                    </div>
                  </div>
                </div>
                {done
                  ? <span className="text-xs font-black px-2.5 py-1 shrink-0"
                      style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.pill, boxShadow: `0 4px 12px ${lang.accent}55` }}>✓ Feito</span>
                  : <ChevronRight size={18} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
                }
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center py-10 font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>Nenhuma categoria encontrada</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── FLASH CARD ───────────────────────────────────────────────────────────────
function FlashCard({ card, isFlipped, onClick, lang, langCode, isFav, onToggleFav, showLangBadge, onFavSaved }) {
  const [ttsPlaying,    setTtsPlaying]     = useState(false);
  const [ttsUnsupported,setTtsUnsupported] = useState(false);
  const [favPulse,      setFavPulse]       = useState(false);

  const handleTTS = (e) => {
    e.stopPropagation();
    if (!window.speechSynthesis) { setTtsUnsupported(true); return; }
    if (ttsPlaying) { window.speechSynthesis.cancel(); setTtsPlaying(false); return; }
    setTtsPlaying(true);
    const u = new SpeechSynthesisUtterance(card.target);
    const map = { es: "es-ES", it: "it-IT", ru: "ru-RU", fr: "fr-FR" };
    u.lang = map[langCode] || "en-US";
    u.rate = 0.85;
    u.onend = () => setTtsPlaying(false);
    u.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    const willSave = !isFav;
    onToggleFav(card);
    setFavPulse(true);
    setTimeout(() => setFavPulse(false), 500);
    if (willSave) onFavSaved && onFavSaved();
  };

  const ptLen   = (card.pt     || "").length;
  const tgtLen  = (card.target || "").length;
  const frontSz = ptLen  <= 8  ? "3rem"   : ptLen  <= 20 ? "2.25rem" : "1.5rem";
  const backSz  = tgtLen <= 12 ? "2.75rem" : tgtLen <= 24 ? "2rem"   : "1.4rem";

  return (
    <div className="w-full" style={{ perspective: 1400, height: 280 }}>
      <motion.div key={card.pt + card.target}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
        transition={{
          opacity:  { duration: 0.2 },
          y:        { type: "spring", stiffness: 380, damping: 28 },
          rotateY:  { duration: 0.48, ease: [0.4, 0, 0.2, 1] }
        }}
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", height: "100%" }}
        onClick={onClick}>

        {/* FRONT — glass morphism, massive ink type */}
        <div className="absolute inset-0 flex flex-col justify-between p-7"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            ...glass.card, borderRadius: R.xl }}>
          {showLangBadge
            ? <span className="self-start text-xs font-black px-3 py-1.5 shrink-0"
                style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.pill, boxShadow: `0 4px 12px ${lang.accent}55` }}>{lang.name}</span>
            : <div className="shrink-0" />
          }
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: C.dim }}>Português</p>
            <p className="font-black leading-none break-words"
              style={{ fontSize: frontSz, color: C.ink, letterSpacing: "-0.02em", wordBreak: "break-word", overflowWrap: "break-word", hyphens: "auto" }}>{card.pt}</p>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-medium shrink-0" style={{ color: "#C0BBB4" }}>
            <RotateCcw size={11} /> toque para revelar
          </p>
        </div>

        {/* BACK — glass accent, white editorial type */}
        <div className="absolute inset-0 flex flex-col justify-between p-7"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)", ...glass.accent(lang.accent), borderRadius: R.xl }}>
          <div className="flex items-center justify-between">
            <button onClick={handleTTS} className="p-1 -ml-1">
              {ttsPlaying
                ? <VolumeX size={20} style={{ color: "rgba(255,255,255,0.75)" }} />
                : <Volume2  size={20} style={{ color: ttsUnsupported ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)" }} />
              }
            </button>
            <motion.button onClick={handleFav}
              animate={favPulse
                ? { scale: [1, 1.5, 0.9, 1], rotate: isFav ? [0, -10, 0] : [0, 10, 0] }
                : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="p-1 -mr-1">
              {isFav
                ? <BookMarked size={20} style={{ color: "#fff" }} />
                : <Bookmark  size={20} style={{ color: "rgba(255,255,255,0.45)" }} />
              }
            </motion.button>
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{lang.name}</p>
            <p className="font-black text-white leading-none break-words"
              style={{ fontSize: backSz, letterSpacing: "-0.02em", wordBreak: "break-word", overflowWrap: "break-word" }}>{card.target}</p>
            {card.phonetic && <p className="mt-2 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>{card.phonetic}</p>}
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{card.pt}</p>
          </div>
          <div />
        </div>
      </motion.div>
    </div>
  );
}

// ─── MASTERED SCREEN ──────────────────────────────────────────────────────────
function MasteredScreen({ deckLabel, onReview, onBack, lang }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream }}>
      <NavBar left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><X size={18} /> Sair</button>} />
      <div className="flex-1 flex flex-col justify-end px-6 pb-14 max-w-md mx-auto w-full">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="w-24 h-24 flex items-center justify-center mb-8"
          style={{ backgroundColor: lang.accent, borderRadius: R.xl }}>
          <Check size={44} strokeWidth={2.5} className="text-white" />
        </motion.div>
        <h2 className="font-black leading-none mb-4"
          style={{ fontSize: "3rem", color: C.ink, letterSpacing: "-0.02em" }}>
          Categoria<br />dominada!
        </h2>
        <p className="mb-8" style={{ color: C.dim, fontSize: "1rem", lineHeight: 1.65 }}>
          Você concluiu <strong style={{ color: C.ink }}>{deckLabel}</strong>. Quer revisar ou escolher outra?
        </p>
        <div className="flex flex-col gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onReview}
            className="w-full flex items-center justify-between px-7 py-5 font-black"
            style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.xl, fontSize: "1.1rem" }}>
            <span>Revisar novamente</span><RefreshCw size={20} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            className="w-full flex items-center justify-between px-7 py-5 font-black"
            style={{ backgroundColor: "#EBEBEB", color: C.ink, borderRadius: R.xl, fontSize: "1.1rem" }}>
            <span>Escolher outra</span><ChevronLeft size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ANIMATED PROGRESS % ──────────────────────────────────────────────────────
function AnimatedProgressPct({ value, color }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value;
    prev.current = value;
    if (from === to) return;
    const start = performance.now(), dur = 500;
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="text-xs font-black"
      style={{ color }}>
      {display}%
    </motion.span>
  );
}

// ─── STUDY SCREEN ─────────────────────────────────────────────────────────────
function StudyScreen({ langCode, deckKey, onFinish, onBack, onXP, favorites, onToggleFav, isReview, streak = 0 }) {
  const isFavAll   = deckKey === "__favorites_all__";
  const isFavDeck  = deckKey === "__favorites__" || isFavAll;
  const neutralLang = { name: "Favoritas", accent: C.ink, textPrimary: C.ink, textSecondary: C.dim };
  const lang       = LANG_META[langCode] || neutralLang;
  const deckLabel  = isFavAll ? "Todas as Favoritas" : isFavDeck ? "Favoritas" : getDeckLabel(deckKey, langCode);

  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const originalCards = useMemo(() => {
    if (isFavAll)
      return shuffle(Object.entries(LANG_META).flatMap(([code]) =>
        Object.values(VOCAB[code]).flat()
          .filter(c => favorites[`${code}:${c.pt}`])
          .map(c => ({ ...c, _lang: code }))
      ));
    if (isFavDeck)
      return shuffle(Object.values(VOCAB[langCode]).flat().filter(c => favorites[`${langCode}:${c.pt}`]));
    return shuffle([...VOCAB[langCode][deckKey]]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [queue,          setQueue]          = useState(originalCards);
  const [currentIdx,     setCurrentIdx]     = useState(0);
  const [isFlipped,      setIsFlipped]      = useState(false);
  const [correct,        setCorrect]        = useState(0);
  const [incorrect,      setIncorrect]      = useState(0);
  const [answered,       setAnswered]       = useState(false);
  const [flashColor,     setFlashColor]     = useState(null);
  const [showConfetti,   setShowConfetti]   = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [favToast,       setFavToast]       = useState(false);

  const controls = useAnimation();
  const dragX    = useMotionValue(0);
  const bleedLeft  = useTransform(dragX, [-120, -20, 0], [0.2, 0, 0]);
  const bleedRight = useTransform(dragX, [0, 20, 120],  [0, 0, 0.2]);

  const total    = originalCards.length;
  const progress = total > 0 ? Math.min(correct / total, 1) : 0;
  const card     = queue[currentIdx];
  const cardLang     = isFavAll ? (card?._lang || langCode) : langCode;
  const cardLangMeta = isFavAll ? (LANG_META[card?._lang] || neutralLang) : lang;
  const accentColor  = cardLangMeta.accent;

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => { if (mounted.current) setButtonsVisible(true); }, 630);
    }
  };

  const resetCard = () => { setIsFlipped(false); setAnswered(false); setButtonsVisible(false); };

  const handleAnswer = async (knew) => {
    if (!isFlipped || answered) return;
    setAnswered(true);
    setFlashColor(knew ? "green" : "red");
    if (knew) {
      await controls.start({ x: 100, opacity: 0, rotate: 6, transition: { duration: 0.26, ease: "easeIn" } });
    } else {
      await controls.start({ x: [-6, 6, -5, 5, 0], transition: { duration: 0.35 } });
      await controls.start({ x: -100, opacity: 0, rotate: -6, transition: { duration: 0.22, ease: "easeIn" } });
    }
    if (!mounted.current) return;
    setFlashColor(null);
    controls.set({ x: 0, opacity: 1, rotate: 0 });
    if (knew) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      const newQueue = queue.filter((_, i) => i !== currentIdx);
      if (newQueue.length === 0) {
        const totalAns = newCorrect + incorrect;
        const xpGained = Math.round(newCorrect / totalAns * 50) + 10;
        const accuracy = Math.round(newCorrect / totalAns * 100);
        onXP(xpGained, accuracy);
        setShowConfetti(true);
        setTimeout(() => { if (mounted.current) onFinish({ correct: newCorrect, total: totalAns, xpGained, deckKey, langCode, accuracy }); }, 800);
        return;
      }
      setQueue(newQueue);
      setCurrentIdx(Math.min(currentIdx, newQueue.length - 1));
    } else {
      setIncorrect(inc => inc + 1);
      const nq = [...queue];
      const [rem] = nq.splice(currentIdx, 1);
      nq.splice(Math.min(currentIdx + 2, nq.length), 0, rem);
      setQueue(nq);
      setCurrentIdx(Math.min(currentIdx, nq.length - 1));
    }
    resetCard();
  };

  const handleDragEnd = (_, info) => {
    if (!isFlipped || answered) return;
    if (info.offset.x > 80)       handleAnswer(true);
    else if (info.offset.x < -80) handleAnswer(false);
  };

  if (!card) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream }}>
      <NavBar left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><X size={18} /> Sair</button>} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
        <Bookmark size={48} strokeWidth={1} style={{ color: "#DEDBD7" }} />
        <p className="font-black text-xl" style={{ color: C.ink }}>Sem palavras na fila</p>
        <p className="text-sm" style={{ color: C.dim }}>Salve palavras durante os estudos para revisá-las aqui.</p>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onBack}
          className="px-8 py-4 font-black"
          style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.xl }}>
          Voltar
        </motion.button>
      </div>
    </motion.div>
  );

  const favKey = `${cardLang}:${card.pt}`;
  const isFav  = !!favorites[favKey];
  const flashBg = flashColor === "green" ? accentColor + "22" : "rgba(220,38,38,0.1)";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream }}>
      <Confetti active={showConfetti} accentColor={accentColor} />
      <NavBar
        title={deckLabel} subtitle={isReview ? "Revisão" : undefined}
        left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><X size={18} /> Sair</button>}
        right={
          <div className="flex items-center gap-2">
            {getStreakMultiplier(streak) > 1 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#EF9F27", color: "#fff" }}>
                {getMultiplierLabel(getStreakMultiplier(streak))}
              </span>
            )}
            <span className="text-sm font-bold" style={{ color: C.dim }}>{queue.length}</span>
          </div>
        }
      />

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-4 pb-8 flex flex-col">
        {/* Progress bar + animated % */}
        <div className="mb-5">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0DDD9" }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: accentColor }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-bold" style={{ color: C.dim }}>{correct} acertadas</span>
            <AnimatedProgressPct value={Math.round(progress * 100)} color={accentColor} />
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 justify-center">
          {/* Card */}
          <div className="relative" style={{ height: 280 }}>
            <AnimatePresence>
              {flashColor && (
                <motion.div className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: flashBg, borderRadius: R.xl }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            {isFlipped && !answered && (
              <>
                <motion.div className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backgroundColor: "rgba(220,38,38,1)", opacity: bleedLeft, borderRadius: R.xl }} />
                <motion.div className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backgroundColor: accentColor, opacity: bleedRight, borderRadius: R.xl }} />
              </>
            )}
            <motion.div animate={controls} style={{ height: "100%", x: dragX }}
              drag={isFlipped && !answered ? "x" : false}
              dragConstraints={{ left: -120, right: 120 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: "grabbing" }}>
              <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip}
                lang={cardLangMeta} langCode={cardLang} isFav={isFav}
                onToggleFav={c => onToggleFav(cardLang, c)}
                onFavSaved={() => {
                  setFavToast(true);
                  setTimeout(() => { if (mounted.current) setFavToast(false); }, 1800);
                }}
                showLangBadge={isFavAll} />
            </motion.div>
          </div>

          {/* Fav toast */}
          <AnimatePresence>
            {favToast && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-40 z-30 flex items-center gap-1.5 px-4 py-2 text-xs font-black"
                style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.pill, pointerEvents: "none" }}>
                <BookMarked size={12} /> Salvo!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tip box */}
          <div className="min-h-[20px]">
            {!isFlipped ? (
              <p className="text-center text-xs font-medium" style={{ color: "#C0BBB4" }}>
                Toque no card para ver a tradução
              </p>
            ) : (card.example || card.tip) ? (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-5 py-4 space-y-2" style={{ ...glass.card, borderRadius: R.xl }}>
                {card.example && (
                  <p className="text-xs font-semibold leading-snug" style={{ color: C.ink }}>
                    <span className="font-normal mr-1" style={{ color: C.dim }}>ex.</span>{card.example}
                  </p>
                )}
                {card.tip && <p className="text-xs leading-snug" style={{ color: C.dim }}>{card.tip}</p>}
              </motion.div>
            ) : null}
          </div>

          {/* Answer buttons — glass treatment */}
          <motion.div className="flex gap-3"
            animate={{ opacity: buttonsVisible ? 1 : 0, y: buttonsVisible ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: buttonsVisible ? "auto" : "none" }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(false)}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ ...glass.card, borderRadius: R.xl, color: "#DC2626" }}>
              <X size={18} strokeWidth={2.5} />
              <span style={{ fontSize: "0.9rem" }}>Ainda Aprendendo</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(true)}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ ...glass.dark, borderRadius: R.xl, color: C.cream }}>
              <Check size={18} strokeWidth={2.5} />
              <span style={{ fontSize: "0.9rem" }}>Eu Conheço!</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats footer */}
        <div className="flex justify-center gap-10 mt-6 pt-5" style={{ borderTop: `1px solid #E8E5E0` }}>
          {[
            { label: "Acertou", val: correct,  color: "#16A34A" },
            { label: "Errou",   val: incorrect, color: "#DC2626" },
            { label: "Total",   val: total,     color: C.dim     },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="font-black" style={{ fontSize: "1.3rem", color: s.color }}>{s.val}</div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: C.dim }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
const RESULT_COPY = {
  perfect: [
    { text: "Perfeito!",          sub: "Você acertou tudo." },
    { text: "Incrível!",          sub: "100% — sem erros." },
    { text: "Sem erros!",         sub: "Domínio total." },
  ],
  great: [
    { text: "Muito bem!",         sub: "Quase perfeito." },
    { text: "Ótimo resultado!",   sub: "Continue assim." },
    { text: "Excelente!",         sub: "Evolução rápida." },
  ],
  good: [
    { text: "Bom trabalho!",      sub: "Continue praticando." },
    { text: "Progredindo!",       sub: "Cada repetição conta." },
    { text: "Na direção certa!",  sub: "A prática leva lá." },
  ],
  keep: [
    { text: "Continue!",          sub: "A repetição é a chave." },
    { text: "Não desanime!",      sub: "Repita amanhã." },
    { text: "Persista!",          sub: "Cada dia fica mais fácil." },
  ],
};

function ResultScreen({ result, langCode, deckKey, onRestart, onHome, onNextDeck, onNextLang, fromFavorites, streak = 0 }) {
  const lang         = LANG_META[langCode] ?? { accent: C.ink };
  const accuracy     = Math.round((result.correct / result.total) * 100);
  const nextDeckKey  = DECK_KEYS[DECK_KEYS.indexOf(deckKey) + 1] ?? null;
  const nextDeck     = (!fromFavorites && nextDeckKey) ? DECKS[nextDeckKey] : null;
  const langKeys     = Object.keys(LANG_META);
  const nextLangCode = (!fromFavorites && !nextDeck) ? (langKeys[langKeys.indexOf(langCode) + 1] ?? null) : null;
  const nextLang     = nextLangCode ? LANG_META[nextLangCode] : null;
  const deckName     = getDeckLabel(deckKey, langCode) || "categoria";
  const tier         = accuracy === 100 ? "perfect" : accuracy >= 80 ? "great" : accuracy >= 60 ? "good" : "keep";
  const pool         = RESULT_COPY[tier];
  const pick         = pool[Math.floor(Math.random() * pool.length)];
  const mult         = getStreakMultiplier(streak);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream }}>
      <NavBar />
      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-14 flex flex-col">

        {/* Score hero */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: C.dim }}>Resultado</div>
            <div className="font-black leading-none" style={{ fontSize: "6rem", color: C.ink, letterSpacing: "-0.03em" }}>
              {accuracy}<span style={{ fontSize: "2.5rem", color: C.dim }}>%</span>
            </div>
            <p className="font-bold mt-2" style={{ color: C.dim, fontSize: "1rem" }}>
              {pick.text} {pick.sub} <span style={{ color: C.ink }}>{result.correct}/{result.total} em {deckName}.</span>
            </p>
          </motion.div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Precisão", value: `${accuracy}%`               },
            { label: "XP Ganho", value: `+${result.xpGained}`,
              sub: mult > 1 ? getMultiplierLabel(mult) : null          },
            { label: "Acertos",  value: `${result.correct}/${result.total}` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="relative p-5 flex flex-col items-center"
              style={{ backgroundColor: lang.accent, borderRadius: R.xl }}>
              {s.sub && (
                <span className="absolute top-2 right-2 text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EF9F27", color: "#fff", fontSize: 9 }}>{s.sub}</span>
              )}
              <div className="font-black text-white" style={{ fontSize: "1.6rem" }}>{s.value}</div>
              <div className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mt-auto">
          {nextDeck && (
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextDeck(nextDeckKey)}
              className="w-full flex items-center justify-between px-7 py-5 font-black"
              style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.xl, fontSize: "1.1rem" }}>
              <span>Próxima: {getDeckLabel(nextDeckKey, langCode)}</span>
              <ArrowRight size={22} />
            </motion.button>
          )}
          {nextLang && (
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextLang(nextLangCode, DECK_KEYS[0])}
              className="w-full flex items-center justify-between px-7 py-5 font-black"
              style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.xl, fontSize: "1.1rem" }}>
              <span>Começar: {nextLang.name}</span>
              <ArrowRight size={22} />
            </motion.button>
          )}
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={onHome}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ backgroundColor: "#EBEBEB", borderRadius: R.xl, color: C.ink }}>
              <Home size={18} /> {fromFavorites ? "Favoritas" : "Início"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onRestart()}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ backgroundColor: "#EBEBEB", borderRadius: R.xl, color: C.ink }}>
              <RotateCcw size={18} /> Repetir
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── LEVEL UP OVERLAY ─────────────────────────────────────────────────────────
function LevelUpOverlay({ level, accentColor }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}>
      <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="flex flex-col items-center gap-3">
        <div className="text-xs font-black tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
          Nível alcançado
        </div>
        <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.08, 0.96, 1] }}
          transition={{ delay: 0.35, type: "spring", stiffness: 280, damping: 12 }}
          className="font-black text-white" style={{ fontSize: "8rem", lineHeight: 1, letterSpacing: "-0.04em" }}>
          {level}
        </motion.div>
        <Confetti active={true} accentColor={accentColor} />
      </motion.div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,         setScreen]         = useState(() => getStorage("lf_seen_onboard", false) ? "dashboard" : "onboard");
  const [selectedLang,   setSelectedLang]   = useState(null);
  const [selectedDeck,   setSelectedDeck]   = useState(null);
  const [result,         setResult]         = useState(null);
  const [fromFavorites,  setFromFavorites]  = useState(false);
  const [isReview,       setIsReview]       = useState(false);
  const [lastStudied,    setLastStudied]    = useState(() => getStorage("lf_last_studied", null));
  const [studySessionId, setStudySessionId] = useState(0);
  const [levelUp,        setLevelUp]        = useState(null);

  const [xp,        setXP]        = useState(() => getStorage("lf_xp", 0));
  const [favorites, setFavorites] = useState(() => getStorage("lf_favorites", {}));
  const [streak,    setStreak]    = useState(() => {
    const today     = new Date().toDateString();
    const saved     = getStorage("lf_streak", { count: 0, lastDate: null });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return (saved.lastDate === today || saved.lastDate === yesterday) ? saved.count : 0;
  });
  const [stats, setStats] = useState(() => getStorage("lf_stats", {
    totalCorrect: 0, totalAttempts: 0, completedDecks: {}, studied: {}, perfectSessions: 0
  }));

  const bumpStreak = useCallback(() => {
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    if (saved.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount  = saved.lastDate === yesterday ? saved.count + 1 : 1;
      setStreak(newCount);
      setStorage("lf_streak", { count: newCount, lastDate: today });
    }
  }, []);

  const addXP = useCallback((amount, accuracy) => {
    const multiplier = getStreakMultiplier(streak);
    const earned     = Math.round(amount * multiplier);
    setXP(prev => {
      const n = prev + earned;
      setStorage("lf_xp", n);
      if (getLevel(n) > getLevel(prev)) {
        setTimeout(() => {
          setLevelUp(getLevel(n));
          setTimeout(() => setLevelUp(null), 2400);
        }, 600);
      }
      return n;
    });
    if (accuracy === 100) {
      setStats(prev => {
        const next = { ...prev, perfectSessions: (prev.perfectSessions || 0) + 1 };
        setStorage("lf_stats", next);
        return next;
      });
    }
    bumpStreak();
  }, [bumpStreak, streak]);

  const handleToggleFav = useCallback((langCode, card) => {
    const key = `${langCode}:${card.pt}`;
    setFavorites(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      setStorage("lf_favorites", next);
      return next;
    });
  }, []);

  const updateStats = useCallback((correct, total, deckKey, langCode) => {
    setStats(prev => {
      const next = {
        ...prev,
        totalCorrect:  (prev.totalCorrect  || 0) + correct,
        totalAttempts: (prev.totalAttempts || 0) + total,
        studied: { ...prev.studied, [langCode]: ((prev.studied || {})[langCode] || 0) + total },
      };
      const existing = (prev.completedDecks || {})[deckKey] || [];
      if (!existing.includes(langCode))
        next.completedDecks = { ...prev.completedDecks, [deckKey]: [...existing, langCode] };
      setStorage("lf_stats", next);
      return next;
    });
  }, []);

  const goStudy = useCallback((lang, deck, fromFavs = false, review = false) => {
    setSelectedLang(lang); setSelectedDeck(deck);
    setFromFavorites(fromFavs);
    setIsReview(review);
    setStudySessionId(id => id + 1);
    if (!fromFavs && lang) { setLastStudied(lang); setStorage("lf_last_studied", lang); }
    setScreen("study");
  }, []);

  const handleSelectDeck = useCallback((langCode, deckKey) => {
    const isFav = deckKey.startsWith("__");
    const isDone = !isFav && stats.completedDecks?.[deckKey]?.includes(langCode);
    if (isDone) { setSelectedLang(langCode); setSelectedDeck(deckKey); setScreen("mastered"); }
    else goStudy(langCode, deckKey, false, false);
  }, [stats.completedDecks, goStudy]);

  const handleSelectLangDirect = useCallback((code, deckKey) => {
    const required = LANG_UNLOCK_LEVEL[code] || 1;
    if (getLevel(xp) < required) return;
    setSelectedLang(code);
    if (deckKey) handleSelectDeck(code, deckKey);
    else setScreen("decks");
  }, [handleSelectDeck, xp]);

  const handleStudyFromStats = useCallback((langCode, deckKey) => {
    goStudy(langCode, deckKey, false, true);
  }, [goStudy]);

  const backFromStudy  = useCallback(() => setScreen(fromFavorites ? "favorites" : "decks"), [fromFavorites]);
  const homeFromResult = useCallback(() => setScreen(fromFavorites ? "favorites" : "dashboard"), [fromFavorites]);

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased", backgroundColor: C.cream }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{font-family:'Inter',sans-serif}body{background:${C.cream};background-image:radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,190,180,0.18), transparent)}::placeholder{color:rgba(255,255,255,0.45)!important}`}</style>
        <AnimatePresence>
          {levelUp && (
            <LevelUpOverlay key="levelup" level={levelUp}
              accentColor={selectedLang ? LANG_META[selectedLang]?.accent : undefined} />
          )}
        </AnimatePresence>
        <div>
          {screen === "onboard" && (
            <Onboarding key="onboard" onDone={() => { setStorage("lf_seen_onboard", true); setScreen("dashboard"); }} />
          )}
          {screen === "dashboard" && (
            <Dashboard key="dashboard" xp={xp} streak={streak} favorites={favorites} stats={stats}
              lastStudied={lastStudied}
              onSelectLang={handleSelectLangDirect}
              onOpenFavorites={() => setScreen("favorites")}
              onOpenStats={() => setScreen("stats")} />
          )}
          {screen === "stats" && (
            <StatsScreen key="stats" stats={stats} xp={xp} streak={streak}
              onBack={() => setScreen("dashboard")}
              onStudyDeck={handleStudyFromStats} />
          )}
          {screen === "favorites" && (
            <FavoritesScreen key="favorites" favorites={favorites}
              onStudyFavs={(code, deck) => goStudy(
                code === "__all__" ? Object.keys(favorites)[0]?.split(":")[0] || "es" : code,
                deck, true
              )}
              onBack={() => setScreen("dashboard")}
              onClearAll={() => { setFavorites({}); setStorage("lf_favorites", {}); }} />
          )}
          {screen === "decks" && (
            <DeckSelector key="decks" langCode={selectedLang} streak={streak}
              completedDecks={stats.completedDecks || {}}
              onSelectDeck={key => handleSelectDeck(selectedLang, key)}
              onBack={() => setScreen("dashboard")} />
          )}
          {screen === "mastered" && (
            <MasteredScreen key="mastered"
              deckLabel={getDeckLabel(selectedDeck, selectedLang)}
              lang={LANG_META[selectedLang]}
              onReview={() => goStudy(selectedLang, selectedDeck, false, true)}
              onBack={() => setScreen("decks")} />
          )}
          {screen === "study" && (
            <StudyScreen key={`study-${selectedLang}-${selectedDeck}-${studySessionId}`}
              langCode={selectedLang} deckKey={selectedDeck}
              favorites={favorites} onToggleFav={handleToggleFav}
              isReview={isReview} streak={streak}
              onFinish={res => { updateStats(res.correct, res.total, res.deckKey, res.langCode); setResult(res); setScreen("result"); }}
              onXP={addXP} onBack={backFromStudy} />
          )}
          {screen === "result" && result && (
            <ResultScreen key="result" result={result}
              langCode={selectedLang} deckKey={selectedDeck}
              fromFavorites={fromFavorites} streak={streak}
              onRestart={() => { setIsReview(true); setStudySessionId(id => id + 1); setScreen("study"); }}
              onHome={homeFromResult}
              onNextDeck={nextKey => goStudy(selectedLang, nextKey, false)}
              onNextLang={(nextLang, firstDeck) => goStudy(nextLang, firstDeck, false, false)} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}