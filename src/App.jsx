import { useState, useCallback, useMemo, useRef, useEffect, useReducer, Component } from "react";
import { motion, AnimatePresence, useAnimation, useMotionValue } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw, BarChart2,
  Home, ChevronLeft, Target, ArrowRight, Bookmark, BookMarked, Sparkles,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette, Users, Heart,
  Smile, Globe, Volume2, VolumeX, Search, Award, HelpCircle, RefreshCw,
  BookMarked as BookMarkedIcon, Star, Lock
} from "lucide-react";
import { LANG_META, DECKS, DECK_KEYS, VOCAB, getDeckLabel, getLangDeckKeys } from "./data.js";
import { getStorage, setStorage } from "./lib/storage.js";
import { shuffle } from "./lib/utils.js";
import { XP_PER_LEVEL, LANG_UNLOCK_LEVEL, getLevel, getXPInLevel, getMolejoMultiplier, getMultiplierLabel } from "./lib/xp.js";
import { R, C, glass } from "./lib/tokens.js";
import { getSrsData, updateSrs, sortBySrs, SRS_INTERVALS } from "./lib/srs.js";
import { BadgeIllustrations, BADGES } from "./lib/badges.jsx";


class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", gap: 16, background: "rgba(250,249,246,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
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
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md pb-10 px-6 pt-7"
        style={{ background: "rgba(250,249,246,0.96)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", borderRadius: `${R.xl}px ${R.xl}px 0 0`, borderTop: "1px solid rgba(255,255,255,0.7)" }}>
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-black" style={{ fontSize: "1.75rem", color: C.ink }}>Como funciona</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ ...glass.card }}>
            <X size={18} style={{ color: C.ink }} />
          </button>
        </div>
        <div className="space-y-5">
          {items.map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{ ...glass.card, borderRadius: R.card }}>
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

// ─── XP HERO BLOCK ────────────────────────────────────────────────────────────
function XPHeroBlock({ level, xpInLevel, streak }) {
  const [show, setShow] = useState(false);
  return (
    <motion.div onClick={() => setShow(s => !s)} whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden p-7 cursor-pointer select-none"
      style={{ ...glass.dark, borderRadius: R.xl }}>
      <div className="absolute -right-8 -top-8 rounded-full pointer-events-none"
        style={{ width: 160, height: 160, background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
      <AnimatePresence mode="wait">
        {!show ? (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
            <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Nível atual</div>
            <div className="font-black leading-none mb-1" style={{ fontSize: "5rem", color: "#FAF9F6" }}>
              <motion.span
                whileTap={{ scaleX: 1.3, scaleY: 0.7 }}
                transition={{ type: "spring", stiffness: 600, damping: 14 }}
                style={{ display: "inline-block", cursor: "pointer", transformOrigin: "center bottom" }}>
                {level}
              </motion.span>
            </div>
            <div className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
              {xpInLevel}/100 XP → nível {level + 1}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.95))" }}
                initial={{ width: 0 }} animate={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }} />
            </div>
            {getMolejoMultiplier(streak) > 1 && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#EF9F27", boxShadow: "0 4px 12px rgba(239,159,39,0.4)" }}>
                <Flame size={12} className="text-white" />
                <span className="text-xs font-black text-white">{getMultiplierLabel(getMolejoMultiplier(streak))} XP ativo</span>
              </div>
            )}
            <div className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>Toque para histórico →</div>
          </motion.div>
        ) : (
          <motion.div key="breakdown" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-xs font-black tracking-widest uppercase mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>Histórico de XP</div>
            <div className="space-y-3">
              {[
                { label: "XP total acumulado",              value: `${(level - 1) * XP_PER_LEVEL + xpInLevel}`, color: "rgba(255,255,255,0.9)"  },
                { label: `Faltam para nível ${level + 1}`,  value: `${XP_PER_LEVEL - xpInLevel} XP`,             color: "rgba(255,255,255,0.55)" },
                { label: "Multiplicador ativo",             value: `×${getMolejoMultiplier(streak)}`,             color: getMolejoMultiplier(streak) > 1 ? "#EF9F27" : "rgba(255,255,255,0.25)" },
                { label: "Níveis completados",              value: `${level - 1}`,                                color: "rgba(255,255,255,0.55)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                  <span className="text-sm font-black" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>← Toque para voltar</div>
          </motion.div>
        )}
      </AnimatePresence>
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

        {/* Level hero — interactive dark glass card */}
        <XPHeroBlock level={level} xpInLevel={xpInLevel} streak={streak} />

        {/* Stats row */}
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

        {/* Badges — flat grid */}
        <div className="p-6" style={{ ...glass.card, borderRadius: R.xl }}>
          <div className="text-xs font-black tracking-widest uppercase mb-5" style={{ color: C.dim }}>Conquistas</div>
          {earnedBadges.length === 0 && (
            <p className="text-sm text-center py-3" style={{ color: C.dim }}>Complete sessões para ganhar conquistas</p>
          )}
          <div className="grid grid-cols-5 gap-x-2 gap-y-5">
            {earnedBadges.map(b => {
              const Illus = BadgeIllustrations[b.id];
              return (
                <motion.div key={b.id} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="badge-earned flex flex-col items-center gap-1.5 text-center">
                  {Illus ? <Illus dim={false} /> : <span style={{ fontSize: 26 }}>⭐</span>}
                  <span style={{ color: C.ink, fontSize: "0.6rem", fontWeight: 700, lineHeight: 1.2 }}>{b.label}</span>
                </motion.div>
              );
            })}
            {lockedBadges.map(b => {
              const Illus = BadgeIllustrations[b.id];
              return (
                <div key={b.id} className="badge-locked flex flex-col items-center gap-1.5 text-center" style={{ opacity: 0.25 }}>
                  {Illus ? <Illus dim={true} /> : <span style={{ fontSize: 26, filter: "grayscale(1)" }}>⭐</span>}
                  <span style={{ color: C.dim, fontSize: "0.6rem", fontWeight: 600, lineHeight: 1.2 }}>{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}


// ─── SKELETON LOADERS ─────────────────────────────────────────────────────────
function SkeletonLangTile() {
  return (
    <div className="w-full" style={{ ...glass.card, borderRadius: R.xl }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="sk shrink-0" style={{ width: 52, height: 52, borderRadius: "50%" }} />
        <div className="flex-1 space-y-2">
          <div className="sk" style={{ height: 20, width: "45%", borderRadius: 6 }} />
          <div className="sk" style={{ height: 13, width: "70%", borderRadius: 5 }} />
        </div>
        <div className="sk shrink-0" style={{ width: 18, height: 18, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SkeletonDeckTile() {
  return (
    <div className="w-full" style={{ background: "rgba(255,255,255,0.18)", borderRadius: R.xl }}>
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="sk shrink-0" style={{ width: 26, height: 26, borderRadius: 6, opacity: 0.5 }} />
        <div className="flex-1 space-y-2">
          <div className="sk" style={{ height: 18, width: "50%", borderRadius: 6, opacity: 0.5 }} />
          <div className="sk" style={{ height: 12, width: "30%", borderRadius: 5, opacity: 0.4 }} />
        </div>
      </div>
    </div>
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
  const [ready, setReady]       = useState(false);
  const favCount = Object.keys(favorites).length;

  // Delay content render by 1 frame so skeleton shows first
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  const prevMolejo = useRef(streak);
  const [streakPop, setMolejoPop] = useState(false);
  useEffect(() => {
    if (streak !== prevMolejo.current) {
      setMolejoPop(true);
      setTimeout(() => setMolejoPop(false), 600);
      prevMolejo.current = streak;
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: C.cream }}>
      {/* ── Ambient liquid glass background ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ willChange: "transform", zIndex: 0 }}>
        {/* Blob 1 — 22s cycle, warm coral-rose */}
        <motion.div
          style={{ position: "absolute", top: "-5%", left: "-10%", width: "75vw", height: "75vw", maxWidth: 600, maxHeight: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,80,60,0.42) 0%, rgba(255,140,100,0.22) 50%, transparent 72%)", filter: "blur(70px)", willChange: "transform" }}

        />
        {/* Blob 2 — 28s cycle, soft lavender-blue */}
        <motion.div
          style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "65vw", height: "65vw", maxWidth: 520, maxHeight: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,120,230,0.36) 0%, rgba(140,160,255,0.18) 50%, transparent 72%)", filter: "blur(80px)", willChange: "transform" }}

        />
        {/* Blob 3 — 34s cycle, warm amber-gold */}
        <motion.div
          style={{ position: "absolute", top: "35%", left: "30%", width: "60vw", height: "60vw", maxWidth: 480, maxHeight: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(210,155,60,0.32) 0%, rgba(250,195,100,0.16) 50%, transparent 72%)", filter: "blur(85px)", willChange: "transform" }}

        />
        {/* Gyroscope overlay — reacts to phone tilt */}
        {/* Very light frosted veil */}
        <div className="absolute inset-0" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(250,249,246,0.12)" }} />
      </div>

      {/* Dashboard content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="relative min-h-screen" style={{ zIndex: 1 }}>
      {/* Floating help button — no bar, directly on background */}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setShowHelp(true)} className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ ...glass.card }}>
          <HelpCircle size={18} style={{ color: C.dim }} />
        </button>
      </div>
      <AnimatePresence>{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}</AnimatePresence>

      <div className="max-w-md mx-auto px-5 pt-16 pb-28">
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
              {getMolejoMultiplier(streak) > 1 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EF9F27", color: "#fff" }}>
                  {getMultiplierLabel(getMolejoMultiplier(streak))}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Continue card */}
        {lastStudied && LANG_META[lastStudied] && (() => {
          const lang = LANG_META[lastStudied];
          const firstIncomplete = getLangDeckKeys(lastStudied).find(k => !(stats.completedDecks?.[k]?.includes(lastStudied)));
          const doneCount = getLangDeckKeys(lastStudied).filter(k => stats.completedDecks?.[k]?.includes(lastStudied)).length;
          return firstIncomplete ? (
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onSelectLang(lastStudied, firstIncomplete)}
              className="w-full flex items-center justify-between px-6 py-5 mb-6 text-left"
              style={{ ...glass.accent(lang.accent), borderRadius: R.xl }}>
              <div className="flex items-center gap-4">
                <div style={{ borderRadius: "50%", padding: 3, background: "rgba(255,255,255,0.35)", flexShrink: 0, boxShadow: "0 0 0 1.5px rgba(255,255,255,0.5)" }}>
                  <FlagIcon langCode={lastStudied} size={44} />
                </div>
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

        {/* New user CTA — only when no lastStudied */}
        {!lastStudied && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mb-6 p-5" style={{ ...glass.card, borderRadius: R.xl }}>
            <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: C.dim }}>Comece aqui</div>
            <p className="text-sm mb-4" style={{ color: C.dim }}>Aprenda as primeiras palavras em Espanhol — o idioma mais próximo do Português.</p>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onSelectLang("es", "cumprimentos")}
              className="w-full flex items-center justify-between px-5 py-3.5 font-black"
              style={{ backgroundColor: LANG_META.es.accent, color: "#fff", borderRadius: R.xl }}>
              <span>Cumprimentos em Espanhol</span>
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Language list */}
        <div className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: C.dim }}>Idiomas</div>
        <div className="space-y-3 mb-6">
          {!ready
            ? Object.keys(LANG_META).map(k => <SkeletonLangTile key={k} />)
            : Object.entries(LANG_META).map(([code, lang], i) => {
            const doneCount = getLangDeckKeys(code).filter(k => stats.completedDecks?.[k]?.includes(code)).length;
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
                        : `${getLangDeckKeys(code).length} categorias · ${Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras`
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
    </div>
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
            <div className="w-20 h-20 flex items-center justify-center" style={{ ...glass.card, borderRadius: R.xl }}>
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
                style={{ ...glass.card, borderRadius: R.xl }}>
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
function DeckSelector({ langCode, onSelectDeck, onSelectWrite, onBack, streak, completedDecks }) {
  const lang      = LANG_META[langCode];
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);
  const filtered  = getLangDeckKeys(langCode).filter(k => getDeckLabel(k, langCode).toLowerCase().includes(query.toLowerCase()));
  const doneCount = getLangDeckKeys(langCode).filter(k => completedDecks[k]?.includes(langCode)).length;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen relative" style={{ backgroundColor: lang.accent }}>
      {/* Dark mode darkening overlay */}
      <div className="lf-deck-overlay absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
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
      <div className="lf-deck-content max-w-md mx-auto px-5 pt-2 pb-8">
        <h1 className="font-black text-white leading-none mb-1"
          style={{ fontSize: "3.5rem", letterSpacing: "-0.02em" }}>{lang.name}</h1>
        <p className="text-sm font-medium mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
          {doneCount}/{getLangDeckKeys(langCode).length} concluídas
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
          {!ready
            ? DECK_KEYS.map(k => <SkeletonDeckTile key={k} />)
            : filtered.map((key, i) => {
            const deck = DECKS[key];
            const Icon = deck.icon;
            const done = completedDecks[key]?.includes(langCode);
            return (
              <motion.div key={key}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 }}
                style={done
                  ? { ...glass.card, borderRadius: R.xl }
                  : { background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: R.xl }}>
                {/* Flashcard row */}
                <button onClick={() => onSelectDeck(key)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
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
                </button>
                {/* Write mode — secondary tap target */}
                <button onClick={() => onSelectWrite(key)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 font-bold text-xs"
                  style={{ borderTop: `1px solid ${done ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)"}`, color: done ? lang.accent : "rgba(255,255,255,0.6)" }}>
                  ✍ Praticar escrita
                </button>
              </motion.div>
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
function FlashCard({ card, isFlipped, onClick, lang, langCode, isFav, onToggleFav, showLangBadge }) {
  const [ttsPlaying,     setTtsPlaying]     = useState(false);
  const [ttsUnsupported, setTtsUnsupported] = useState(false);
  const [favPulse,       setFavPulse]       = useState(false);

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
    if (willSave) { setFavPulse(true); setTimeout(() => setFavPulse(false), 600); }
  };

  const ptLen  = (card.pt     || "").length;
  const tgtLen = (card.target || "").length;
  const frontSz = ptLen  <= 8  ? "3rem"    : ptLen  <= 20 ? "2.25rem" : "1.5rem";
  const backSz  = tgtLen <= 12 ? "2.75rem" : tgtLen <= 24 ? "2rem"    : "1.4rem";

  return (
    <div className="w-full" style={{ perspective: 1400, height: 280 }}>
      {/* Single motion.div handles ONLY the flip — no x/entrance here */}
      <motion.div
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isFlipped ? [1, 1.03, 1] : 1,
        }}
        transition={{
          rotateY: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
          scale:   { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        }}
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", height: "100%" }}
        onClick={onClick}>

        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col justify-between p-7"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            ...glass.card, borderRadius: R.xl }}>
          {showLangBadge
            ? <span className="self-start text-xs font-black px-3 py-1.5 shrink-0"
                style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.pill, boxShadow: `0 4px 12px ${lang.accent}55` }}>{lang.name}</span>
            : <div className="shrink-0" />}
          <div className="min-w-0 overflow-hidden">
            <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: C.dim }}>Português</p>
            <p className="font-black leading-none break-words"
              style={{ fontSize: frontSz, color: C.ink, letterSpacing: "-0.02em", wordBreak: "break-word", overflowWrap: "break-word", hyphens: "auto" }}>{card.pt}</p>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-medium shrink-0" style={{ color: "#C0BBB4" }}>
            <RotateCcw size={11} /> toque para revelar
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex flex-col justify-between p-7"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)", ...glass.accent(lang.accent), borderRadius: R.xl }}>
          <div className="flex items-center justify-between">
            <button onClick={handleTTS} className="p-1 -ml-1">
              {ttsPlaying
                ? <VolumeX size={20} style={{ color: "rgba(255,255,255,0.75)" }} />
                : <Volume2  size={20} style={{ color: ttsUnsupported ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)" }} />}
            </button>
            <div className="relative" style={{ overflow: "visible" }}>
              <motion.button onClick={handleFav} className="p-1 -mr-1 relative" style={{ overflow: "visible" }}>
                <div className="absolute pointer-events-none" style={{ right: 0, bottom: 28, height: 20, overflow: "hidden" }}>
                  <AnimatePresence>
                    {favPulse && (
                      <motion.span key="salvo"
                        initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className="block text-xs font-black text-white whitespace-nowrap"
                        style={{ textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}>
                        Salvo!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div
                  animate={favPulse ? { scale: [1, 1.5, 0.88, 1], y: [0, -6, 0] } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 480, damping: 14 }}>
                  {isFav
                    ? <BookMarked size={20} style={{ color: "#fff" }} />
                    : <Bookmark  size={20} style={{ color: "rgba(255,255,255,0.45)" }} />}
                </motion.div>
              </motion.button>
            </div>
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

// ─── WRITE SCREEN (Production mode) ──────────────────────────────────────────
function normalize(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function WriteScreen({ langCode, deckKey, onFinish, onBack, onXP, streak = 0 }) {
  const lang        = LANG_META[langCode] ?? { accent: C.ink, name: langCode };
  const deckLabel   = getDeckLabel(deckKey, langCode);
  const accentColor = lang.accent;

  const cards = useMemo(() => {
    if (!VOCAB[langCode]?.[deckKey]) return [];
    return shuffle([...VOCAB[langCode][deckKey]]);
  }, []); // eslint-disable-line

  const [idx,       setIdx]       = useState(0);
  const [input,     setInput]     = useState("");
  const [status,    setStatus]    = useState(null);
  const [correct,   setCorrect]   = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showAns,   setShowAns]   = useState(false);
  const inputRef = useRef(null);

  const card = cards[idx];
  const progress = cards.length ? idx / cards.length : 0;

  useEffect(() => {
    if (status === null && inputRef.current) inputRef.current.focus();
  }, [idx, status]);

  const handleSubmit = () => {
    if (!card || status !== null) return;
    const userAns   = normalize(input);
    const targetAns = normalize(card.target);
    const isOk = userAns === targetAns ||
      (userAns.length > 2 && targetAns.split(/[\s\/,]+/).some(w => normalize(w) === userAns));
    setStatus(isOk ? "correct" : "wrong");
    setShowAns(!isOk);
    if (isOk) setCorrect(n => n + 1); else setIncorrect(n => n + 1);
  };

  const next = () => {
    const newCorrect = correct + (status === "correct" ? 1 : 0);
    if (idx + 1 >= cards.length) {
      const total    = cards.length;
      const xpGained = Math.round(Math.max(10, total * 1.5) * (newCorrect / total));
      const accuracy = Math.round(newCorrect / total * 100);
      onXP(xpGained, accuracy);
      onFinish({ correct: newCorrect, total, xpGained, deckKey, langCode, accuracy, wrongCards: [] });
      return;
    }
    setIdx(i => i + 1); setInput(""); setStatus(null); setShowAns(false);
  };

  if (!card) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${accentColor}14 0%, transparent 28%)`, pointerEvents: "none", zIndex: 0 }} />
      <NavBar title={deckLabel}
        left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><X size={18} /> Sair</button>}
        right={<span className="text-sm font-bold" style={{ color: C.dim }}>{cards.length - idx}</span>}
      />
      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-4 pb-8 flex flex-col" style={{ zIndex: 1 }}>
        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0DDD9" }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: accentColor }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-bold" style={{ color: C.dim }}>{correct} corretas</span>
            <span className="text-xs font-black" style={{ color: accentColor }}>{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* PT word card */}
        <div className="p-7 mb-4" style={{ ...glass.card, borderRadius: R.xl, minHeight: 160 }}>
          <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: C.dim }}>Escreva em {lang.name}</p>
          <p className="font-black leading-tight" style={{ fontSize: "2.5rem", color: C.ink, letterSpacing: "-0.02em" }}>{card.pt}</p>
          {showAns && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-3" style={{ backgroundColor: accentColor + "22", borderRadius: R.card }}>
              <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: accentColor }}>Resposta correta</p>
              <p className="font-black" style={{ fontSize: "1.5rem", color: accentColor }}>{card.target}</p>
              {card.phonetic && <p className="text-sm mt-1" style={{ color: C.dim }}>{card.phonetic}</p>}
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { status === null ? handleSubmit() : next(); } }}
            placeholder={`Digite em ${lang.name}...`}
            disabled={status !== null}
            className="w-full px-5 py-4 font-bold text-lg outline-none"
            style={{ ...glass.card, borderRadius: R.xl, color: status === "correct" ? "#16A34A" : status === "wrong" ? "#DC2626" : C.ink, border: status === "correct" ? "2px solid #16A34A" : status === "wrong" ? "2px solid #DC2626" : "1px solid rgba(255,255,255,0.7)" }}
          />
          {status !== null && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {status === "correct" ? <Check size={22} style={{ color: "#16A34A" }} /> : <X size={22} style={{ color: "#DC2626" }} />}
            </div>
          )}
        </div>

        {/* Tip after answer */}
        <AnimatePresence>
          {status !== null && (card.example || card.tip) && (
            <motion.div key="tip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="px-5 py-4 mb-4 space-y-1.5" style={{ ...glass.card, borderRadius: R.xl }}>
              {card.example && <p className="text-xs font-semibold" style={{ color: C.ink }}><span style={{ color: C.dim }}>ex. </span>{card.example}</p>}
              {card.tip && <p className="text-xs" style={{ color: C.dim }}>{card.tip}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto">
          {status === null
            ? <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="w-full py-4 font-black text-lg"
                style={{ backgroundColor: accentColor, color: "#fff", borderRadius: R.xl }}>
                Verificar
              </motion.button>
            : <motion.button whileTap={{ scale: 0.97 }} onClick={next}
                className="w-full py-4 font-black text-lg"
                style={{ backgroundColor: C.ink, color: C.cream, borderRadius: R.xl }}>
                {idx + 1 >= cards.length ? "Ver resultado" : "Próxima →"}
              </motion.button>
          }
        </div>

        {/* Stats footer */}
        <div className="flex justify-center gap-10 mt-5 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {[{ label: "Corretas", val: correct, color: "#16A34A" }, { label: "Erros", val: incorrect, color: "#DC2626" }, { label: "Total", val: cards.length, color: C.dim }].map(s => (
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
            style={{ ...glass.card, color: C.ink, borderRadius: R.xl, fontSize: "1.1rem" }}>
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

  // SRS: load per-card difficulty from storage
  const srsKey = `lf_srs_${langCode}_${deckKey}`;
  const srsData = useMemo(() => getStorage(srsKey, {}), []); // eslint-disable-line

  const originalCards = useMemo(() => {
    if (isFavAll)
      return shuffle(Object.entries(LANG_META).flatMap(([code]) =>
        Object.values(VOCAB[code]).flat()
          .filter(c => favorites[`${code}:${c.pt}`])
          .map(c => ({ ...c, _lang: code }))
      ));
    if (isFavDeck)
      return shuffle(Object.values(VOCAB[langCode]).flat().filter(c => favorites[`${langCode}:${c.pt}`]));
    // SRS: sort by difficulty — hard cards (score < 0.5) first, easy last
    const cards = VOCAB[langCode][deckKey] ? [...VOCAB[langCode][deckKey]] : [];
    cards.sort((a, b) => {
      const sa = srsData[a.pt]?.score ?? 0.5;
      const sb = srsData[b.pt]?.score ?? 0.5;
      return sa - sb; // hardest first
    });
    return cards;
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
  const [wrongCards,     setWrongCards]     = useState([]);

  const controls = useAnimation();
  const [dragOffset, setDragOffset] = useState(0);
  const bleedLeftOpacity  = Math.max(0, Math.min(0.2, -dragOffset / 600));
  const bleedRightOpacity = Math.max(0, Math.min(0.2,  dragOffset / 600));

  const total    = originalCards.length;
  const progress = total > 0 ? Math.min(correct / total, 1) : 0;
  const card     = queue[currentIdx];
  const cardLang     = isFavAll ? (card?._lang || langCode) : langCode;
  const cardLangMeta = isFavAll ? (LANG_META[card?._lang] || neutralLang) : lang;
  const accentColor  = cardLangMeta.accent;

  const handleFlip = () => {
    if (!isFlipped) setIsFlipped(true);
  };

  const resetCard = () => {
    setIsFlipped(false);
    setAnswered(false);
    setButtonsVisible(false);
    setDragOffset(0);
  };

  // After flip completes (500ms) reveal buttons
  useEffect(() => {
    if (!isFlipped) return;
    const t = setTimeout(() => { if (mounted.current) setButtonsVisible(true); }, 520);
    return () => clearTimeout(t);
  }, [isFlipped]);

  const handleAnswer = async (knew) => {
    if (!isFlipped || answered) return;
    setAnswered(true);
    const isAlmost = knew === "almost";
    const isCorrect = knew === true;
    knew = isCorrect; // normalize: "almost" behaves like wrong (recycles)
    // Hide buttons and tip immediately — clean slate before card exits
    setButtonsVisible(false);
    setFlashColor(knew ? "green" : "red");
    if (knew) {
      await controls.start({ opacity: 0, scale: 0.9, transition: { duration: 0.22, ease: "easeIn" } });
    } else {
      await controls.start({ x: [-6, 6, -5, 5, 0], transition: { duration: 0.32 } });
      await controls.start({ opacity: 0, scale: 0.9, x: -30, transition: { duration: 0.2, ease: "easeIn" } });
    }
    if (!mounted.current) return;
    setFlashColor(null);
    controls.set({ opacity: 1, scale: 1, x: 0 });
    setDragOffset(0);
    if (knew) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      const newQueue = queue.filter((_, i) => i !== currentIdx);
      if (newQueue.length === 0) {
        const totalAns = newCorrect + incorrect;
        // XP scales with deck size and accuracy, minimum 10
        const baseXP = Math.max(10, Math.round(total * 1.5));
        const xpGained = Math.round(baseXP * (newCorrect / totalAns));
        const accuracy = Math.round(newCorrect / totalAns * 100);
        onXP(xpGained, accuracy);
        setShowConfetti(true);
        setTimeout(() => { if (mounted.current) onFinish({ correct: newCorrect, total: totalAns, xpGained, deckKey, langCode, accuracy, wrongCards }); }, 800);
        return;
      }
      if (!isFavDeck) updateSrs(srsData, langCode, deckKey, card.pt, 'correct');
      setQueue(newQueue);
      setCurrentIdx(Math.min(currentIdx, newQueue.length - 1));
    } else {
      setIncorrect(inc => inc + 1);
      setWrongCards(prev => prev.find(w => w.pt === card.pt) ? prev : [...prev, { ...card, _lang: cardLang }]);
      if (!isFavDeck) updateSrs(srsData, langCode, deckKey, card.pt, isAlmost ? 'almost' : 'wrong');
      const nq = [...queue];
      const [rem] = nq.splice(currentIdx, 1);
      nq.splice(Math.min(currentIdx + 2, nq.length), 0, rem);
      setQueue(nq);
      setCurrentIdx(Math.min(currentIdx, nq.length - 1));
    }
    // Reset after queue update — isFlipped goes false AFTER new card key is set
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
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: C.cream, position: 'relative' }}>
      {/* Adaptive accent tint — top gradient from lang color */}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${accentColor}14 0%, transparent 28%)`, pointerEvents: 'none', zIndex: 0 }} />
      <Confetti active={showConfetti} accentColor={accentColor} />
      <NavBar
        title={deckLabel} subtitle={isReview ? "Revisão" : undefined}
        left={<button onClick={onBack} className="flex items-center gap-1.5 text-sm font-black" style={{ color: C.dim }}><X size={18} /> Sair</button>}
        right={
          <div className="flex items-center gap-2">
            {getMolejoMultiplier(streak) > 1 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#EF9F27", color: "#fff" }}>
                {getMultiplierLabel(getMolejoMultiplier(streak))}
              </span>
            )}
            <span className="text-sm font-bold" style={{ color: C.dim }}>{queue.length}</span>
          </div>
        }
      />

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-4 pb-8 flex flex-col">
        {/* Progress bar + animated % + 100% success burst */}
        <div className="mb-5 relative">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0DDD9" }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: accentColor }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-bold" style={{ color: C.dim }}>{correct} acertadas</span>
            <div className="relative">
              <AnimatedProgressPct value={Math.round(progress * 100)} color={accentColor} />
              {/* 100% success burst — confetti-style scale pop */}
              <AnimatePresence>
                {Math.round(progress * 100) === 100 && (
                  <motion.div key="burst" className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: accentColor + "60" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 justify-center">
          {/* Card — key drives entrance animation, controls drives exit */}
          <div className="relative" style={{ height: 280 }}>
            <AnimatePresence>
              {flashColor && (
                <motion.div className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: flashBg, borderRadius: R.xl }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            {isFlipped && !answered && dragOffset !== 0 && (
              <>
                <div className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backgroundColor: "rgba(220,38,38,1)", opacity: bleedLeftOpacity, borderRadius: R.xl }} />
                <div className="absolute inset-0 z-20 pointer-events-none"
                  style={{ backgroundColor: accentColor, opacity: bleedRightOpacity, borderRadius: R.xl }} />
              </>
            )}
            {/* Single keyed wrapper — handles entrance, drag, and exit cleanly */}
            <motion.div
              key={`${cardLang}-${card.pt}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ opacity: { duration: 0.14 }, x: { type: "spring", stiffness: 400, damping: 34, restDelta: 0.001 } }}
              style={{ height: "100%", willChange: "transform" }}>
              <motion.div
                animate={controls}
                style={{ height: "100%" }}
                drag={isFlipped && !answered ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDrag={(_, info) => setDragOffset(info.offset.x)}
                onDragEnd={handleDragEnd}
                whileDrag={{ cursor: "grabbing" }}>
                <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip}
                  lang={cardLangMeta} langCode={cardLang} isFav={isFav}
                  onToggleFav={c => onToggleFav(cardLang, c)}
                  showLangBadge={isFavAll} />
              </motion.div>
            </motion.div>
          </div>

          {/* Tip — stable container height, content fades in/out */}
          <div style={{ minHeight: 72 }}>
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.p key="hint"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center text-xs font-medium pt-6" style={{ color: "#C0BBB4" }}>
                  Toque no card para ver a tradução
                </motion.p>
              ) : (card.example || card.tip) ? (
                <motion.div key="tip"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  className="px-5 py-4 space-y-2" style={{ ...glass.card, borderRadius: R.xl }}>
                  {card.example && (
                    <p className="text-xs font-semibold leading-snug" style={{ color: C.ink }}>
                      <span className="font-normal mr-1" style={{ color: C.dim }}>ex.</span>{card.example}
                    </p>
                  )}
                  {card.tip && <p className="text-xs leading-snug" style={{ color: C.dim }}>{card.tip}</p>}
                </motion.div>
              ) : (
                <motion.div key="empty" style={{ height: 72 }} />
              )}
            </AnimatePresence>
          </div>

          {/* Buttons — slide up after flip, stable space reserved */}
          <div style={{ height: 60 }}>
            <AnimatePresence>
              {buttonsVisible && (
                <motion.div key="btns" className="flex gap-3"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center gap-1.5 py-4 font-black whitespace-nowrap"
                    style={{ flex:"1.2", background: "rgba(255,255,255,0.78)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1.5px solid rgba(220,38,38,0.3)", borderRadius: R.xl, color: "#DC2626", fontSize: "0.85rem", boxShadow: "0 4px 20px rgba(220,38,38,0.1)" }}>
                    <X size={15} strokeWidth={2.5} className="shrink-0" /> Não sei
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAnswer("almost")}
                    className="flex items-center justify-center gap-1.5 py-4 font-black whitespace-nowrap"
                    style={{ flex:"1", background: "rgba(255,255,255,0.78)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1.5px solid rgba(245,158,11,0.35)", borderRadius: R.xl, color: "#D97706", fontSize: "0.85rem" }}>
                    <RotateCcw size={14} strokeWidth={2.5} className="shrink-0" /> Quase
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center gap-1.5 py-4 font-black whitespace-nowrap"
                    style={{ flex:"1.2", background: "#111111", backdropFilter: "blur(24px) saturate(160%)", WebkitBackdropFilter: "blur(24px) saturate(160%)", border: "1.5px solid rgba(255,255,255,0.14)", borderRadius: R.xl, color: "#FAF9F6", fontSize: "0.85rem" }}>
                    <Check size={15} strokeWidth={2.5} className="shrink-0" /> Sei!
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats footer — glass pill */}
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-around px-2 py-3"
            style={{ ...glass.card, borderRadius: R.xl }}>
            {[
              { label: "Acertos",  val: correct,   color: "#16A34A" },
              { label: "Erros",    val: incorrect,  color: "#DC2626" },
              { label: "Total",    val: total,      color: C.dim     },
            ].map((s, i) => (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5">
                {i > 0 && <div className="absolute" />}
                <div className="font-black" style={{ fontSize: "1.4rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div className="text-xs font-bold tracking-widest uppercase" style={{ color: C.dim, opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
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

function ResultScreen({ result, langCode, deckKey, onRestart, onHome, onNextDeck, onNextLang, onReviewErrors, fromFavorites, streak = 0 }) {
  const lang         = LANG_META[langCode] ?? { accent: C.ink };
  const accuracy     = Math.round((result.correct / result.total) * 100);
  const langDeckKeys = getLangDeckKeys(langCode);
  const nextDeckKey  = langDeckKeys[langDeckKeys.indexOf(deckKey) + 1] ?? null;
  const nextDeck     = (!fromFavorites && nextDeckKey) ? DECKS[nextDeckKey] : null;
  const langKeys     = Object.keys(LANG_META);
  const nextLangCode = (!fromFavorites && !nextDeck) ? (langKeys[langKeys.indexOf(langCode) + 1] ?? null) : null;
  const nextLang     = nextLangCode ? LANG_META[nextLangCode] : null;
  const deckName     = getDeckLabel(deckKey, langCode) || "categoria";
  const tier         = accuracy === 100 ? "perfect" : accuracy >= 80 ? "great" : accuracy >= 60 ? "good" : "keep";
  const pool         = RESULT_COPY[tier];
  const pick         = pool[Math.floor(Math.random() * pool.length)];
  const mult         = getMolejoMultiplier(streak);

  // Animated accuracy count-up
  const [displayAcc, setDisplayAcc] = useState(0);
  useEffect(() => {
    const start = performance.now(), dur = 900;
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayAcc(Math.round(accuracy * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [accuracy]); // eslint-disable-line

  // Memoize static text so it never re-renders during count-up
  const heroText = useMemo(() => ({
    text: pick.text,
    sub: pick.sub,
    score: `${result.correct}/${result.total} em ${deckName}.`,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: C.cream }}>
      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-14 pb-14 flex flex-col">

        {/* Score hero */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: C.dim }}>Resultado</div>
          {/* Number animates independently — text below never re-renders */}
          <div className="font-black leading-none" style={{ fontSize: "6rem", color: C.ink, letterSpacing: "-0.03em" }}>
            {displayAcc}<span style={{ fontSize: "2.5rem", color: C.dim }}>%</span>
          </div>
          <p className="font-bold mt-3" style={{ color: C.dim, fontSize: "1rem", lineHeight: 1.6 }}>{heroText.text}</p>
          <p className="mt-1" style={{ color: C.dim, fontSize: "0.9rem" }}>
            {heroText.sub}{" "}<strong style={{ color: C.ink }}>{heroText.score}</strong>
          </p>
        </motion.div>

        {/* Stat cards — glass */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Precisão", value: `${accuracy}%`                      },
            { label: "XP Ganho", value: `+${result.xpGained}`,
              sub: mult > 1 ? getMultiplierLabel(mult) : null                },
            { label: "Acertos",  value: `${result.correct}/${result.total}` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="relative p-5 flex flex-col items-center"
              style={{ ...glass.accent(lang.accent), borderRadius: R.xl }}>
              {s.sub && (
                <span className="absolute top-2 right-2 text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EF9F27", color: "#fff", fontSize: 9 }}>{s.sub}</span>
              )}
              <div className="font-black text-white" style={{ fontSize: "1.6rem" }}>{s.value}</div>
              <div className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Error review — missed words with study CTA */}
        {result.wrongCards && result.wrongCards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="mb-6" style={{ ...glass.card, borderRadius: R.xl, overflow: "hidden" }}>
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black tracking-widest uppercase" style={{ color: C.dim }}>
                  {result.wrongCards.length} erro{result.wrongCards.length > 1 ? "s" : ""}
                </div>
              </div>
              <div className="space-y-2.5">
                {result.wrongCards.map((w, i) => {
                  const wLang = LANG_META[w._lang || result.langCode] ?? lang;
                  return (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold" style={{ color: C.ink }}>{w.pt}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: wLang.accent }}>{w.target}</span>
                        {w.phonetic && <span className="text-xs" style={{ color: C.dim }}>{w.phonetic}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={onReviewErrors}
              className="w-full flex items-center justify-between px-5 py-3.5 font-black"
              style={{ backgroundColor: lang.accent, color: "#fff", fontSize: "0.9rem" }}>
              <span>Estudar os erros agora</span>
              <RotateCcw size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* CTAs — glass */}
        <div className="flex flex-col gap-3 mt-auto">
          {nextDeck && (
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextDeck(nextDeckKey)}
              className="w-full flex items-center justify-between px-7 py-5 font-black"
              style={{ ...glass.accent(lang.accent), borderRadius: R.xl, color: "#fff", fontSize: "1.1rem" }}>
              <span>Próxima: {getDeckLabel(nextDeckKey, langCode)}</span>
              <ArrowRight size={22} />
            </motion.button>
          )}
          {nextLang && (
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextLang(nextLangCode, DECK_KEYS[0])}
              className="w-full flex items-center justify-between px-7 py-5 font-black"
              style={{ background: "rgba(17,17,17,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: R.xl, color: C.cream, fontSize: "1.1rem" }}>
              <span>Começar: {nextLang.name}</span>
              <ArrowRight size={22} />
            </motion.button>
          )}
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={onHome}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ ...glass.card, borderRadius: R.xl, color: C.ink }}>
              <Home size={18} /> {fromFavorites ? "Favoritas" : "Início"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => onRestart()}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-black"
              style={{ ...glass.card, borderRadius: R.xl, color: C.ink }}>
              <RotateCcw size={18} /> Repetir
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── BADGE TOAST ─────────────────────────────────────────────────────────────
function BadgeToast({ badge, onDone }) {
  const Illus = BadgeIllustrations[badge.id];
  return (
    <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 80 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="fixed z-50 flex items-center gap-3 px-5 py-4"
      style={{ ...glass.dark, borderRadius: R.xl, maxWidth: 320, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", bottom: 40, left: "50%", transform: "translateX(-50%)", width: "calc(100vw - 3rem)" }}>
      {Illus && <Illus dim={false} />}
      <div>
        <div className="text-xs font-black tracking-widest uppercase mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Conquista desbloqueada!</div>
        <div className="font-black text-white" style={{ fontSize: "1rem" }}>{badge.label}</div>
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
  // ── Navigation state as a single reducer — atomic, no race conditions ────────
  const [nav, dispatchNav] = useReducer((state, action) => {
    switch (action.type) {
      case "GO_ONBOARD":   return { ...state, screen: "onboard",   result: null };
      case "GO_DASHBOARD": return { ...state, screen: "dashboard", result: null };
      case "GO_STATS":     return { ...state, screen: "stats",     result: null };
      case "GO_FAVORITES": return { ...state, screen: "favorites", result: null };
      case "GO_DECKS":     return { ...state, screen: "decks",     lang: action.lang ?? state.lang };
      case "GO_MASTERED":  return { ...state, screen: "mastered" };
      case "GO_STUDY":     return {
        screen: "study",
        lang: action.lang,
        deck: action.deck,
        fromFavorites: action.fromFavorites ?? false,
        isReview: action.isReview ?? false,
        sessionId: state.sessionId + 1,
        result: null,
      };
      case "GO_RESULT":    return { ...state, screen: "result", result: action.result };
      default: return state;
    }
  }, {
    screen:       getStorage("lf_seen_onboard", false) ? "dashboard" : "onboard",
    lang:         null,
    deck:         null,
    result:       null,
    fromFavorites:false,
    isReview:     false,
    sessionId:    0,
  });

  const { screen, lang: selectedLang, deck: selectedDeck, result, fromFavorites, isReview, sessionId: studySessionId } = nav;
  const isWriteMode = screen === 'write';
  const [lastStudied,    setLastStudied]    = useState(() => getStorage("lf_last_studied", null));
  const [levelUp,        setLevelUp]        = useState(null);
  const [badgeUnlock,    setBadgeUnlock]    = useState(null);

  const [xp,        setXP]        = useState(() => getStorage("lf_xp", 0));
  const [favorites, setFavorites] = useState(() => getStorage("lf_favorites", {}));
  const [streak,    setMolejo]    = useState(() => {
    const today     = new Date().toDateString();
    const saved     = getStorage("lf_streak", { count: 0, lastDate: null, shieldUsed: false });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDaysAgo = new Date(Date.now() - 172800000).toDateString();
    // Grace period: if missed exactly 1 day and has shield (earned at streak≥7), restore streak
    if (saved.lastDate === today || saved.lastDate === yesterday) return saved.count;
    if (saved.lastDate === twoDaysAgo && saved.count >= 7 && !saved.shieldUsed) {
      setStorage("lf_streak", { ...saved, lastDate: yesterday, shieldUsed: true });
      return saved.count;
    }
    return 0;
  });
  const [stats, setStats] = useState(() => getStorage("lf_stats", {
    totalCorrect: 0, totalAttempts: 0, completedDecks: {}, studied: {}, perfectSessions: 0
  }));

  const bumpMolejo = useCallback(() => {
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    if (saved.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount  = saved.lastDate === yesterday ? saved.count + 1 : 1;
      setMolejo(newCount);
      setStorage("lf_streak", { count: newCount, lastDate: today });
    }
  }, []);

  const checkNewBadges = useCallback((newStats, newStreak) => {
    const prevBadges = getStorage("lf_badges", []);
    const earned = BADGES.filter(b => b.check(newStats, newStreak));
    const newOnes = earned.filter(b => !prevBadges.includes(b.id));
    if (newOnes.length > 0) {
      // Only ADD new badges — never remove existing ones
      const allNow = [...new Set([...prevBadges, ...newOnes.map(b => b.id)])];
      setStorage("lf_badges", allNow);
      setBadgeUnlock(newOnes[0]);
      setTimeout(() => setBadgeUnlock(null), 3000);
    }
  }, []);

  const addXP = useCallback((amount, accuracy) => {
    const multiplier = getMolejoMultiplier(streak);
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
    bumpMolejo();
    setStats(prev => {
      return prev; // badge check happens via updateStats after onFinish
    });
  }, [bumpMolejo, streak, checkNewBadges]);

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
      // Check badges with the NEW stats so completedDecks is up to date
      setTimeout(() => checkNewBadges(next, streak), 50);
      return next;
    });
  }, [streak, checkNewBadges]);

  const goStudy = useCallback((lang, deck, fromFavs = false, review = false) => {
    if (!fromFavs && lang) { setLastStudied(lang); setStorage("lf_last_studied", lang); }
    dispatchNav({ type: "GO_STUDY", lang, deck, fromFavorites: fromFavs, isReview: review });
  }, []);

  const handleSelectDeck = useCallback((langCode, deckKey) => {
    const isFav = deckKey.startsWith("__");
    const isDone = !isFav && stats.completedDecks?.[deckKey]?.includes(langCode);
    if (isDone) { dispatchNav({ type: "GO_MASTERED", lang: langCode, deck: deckKey }); }
    else goStudy(langCode, deckKey, false, false);
  }, [stats.completedDecks, goStudy]);

  const handleSelectLangDirect = useCallback((code, deckKey) => {
    const required = LANG_UNLOCK_LEVEL[code] || 1;
    if (getLevel(xp) < required) return;
    if (deckKey) handleSelectDeck(code, deckKey);
    else dispatchNav({ type: "GO_DECKS", lang: code });
  }, [handleSelectDeck, xp]);

  const handleStudyFromStats = useCallback((langCode, deckKey) => goStudy(langCode, deckKey, false, true), [goStudy]);

  const backFromStudy  = useCallback(() => dispatchNav({ type: fromFavorites ? "GO_FAVORITES" : "GO_DECKS" }), [fromFavorites]);
  const homeFromResult = useCallback(() => dispatchNav({ type: fromFavorites ? "GO_FAVORITES" : "GO_DASHBOARD" }), [fromFavorites]);

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
*{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
html,body{background:#FAF9F6;min-height:100vh}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.sk{border-radius:10px;background:linear-gradient(90deg,rgba(128,128,128,0.07) 25%,rgba(128,128,128,0.14) 50%,rgba(128,128,128,0.07) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite}
.lf-dark .lf-deck-overlay{background:rgba(0,0,0,0.38)}
.lf-dark .badge-locked{opacity:0.55!important;filter:brightness(2.2) grayscale(1)}
.lf-dark .badge-earned{filter:brightness(1.1)}
::placeholder{color:rgba(255,255,255,0.45)!important}`}</style>
        <AnimatePresence>
          {levelUp && (
            <LevelUpOverlay key="levelup" level={levelUp}
              accentColor={selectedLang ? LANG_META[selectedLang]?.accent : undefined} />
          )}
          {badgeUnlock && (
            <BadgeToast key={badgeUnlock.id} badge={badgeUnlock} onDone={() => setBadgeUnlock(null)} />
          )}
        </AnimatePresence>
        <div>
          {screen === "onboard" && (
                <Onboarding key="onboard" onDone={() => { setStorage("lf_seen_onboard", true); dispatchNav({ type: "GO_DASHBOARD" }); }} />
              )}
              {screen === "dashboard" && (
                <Dashboard key="dashboard" xp={xp} streak={streak} favorites={favorites} stats={stats}
                  lastStudied={lastStudied}
                  onSelectLang={handleSelectLangDirect}
                  onOpenFavorites={() => dispatchNav({ type: "GO_FAVORITES" })}
                  onOpenStats={() => dispatchNav({ type: "GO_STATS" })} />
              )}
              {screen === "stats" && (
                <StatsScreen key="stats" stats={stats} xp={xp} streak={streak}
                  onBack={() => dispatchNav({ type: "GO_DASHBOARD" })}
                  onStudyDeck={handleStudyFromStats} />
              )}
              {screen === "favorites" && (
                <FavoritesScreen key="favorites" favorites={favorites}
                  onStudyFavs={(code, deck) => goStudy(
                    code === "__all__" ? Object.keys(favorites)[0]?.split(":")[0] || "es" : code,
                    deck, true
                  )}
                  onBack={() => dispatchNav({ type: "GO_DASHBOARD" })}
                  onClearAll={() => { setFavorites({}); setStorage("lf_favorites", {}); }} />
              )}
              {screen === "decks" && (
                <DeckSelector key="decks" langCode={selectedLang} streak={streak}
                  completedDecks={stats.completedDecks || {}}
                  onSelectDeck={key => handleSelectDeck(selectedLang, key)}
                  onSelectWrite={key => dispatchNav({ type: "GO_WRITE", lang: selectedLang, deck: key })}
                  onBack={() => dispatchNav({ type: "GO_DASHBOARD" })} />
              )}
              {screen === "mastered" && (
                <MasteredScreen key="mastered"
                  deckLabel={getDeckLabel(selectedDeck, selectedLang)}
                  lang={LANG_META[selectedLang]}
                  onReview={() => goStudy(selectedLang, selectedDeck, false, true)}
                  onBack={() => dispatchNav({ type: "GO_DECKS" })} />
              )}
              {screen === "study" && (
                <StudyScreen key={`study-${selectedLang}-${selectedDeck}-${studySessionId}`}
                  langCode={selectedLang} deckKey={selectedDeck}
                  favorites={favorites} onToggleFav={handleToggleFav}
                  isReview={isReview} streak={streak}
                  onFinish={res => { updateStats(res.correct, res.total, res.deckKey, res.langCode); dispatchNav({ type: "GO_RESULT", result: res }); }}
                  onXP={addXP} onBack={backFromStudy} />
              )}
              {screen === "write" && (
                <WriteScreen key={`write-${selectedLang}-${selectedDeck}-${studySessionId}`}
                  langCode={selectedLang} deckKey={selectedDeck}
                  onFinish={res => { updateStats(res.correct, res.total, res.deckKey, res.langCode); dispatchNav({ type: "GO_RESULT", result: res }); }}
                  onXP={addXP} onBack={() => dispatchNav({ type: "GO_DECKS" })} />
              )}
              {screen === "result" && result && (
                <ResultScreen key="result" result={result}
                  langCode={selectedLang} deckKey={selectedDeck}
                  fromFavorites={fromFavorites} streak={streak}
                  onRestart={() => goStudy(selectedLang, selectedDeck, fromFavorites, true)}
                  onHome={homeFromResult}
                  onNextDeck={nextKey => goStudy(selectedLang, nextKey, false)}
                  onNextLang={(nextLang, firstDeck) => goStudy(nextLang, firstDeck, false, false)}
                  onReviewErrors={() => {
                    if (!result?.wrongCards?.length) return;
                    result.wrongCards.forEach(w => {
                      const lc = w._lang || selectedLang;
                      const key = `${lc}:${w.pt}`;
                      setFavorites(prev => { const next = { ...prev, [key]: true }; setStorage("lf_favorites", next); return next; });
                    });
                    goStudy(selectedLang, "__favorites__", true);
                  }} />
              )}
            </div>
          </div>
        </ErrorBoundary>
      );
    }
