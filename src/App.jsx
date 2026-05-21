import { useState, useCallback, useMemo, useRef, useEffect, Component } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw, BarChart2,
  Home, ChevronLeft, Target, ArrowRight, Bookmark, BookMarked, Sparkles,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette, Users, Heart,
  Smile, Globe, Volume2, VolumeX, Search, Award, HelpCircle, RefreshCw,
  BookMarked as BookMarkedIcon, Star
} from "lucide-react";
import { LANG_META, DECKS, DECK_KEYS, VOCAB, getDeckLabel } from "./data.js";

// ─── STORAGE ─────────────────────────────────────────────────────────────────
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

// ─── LEVEL SYSTEM ─────────────────────────────────────────────────────────────
const XP_PER_LEVEL = 100;
function getLevel(xp)    { return Math.floor(xp / XP_PER_LEVEL) + 1; }
function getXPInLevel(xp){ return xp % XP_PER_LEVEL; }

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const R = { card: 2, pill: 999 }; // border-radius tokens

// ─── TTS ─────────────────────────────────────────────────────────────────────
function speak(text, langCode) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const map = { es: "es-ES", it: "it-IT", ru: "ru-RU", fr: "fr-FR", de: "de-DE", en: "en-US" };
  u.lang = map[langCode] || "en-US";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <X size={40} strokeWidth={1.5} className="text-gray-300" />
        <p className="font-bold text-gray-800">Algo deu errado.</p>
        <p className="text-sm text-gray-500">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })}
          className="px-6 py-3 bg-gray-900 text-white font-bold text-sm"
          style={{ borderRadius: R.pill }}>
          Tentar novamente
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Particle({ color }) {
  const angle = Math.random() * 360, dist = 100 + Math.random() * 140;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 5 + Math.random() * 7;
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ width: size, height: size, backgroundColor: color, borderRadius: R.card, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: 360 }}
      transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }} />
  );
}
function Confetti({ active, accentColor }) {
  // Use language accent + white + a dark shade for confetti palette
  const colors = accentColor
    ? [accentColor, "#ffffff", "#111827", accentColor + "99", "#ffffff"]
    : ["#E63329","#1B4FD8","#1A7A4A","#B45309","#ffffff"];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 48 }).map((_, i) => <Particle key={i} color={colors[i % colors.length]} />)}
    </div>
  );
}

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
function NavBar({ title, subtitle, left, right, bgColor = "#ffffff", textColor = "#111111", borderColor = "#E5E7EB" }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md"
      style={{ backgroundColor: bgColor + "E8", borderBottom: `2px solid ${borderColor}` }}>
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
        <div className="w-24 flex justify-start">{left}</div>
        <div className="flex flex-col items-center min-w-0">
          <span className="text-sm font-bold tracking-tight truncate max-w-[160px]" style={{ color: textColor }}>{title}</span>
          {subtitle && <span className="text-xs font-medium" style={{ color: textColor, opacity: 0.55 }}>{subtitle}</span>}
        </div>
        <div className="w-24 flex justify-end">{right}</div>
      </div>
    </div>
  );
}

// ─── PILL BUTTON ─────────────────────────────────────────────────────────────
function PillButton({ onClick, children, style, className = "" }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 font-bold text-sm ${className}`}
      style={{ borderRadius: R.pill, border: "2px solid transparent", ...style }}>
      {children}
    </motion.button>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const steps = [
    { Icon: Globe,     title: "Bem-vindo ao LinguaFlash", body: "Aprenda vocabulário em 5 idiomas com flashcards gamificados — feito para brasileiros." },
    { Icon: RotateCcw, title: "Como funciona",            body: "Toque no card para revelar a tradução. Depois diga se conhecia a palavra ou não." },
    { Icon: Bookmark,  title: "Salve favoritas",          body: "Toque no ícone de favorito no card para salvar palavras e revisar depois." },
    { Icon: Flame,     title: "Mantenha seu streak",      body: "Estude todos os dias para acumular XP, subir de nível e manter sua sequência ativa." },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const { Icon, title, body } = steps[step];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center px-8 pb-16">
      {/* Skip */}
      <button onClick={onDone}
        className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5"
        style={{ borderRadius: R.pill }}>
        Pular
      </button>
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xs">
        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mx-auto mb-8"
          style={{ borderRadius: R.card }}>
          <Icon size={36} strokeWidth={1.5} className="text-gray-700" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
      </motion.div>
      <div className="flex gap-2 mt-12 mb-8">
        {steps.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{ width: i === step ? 20 : 8, height: 8, backgroundColor: i === step ? "#111827" : "#E5E7EB" }} />
        ))}
      </div>
      <PillButton onClick={() => isLast ? onDone() : setStep(s => s + 1)}
        style={{ backgroundColor: "#111827", color: "#fff", border: "2px solid #111827", minWidth: 160 }}>
        {isLast ? "Começar" : "Próximo"} <ArrowRight size={16} />
      </PillButton>
    </motion.div>
  );
}

// ─── HELP MODAL ───────────────────────────────────────────────────────────────
function HelpModal({ onClose }) {
  const items = [
    { Icon: RotateCcw, label: "Toque no card para revelar a tradução" },
    { Icon: Check,     label: '"Eu Conheço!" remove o card da fila' },
    { Icon: X,         label: '"Ainda Aprendendo" recicla o card para mais tarde' },
    { Icon: Bookmark,  label: "Salve palavras tocando no ícone de favorito" },
    { Icon: Volume2,   label: "Toque no ícone de som para ouvir a pronúncia" },
    { Icon: Flame,     label: "Estude diariamente para manter seu streak e subir de nível" },
    { Icon: RefreshCw, label: "Conclua todos os cards para ganhar XP e ver seu resultado" },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white pb-8 px-6 pt-6"
        style={{ borderRadius: `${R.card}px ${R.card}px 0 0` }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-gray-900">Como funciona</h2>
          <button onClick={onClose} className="p-1 hover:opacity-60 transition-opacity">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          {items.map(({ Icon, label }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-100 flex items-center justify-center shrink-0" style={{ borderRadius: R.card }}>
                <Icon size={16} strokeWidth={1.5} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 pt-1.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen({ stats, xp, streak, onBack, onStudyDeck }) {
  const totalStudied  = Object.values(stats.studied || {}).reduce((a, b) => a + b, 0);
  const totalCorrect  = stats.totalCorrect || 0;
  const totalAttempts = stats.totalAttempts || 0;
  const overallAcc    = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
  const level         = getLevel(xp);
  const xpInLevel     = getXPInLevel(xp);
  const xpProgress    = xpInLevel / XP_PER_LEVEL;

  const statCards = [
    { label: "Total estudadas", value: totalStudied,     Icon: BookOpen },
    { label: "Precisão geral",  value: `${overallAcc}%`, Icon: Target   },
    { label: "Streak atual",    value: streak,           Icon: Flame    },
  ];
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen bg-white">
      <NavBar title="Estatísticas"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><ChevronLeft className="w-4 h-4" /> Voltar</button>} />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16 space-y-4">
        {/* Level + XP hero */}
        <div className="bg-gray-900 p-5 text-white" style={{ borderRadius: R.card }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Nível atual</div>
              <div className="text-5xl font-black leading-none">{level}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{xp} <span className="text-sm font-semibold text-gray-400">XP</span></div>
              <div className="text-xs text-gray-400">{xpInLevel}/{XP_PER_LEVEL} para o nível {level + 1}</div>
            </div>
          </div>
          {/* XP progress bar */}
          <div className="h-1.5 bg-gray-700 overflow-hidden" style={{ borderRadius: R.card }}>
            <motion.div className="h-full bg-white" style={{ borderRadius: R.card }}
              initial={{ width: 0 }} animate={{ width: `${xpProgress * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {statCards.map(({ label, value, Icon }, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 p-4 text-center" style={{ borderRadius: R.card }}>
              <Icon size={20} strokeWidth={1.5} className="mx-auto mb-2 text-gray-400" />
              <div className="text-xl font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</div>
            </div>
          ))}
        </div>

        {Object.keys(stats.completedDecks || {}).length > 0 && (
          <div className="bg-gray-50 border border-gray-100 p-4" style={{ borderRadius: R.card }}>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Award size={14} className="text-gray-400" /> Categorias concluídas
            </p>
            <div className="space-y-2">
              {Object.entries(stats.completedDecks || {}).map(([key, langs]) => {
                const DeckIcon = DECKS[key]?.icon || BookOpen;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <DeckIcon size={16} strokeWidth={1.5} className="text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 flex-1">{DECKS[key]?.label}</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {langs.map(lc => {
                        const lm = LANG_META[lc];
                        return (
                          <button key={lc} onClick={() => onStudyDeck(lc, key)}
                            className="text-xs font-bold px-2 py-0.5 hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: lm.accent + "22", color: lm.accent, border: `1px solid ${lm.accent}44`, borderRadius: R.pill }}>
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
const FLAG_ICONS = {
  es: "/espanha.png",
  it: "/italia.png",
  ru: "/russia.png",
  fr: "/franca.png",
  de: "/alemanha.png",
  en: "/brasil.png",
};
function FlagIcon({ langCode, size = 40 }) {
  const src = FLAG_ICONS[langCode];
  if (!src) return null;
  return (
    <img src={src} alt={langCode} width={size} height={size}
      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block" }} />
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ xp, streak, favorites, stats, onSelectLang, onOpenFavorites, onOpenStats, lastStudied }) {
  const [showHelp, setShowHelp] = useState(false);
  const level      = getLevel(xp);
  const xpInLevel  = getXPInLevel(xp);
  const favCount   = Object.keys(favorites).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-white">
      <NavBar title="LinguaFlash"
        right={
          <button onClick={() => setShowHelp(true)} className="p-2 hover:opacity-60 transition-opacity">
            <HelpCircle size={20} className="text-gray-400" />
          </button>
        }
      />
      <AnimatePresence>{showHelp && <HelpModal onClose={() => setShowHelp(false)} />}</AnimatePresence>

      <div className="max-w-md mx-auto px-4 pt-6 pb-16">
        {/* Hero row — streak + level */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 p-4 bg-gray-900 text-white" style={{ borderRadius: R.card }}>
            <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Streak</div>
            <div className="text-4xl font-black leading-none">{streak} <span className="text-base font-semibold text-gray-400">dias</span></div>
          </div>
          <button onClick={onOpenStats} className="flex-1 p-4 bg-gray-50 border border-gray-100 text-left hover:bg-gray-100 transition-colors" style={{ borderRadius: R.card }}>
            <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">Nível</div>
            <div className="text-4xl font-black leading-none text-gray-900">{level}</div>
            <div className="mt-2 h-1 bg-gray-200 overflow-hidden" style={{ borderRadius: R.card }}>
              <div className="h-full bg-gray-900 transition-all duration-500" style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%`, borderRadius: R.card }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">{xpInLevel}/{XP_PER_LEVEL} XP</div>
          </button>
        </div>

        {/* Quick-resume: last studied lang */}
        {lastStudied && LANG_META[lastStudied] && (() => {
          const lang = LANG_META[lastStudied];
          const doneCount = Object.values(stats.completedDecks || {}).filter(ls => ls.includes(lastStudied)).length;
          const firstIncomplete = DECK_KEYS.find(k => !(stats.completedDecks?.[k]?.includes(lastStudied)));
          return firstIncomplete ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Continuar</p>
              <button onClick={() => onSelectLang(lastStudied, firstIncomplete)}
                className="w-full flex items-center gap-4 p-4 text-left hover:opacity-90 transition-opacity"
                style={{ backgroundColor: lang.accent, borderRadius: R.card }}>
                <FlagIcon langCode={lastStudied} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">{lang.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {getDeckLabel(firstIncomplete, lastStudied)} · {doneCount}/{DECK_KEYS.length} concluídas
                  </div>
                </div>
                <ArrowRight size={20} className="text-white shrink-0" />
              </button>
            </motion.div>
          ) : null;
        })()}

        {/* Languages */}
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Idiomas</p>
        <div className="space-y-3 mb-6">
          {Object.entries(LANG_META).map(([code, lang], i) => {
            const doneCount = Object.values(stats.completedDecks || {}).filter(ls => ls.includes(code)).length;
            const total = DECK_KEYS.length;
            return (
              <motion.button key={code} onClick={() => onSelectLang(code)}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                className="w-full text-left hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #E5E7EB", borderRadius: R.card, backgroundColor: "#FAFAFA" }}>
                <div className="flex items-center gap-3 p-4">
                  <FlagIcon langCode={code} size={40} />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{lang.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {total} categorias · {Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras
                    </div>
                  </div>
                  {doneCount > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 shrink-0"
                      style={{ backgroundColor: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: R.pill }}>
                      <Check size={10} strokeWidth={3} />{doneCount}/{total}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Secondary actions */}
        <div className="flex gap-3">
          <button onClick={onOpenFavorites}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            style={{ border: "2px solid #E5E7EB", borderRadius: R.card }}>
            <Bookmark size={16} strokeWidth={1.5} />
            Favoritas {favCount > 0 && <span className="text-xs font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500" style={{ borderRadius: R.pill }}>{favCount}</span>}
          </button>
          <button onClick={onOpenStats}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            style={{ border: "2px solid #E5E7EB", borderRadius: R.card }}>
            <BarChart2 size={16} strokeWidth={1.5} />
            Estatísticas
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FAVORITES SCREEN ────────────────────────────────────────────────────────
function FavoritesScreen({ favorites, onStudyFavs, onBack, onClearAll }) {
  const favByLang = Object.entries(LANG_META)
    .map(([code, lang]) => ({
      code, lang,
      count: Object.keys(favorites).filter(k => k.startsWith(`${code}:`)).length
    }))
    .filter(x => x.count > 0);

  const totalCount = Object.keys(favorites).length;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen bg-white">
      <NavBar title="Palavras Favoritas"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><ChevronLeft className="w-4 h-4" /> Voltar</button>} />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 pt-24 text-center">
            <Bookmark size={40} strokeWidth={1.5} className="text-gray-200" />
            <p className="font-bold text-gray-400">Nenhuma palavra favorita ainda.</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Salve palavras difíceis tocando no ícone <Bookmark size={13} strokeWidth={2} className="inline-block align-middle -mt-0.5" /> durante os estudos.
            </p>
            <PillButton onClick={onBack} style={{ backgroundColor: "#111111", color: "#fff", border: "2px solid #111111" }}>Voltar</PillButton>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Escolha o idioma para revisar</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onClearAll}
                className="self-start flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-3 py-1.5"
                style={{ border: "2px solid #FECACA", borderRadius: R.pill, backgroundColor: "#FEF2F2" }}>
                <X size={12} /> Limpar tudo
              </motion.button>
            </div>
            <div className="space-y-3">
              <motion.button onClick={() => onStudyFavs("__all__", "__favorites_all__")}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #E5E7EB", borderRadius: R.card, backgroundColor: "#FAFAFA" }}>
                <BookMarkedIcon size={22} strokeWidth={1.5} className="text-gray-700 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Todas as palavras</div>
                  <div className="text-xs text-gray-400 mt-0.5">{totalCount} {totalCount === 1 ? "palavra" : "palavras"} · todos os idiomas</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </motion.button>
              {favByLang.map(({ code, lang, count }) => (
                <motion.button key={code} onClick={() => onStudyFavs(code, "__favorites__")}
                  whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  style={{ border: "2px solid #E5E7EB", borderRadius: R.card, backgroundColor: "#FAFAFA" }}>
                  <FlagIcon langCode={code} size={36} />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{lang.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{count} {count === 1 ? "palavra" : "palavras"}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── DECK SELECTOR ───────────────────────────────────────────────────────────
function DeckSelector({ langCode, onSelectDeck, onBack, streak, completedDecks }) {
  const lang = LANG_META[langCode];
  const [query, setQuery] = useState("");
  const filtered = DECK_KEYS.filter(k =>
    getDeckLabel(k, langCode).toLowerCase().includes(query.toLowerCase())
  );
  const doneCount = DECK_KEYS.filter(k => completedDecks[k]?.includes(langCode)).length;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen" style={{ backgroundColor: lang.accent }}>
      <NavBar title={lang.name}
        bgColor={lang.accent} textColor="#ffffff" borderColor="rgba(255,255,255,0.2)"
        left={
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
            <ChevronLeft className="w-4 h-4" /> Início
          </button>
        }
        right={
          <div className="flex items-center gap-1 px-2 py-1" style={{ border: "2px solid rgba(255,255,255,0.4)", borderRadius: R.pill }}>
            <Flame size={14} className="text-white" />
            <span className="font-bold text-xs text-white">{streak}</span>
          </div>
        }
      />
      <div className="max-w-md mx-auto px-4 pt-6 pb-16">
        <div className="mb-5">
          <h2 className="text-3xl font-black tracking-tight text-white">{lang.name}</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            {doneCount}/{DECK_KEYS.length} categorias concluídas
          </p>
        </div>
        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.5)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar categoria..."
            className="w-full pl-9 pr-4 py-2.5 text-sm font-semibold outline-none"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)",
              borderRadius: R.pill, color: "#ffffff" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((key, i) => {
            const deck = DECKS[key];
            const Icon = deck.icon;
            const done = completedDecks[key]?.includes(langCode);
            return (
              <motion.button key={key} onClick={() => onSelectDeck(key)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex flex-col items-start gap-3 p-4 text-left hover:opacity-90 transition-opacity"
                style={{
                  border: done ? "2px solid #BBF7D0" : "2px solid rgba(255,255,255,0.25)",
                  borderRadius: R.card,
                  backgroundColor: done ? "#F0FDF4" : "#ffffff",
                }}>
                {done && (
                  <span className="absolute top-2 right-2 flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5"
                    style={{ backgroundColor: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: R.pill }}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
                <Icon size={36} strokeWidth={1.5} style={{ color: done ? "#16A34A" : lang.accent }} />
                <div>
                  <div className="font-bold text-sm leading-tight" style={{ color: done ? "#15803D" : lang.textPrimary }}>{getDeckLabel(key, langCode)}</div>
                  <div className="text-xs mt-0.5" style={{ color: done ? "#4ADE80" : lang.textSecondary }}>{VOCAB[langCode][key].length} cards</div>
                </div>
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-8" style={{ color: "rgba(255,255,255,0.6)" }}>
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">Nenhuma categoria encontrada</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── FLASH CARD ───────────────────────────────────────────────────────────────
function FlashCard({ card, isFlipped, onClick, lang, langCode, isFav, onToggleFav, showLangBadge, onFavSaved }) {
  const [ttsPlaying,   setTtsPlaying]   = useState(false);
  const [ttsUnsupported, setTtsUnsupported] = useState(false);
  const [favPulse,     setFavPulse]     = useState(false);

  const handleTTS = (e) => {
    e.stopPropagation();
    if (!window.speechSynthesis) { setTtsUnsupported(true); return; }
    if (ttsPlaying) { window.speechSynthesis.cancel(); setTtsPlaying(false); return; }
    setTtsPlaying(true);
    const u = new SpeechSynthesisUtterance(card.target);
    const map = { es: "es-ES", it: "it-IT", ru: "ru-RU", fr: "fr-FR", de: "de-DE", en: "pt-BR" };
    u.lang = map[langCode] || "en-US";
    u.rate = 0.85;
    u.onend = () => setTtsPlaying(false);
    u.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    onToggleFav(card);
    if (!isFav) { // about to become saved
      setFavPulse(true);
      setTimeout(() => setFavPulse(false), 400);
      onFavSaved && onFavSaved();
    }
  };

  // Dynamic font size based on word length
  const ptLen = (card.pt || "").length;
  const frontFontSize = ptLen <= 8 ? "2.25rem" : ptLen <= 18 ? "1.75rem" : "1.25rem";

  return (
    <div className="w-full" style={{ perspective: 1400, height: 240 }}>
      <motion.div key={card.pt + card.target}
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", height: "100%" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
        onClick={onClick}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            backgroundColor: "#ffffff", border: "2px solid #E5E7EB", borderRadius: R.card }}>
          {showLangBadge && (
            <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5"
              style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: R.pill }}>
              {lang.name}
            </span>
          )}
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">{langCode === "en" ? "English" : "Português"}</p>
          <p className="font-black text-gray-900 text-center leading-tight" style={{ fontSize: frontFontSize }}>{card.pt}</p>
          <p className="mt-6 text-xs font-medium flex items-center gap-1.5" style={{ color: "#6B7280" }}>
            <RotateCcw className="w-3 h-3" /> {langCode === "en" ? "tap to reveal" : "toque para revelar"}
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)", backgroundColor: lang.accent,
            border: `2px solid ${lang.accent}`, borderRadius: R.card }}>
          {/* Fav button with pulse */}
          <motion.button onClick={handleFav}
            animate={favPulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className="absolute top-3 right-3 p-2 hover:opacity-70 transition-opacity">
            {isFav
              ? <BookMarked size={20} style={{ color: "#ffffff" }} />
              : <Bookmark size={20} style={{ color: "rgba(255,255,255,0.5)" }} />}
          </motion.button>
          {/* TTS button with playing state */}
          {langCode !== "en" && (
            <button onClick={handleTTS}
              className="absolute top-3 left-3 p-2 hover:opacity-70 transition-opacity">
              {ttsPlaying
                ? <VolumeX size={20} style={{ color: "#ffffff" }} />
                : <Volume2 size={20} style={{ color: ttsUnsupported ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)" }} />}
            </button>
          )}
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.7)" }}>{langCode === "en" ? "Português" : lang.name}</p>
          <p className="text-3xl font-black text-center leading-tight text-white break-words max-w-full px-8">
            {card.target}
          </p>
          {card.phonetic && (
            <p className="mt-2 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{card.phonetic}</p>
          )}
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{card.pt}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── MASTERED SCREEN ─────────────────────────────────────────────────────────
function MasteredScreen({ deckLabel, onReview, onBack, lang }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white">
      <NavBar title={deckLabel} bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><X className="w-4 h-4" /> Sair</button>} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6 max-w-md mx-auto">
        <div className="w-20 h-20 flex items-center justify-center"
          style={{ backgroundColor: lang.accent, borderRadius: R.card }}>
          <Check size={36} strokeWidth={2} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Categoria dominada!</h2>
          <p className="text-gray-500 text-sm">Você já concluiu <strong>{deckLabel}</strong>. Quer revisar de novo ou escolher outra categoria?</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <PillButton onClick={onReview} className="w-full gap-2"
            style={{ backgroundColor: lang.accent, color: "#fff", border: `2px solid ${lang.accent}` }}>
            <RefreshCw size={16} /> Revisar novamente
          </PillButton>
          <PillButton onClick={onBack} className="w-full gap-2"
            style={{ backgroundColor: "transparent", border: "2px solid #E5E7EB", color: "#374151" }}>
            <ChevronLeft size={16} /> Escolher outra
          </PillButton>
        </div>
      </div>
    </motion.div>
  );
}

// ─── STUDY SCREEN ─────────────────────────────────────────────────────────────
function StudyScreen({ langCode, deckKey, onFinish, onBack, onXP, favorites, onToggleFav, isReview }) {
  const isFavAll  = deckKey === "__favorites_all__";
  const isFavDeck = deckKey === "__favorites__" || isFavAll;
  const deckLabel = isFavAll ? "Todas as Favoritas" : isFavDeck ? "Favoritas" : getDeckLabel(deckKey, langCode);
  const neutralLang = { name: "Favoritas", accent: "#374151", textPrimary: "#111827", textSecondary: "#6B7280" };
  const lang = LANG_META[langCode] || neutralLang;

  // ── Mounted guard — prevents setState after unmount (causes blank screen) ──
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

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

  const [queue,        setQueue]        = useState(originalCards);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const [correct,      setCorrect]      = useState(0);
  const [incorrect,    setIncorrect]    = useState(0);
  const [answered,     setAnswered]     = useState(false);
  const [flashColor,   setFlashColor]   = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const [favToast,     setFavToast]     = useState(false);
  const controls = useAnimation();

  const total    = originalCards.length;
  const progress = total > 0 ? Math.min(correct / total, 1) : 0;
  const card     = queue[currentIdx];

  // Stagger: card flips (480ms) → tip box → buttons (150ms later)
  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => { if (mounted.current) setButtonsVisible(true); }, 630);
    }
  };

  // Reset button visibility when card changes
  const resetCard = () => {
    setIsFlipped(false);
    setAnswered(false);
    setButtonsVisible(false);
  };

  if (!card) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-white">
      <NavBar title={deckLabel} bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><X className="w-4 h-4" /> Sair</button>} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <Bookmark size={40} strokeWidth={1.5} className="text-gray-200" />
        <p className="font-bold text-gray-400">Sem palavras na fila.</p>
        <p className="text-sm text-gray-400 max-w-xs">Salve palavras durante os estudos para revisá-las aqui.</p>
        <PillButton onClick={onBack} style={{ backgroundColor: "#111111", color: "#fff", border: "2px solid #111111" }}>Voltar</PillButton>
      </div>
    </motion.div>
  );

  const cardLang     = isFavAll ? (card._lang || langCode) : langCode;
  const cardLangMeta = isFavAll ? (LANG_META[card._lang] || neutralLang) : lang;
  const favKey       = `${cardLang}:${card.pt}`;
  const isFav        = !!favorites[favKey];
  const accentColor  = isFavAll ? cardLangMeta.accent : lang.accent;

  // Flash overlay tinted to language accent (correct), red (wrong)
  const flashBg = flashColor === "green"
    ? accentColor + "20"
    : "rgba(239,68,68,0.12)";

  const handleAnswer = async (knew) => {
    if (!isFlipped || answered) return;
    setAnswered(true);
    setFlashColor(knew ? "green" : "red");
    await controls.start({ x: knew ? 100 : -100, opacity: 0, rotate: knew ? 6 : -6, transition: { duration: 0.26, ease: "easeIn" } });
    if (!mounted.current) return; // user exited during animation — bail out
    setFlashColor(null);
    controls.set({ x: 0, opacity: 1, rotate: 0 });
    if (knew) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      const newQueue = queue.filter((_, i) => i !== currentIdx);
      if (newQueue.length === 0) {
        const totalAnswered = newCorrect + incorrect;
        const xpGained = Math.round(newCorrect / totalAnswered * 50) + 10;
        onXP(xpGained);
        setShowConfetti(true);
        setTimeout(() => { if (mounted.current) onFinish({ correct: newCorrect, total: totalAnswered, xpGained, deckKey, langCode }); }, 800);
        return;
      }
      setQueue(newQueue);
      setCurrentIdx(Math.min(currentIdx, newQueue.length - 1));
    } else {
      setIncorrect(inc => inc + 1);
      const newQueue = [...queue];
      const [removed] = newQueue.splice(currentIdx, 1);
      newQueue.splice(Math.min(currentIdx + 2, newQueue.length), 0, removed);
      setQueue(newQueue);
      setCurrentIdx(Math.min(currentIdx, newQueue.length - 1));
    }
    resetCard();
  };

  // Swipe-to-answer via Framer Motion drag
  const handleDragEnd = (_, info) => {
    if (!isFlipped || answered) return;
    const threshold = 80;
    if (info.offset.x > threshold) handleAnswer(true);
    else if (info.offset.x < -threshold) handleAnswer(false);
  };

  const navTitle = isReview ? deckLabel : deckLabel;
  const navSubtitle = isReview ? "Revisão" : undefined;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen flex flex-col bg-white">
      <Confetti active={showConfetti} accentColor={accentColor} />
      <NavBar
        title={navTitle} subtitle={navSubtitle}
        bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900"><X className="w-4 h-4" /> {langCode === "en" ? "Exit" : "Sair"}</button>}
        right={<span className="text-sm font-semibold text-gray-400">{queue.length} {langCode === "en" ? "remaining" : "restantes"}</span>}
      />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-10 flex flex-col">
        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden bg-gray-100" style={{ borderRadius: R.card }}>
            <motion.div className="h-full" style={{ backgroundColor: accentColor, borderRadius: R.card }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{correct} {langCode === "en" ? "correct" : "acertadas"}</span>
            <span className="text-xs font-semibold text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 justify-center">
          {/* Card — draggable when flipped */}
          <div className="relative" style={{ height: 240 }}>
            <AnimatePresence>
              {flashColor && (
                <motion.div className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: flashBg, borderRadius: R.card }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            {/* Swipe hint labels */}
            {isFlipped && !answered && (
              <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-20 pointer-events-none opacity-30">
                  <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-white px-2 py-1" style={{ borderRadius: R.card }}>
                    <X size={12} />
                  </div>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20 pointer-events-none opacity-30">
                  <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-white px-2 py-1" style={{ borderRadius: R.card }}>
                    <Check size={12} />
                  </div>
                </div>
              </>
            )}
            <motion.div animate={controls} style={{ height: "100%" }}
              drag={isFlipped && !answered ? "x" : false}
              dragConstraints={{ left: -120, right: 120 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              whileDrag={{ cursor: "grabbing" }}
            >
              <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip}
                lang={cardLangMeta} langCode={cardLang} isFav={isFav}
                onToggleFav={(c) => onToggleFav(cardLang, c)}
                onFavSaved={() => { setFavToast(true); setTimeout(() => { if (mounted.current) setFavToast(false); }, 1800); }}
                showLangBadge={isFavAll} />
            </motion.div>
          </div>

          {/* Fav toast */}
          <AnimatePresence>
            {favToast && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-40 z-30 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: "#111827", borderRadius: R.pill, pointerEvents: "none" }}>
                <BookMarked size={12} /> {langCode === "en" ? "Saved!" : "Salvo!"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint / Tips slot */}
          <div className="min-h-[20px]">
            {!isFlipped ? (
              <p className="text-center text-xs font-medium" style={{ color: "#6B7280" }}>
                {langCode === "en" ? "Tap the card to see the translation" : "Toque no card para ver a tradução"}
              </p>
            ) : (card.example || card.tip) ? (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="border border-gray-100 bg-gray-50 px-4 py-3 space-y-1.5" style={{ borderRadius: R.card }}>
                {card.example && (
                  <p className="text-xs font-semibold text-gray-700 leading-snug">
                    <span className="text-gray-400 font-normal mr-1">ex.</span>{card.example}
                  </p>
                )}
                {card.tip && (
                  <p className="text-xs text-gray-500 leading-snug">{card.tip}</p>
                )}
              </motion.div>
            ) : null}
          </div>

          {/* Action pills — staggered fade-in after flip */}
          <motion.div className="flex gap-3"
            animate={{ opacity: buttonsVisible ? 1 : 0, y: buttonsVisible ? 0 : 6 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: buttonsVisible ? "auto" : "none" }}>
            <PillButton onClick={() => handleAnswer(false)} className="flex-1 gap-2 py-3.5 min-w-0"
              style={{ backgroundColor: "#ffffff", border: "2px solid #E5E7EB", color: "#DC2626" }}>
              <X size={18} strokeWidth={2} className="shrink-0" />
              <span className="text-sm font-bold text-center leading-tight">{langCode === "en" ? "Still Learning" : "Ainda Aprendendo"}</span>
            </PillButton>
            <PillButton onClick={() => handleAnswer(true)} className="flex-1 gap-2 py-3.5 min-w-0"
              style={{ backgroundColor: "#16A34A", border: "2px solid #16A34A", color: "#ffffff" }}>
              <Check size={18} strokeWidth={2} className="shrink-0" />
              <span className="text-sm font-bold text-center leading-tight">{langCode === "en" ? "I Know It!" : "Eu Conheço!"}</span>
            </PillButton>
          </motion.div>
        </div>

        {/* Stats footer */}
        <div className="flex justify-center gap-8 mt-8 pt-4 border-t border-gray-100">
          {[{ label: langCode === "en" ? "Correct" : "Acertou", val: correct, color: "#16A34A" },
            { label: langCode === "en" ? "Wrong"   : "Errou",   val: incorrect, color: "#DC2626" },
            { label: "Total",                                    val: total,     color: "#6B7280" }].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
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
    { text: "Perfeito!",         sub: "Você acertou todas!" },
    { text: "Incrível!",         sub: "100% de aproveitamento!" },
    { text: "Sem erros!",        sub: "Domínio total desta categoria." },
  ],
  great: [
    { text: "Muito bem!",        sub: "Quase perfeito, continue assim!" },
    { text: "Ótimo resultado!",  sub: "Mais um pouco e você domina isso." },
    { text: "Excelente!",        sub: "Você está evoluindo rápido." },
  ],
  good: [
    { text: "Bom trabalho!",     sub: "Continue praticando!" },
    { text: "Progredindo!",      sub: "Cada repetição conta." },
    { text: "Na direção certa!", sub: "A prática leva à perfeição." },
  ],
  keep: [
    { text: "Continue tentando!", sub: "A prática leva à perfeição." },
    { text: "Não desanime!",      sub: "Repita esta categoria amanhã." },
    { text: "Persista!",          sub: "Repetição é a chave do aprendizado." },
  ],
};

function ResultScreen({ result, langCode, deckKey, onRestart, onHome, onNextDeck, onNextLang, fromFavorites }) {
  const lang             = LANG_META[langCode] ?? { accent: "#374151", textPrimary: "#111827", textSecondary: "#6B7280", borderColor: "#D1D5DB" };
  const accuracy         = Math.round((result.correct / result.total) * 100);
  const currentDeckIndex = DECK_KEYS.indexOf(deckKey);
  const nextDeckKey      = DECK_KEYS[currentDeckIndex + 1] ?? null;
  const nextDeck         = (!fromFavorites && nextDeckKey) ? DECKS[nextDeckKey] : null;
  const langKeys         = Object.keys(LANG_META);
  const nextLangCode     = (!fromFavorites && !nextDeck) ? (langKeys[langKeys.indexOf(langCode) + 1] ?? null) : null;
  const nextLang         = nextLangCode ? LANG_META[nextLangCode] : null;
  const homeLabel        = fromFavorites ? "Favoritas" : "Início";
  const deckName         = getDeckLabel(deckKey, langCode) || "categoria";

  const tier   = accuracy === 100 ? "perfect" : accuracy >= 80 ? "great" : accuracy >= 60 ? "good" : "keep";
  const pool   = RESULT_COPY[tier];
  const pick   = pool[Math.floor(Math.random() * pool.length)];
  const Icon   = accuracy === 100 ? Check : accuracy >= 80 ? Target : accuracy >= 60 ? Zap : RotateCcw;

  // Personalised sub-message
  const subMsg = accuracy >= 80
    ? `${pick.sub.replace("!", `! Você acertou ${result.correct}/${result.total} em ${deckName}.`)}`
    : `${pick.sub}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white">
      <NavBar title="Resultado" bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB" />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-16 flex flex-col">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: lang.accent, borderRadius: R.card }}>
            <Icon size={36} strokeWidth={2} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{pick.text}</h2>
          <p className="text-sm mt-2 text-gray-500 max-w-xs mx-auto">{subMsg}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { Icon: Target, label: "Precisão", value: `${accuracy}%`             },
            { Icon: Zap,    label: "XP Ganho", value: `+${result.xpGained}`      },
            { Icon: Check,  label: "Acertos",  value: `${result.correct}/${result.total}` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="p-4 text-center" style={{ borderRadius: R.card, backgroundColor: lang.accent }}>
              <s.Icon size={16} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.75)" }} />
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-auto">
          {nextDeck && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextDeck(nextDeckKey)}
              className="w-full flex items-center justify-between px-6 py-4 font-bold"
              style={{ backgroundColor: lang.accent, color: "#ffffff", borderRadius: R.pill, border: `2px solid ${lang.accent}` }}>
              <span>Próxima: {getDeckLabel(nextDeckKey, langCode)}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          {nextLang && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextLang(nextLangCode, DECK_KEYS[0])}
              className="w-full flex items-center justify-between px-6 py-4 font-bold"
              style={{ backgroundColor: "#111827", color: "#ffffff", borderRadius: R.pill, border: "2px solid #111827" }}>
              <span>Começar: {nextLang.name}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          <div className="flex gap-3">
            <PillButton onClick={onHome} className="flex-1 gap-2"
              style={{ backgroundColor: "transparent", border: "2px solid #E5E7EB", color: "#374151" }}>
              <Home size={16} /> {homeLabel}
            </PillButton>
            <PillButton onClick={() => onRestart(true)} className="flex-1 gap-2"
              style={{ backgroundColor: "transparent", border: "2px solid #E5E7EB", color: "#374151" }}>
              <RotateCcw size={16} /> Repetir
            </PillButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,          setScreen]          = useState(() => getStorage("lf_seen_onboard", false) ? "dashboard" : "onboard");
  const [selectedLang,    setSelectedLang]    = useState(null);
  const [selectedDeck,    setSelectedDeck]    = useState(null);
  const [result,          setResult]          = useState(null);
  const [fromFavorites,   setFromFavorites]   = useState(false);
  const [isReview,        setIsReview]        = useState(false);
  const [lastStudied,     setLastStudied]     = useState(() => getStorage("lf_last_studied", null));
  const [studySessionId,  setStudySessionId]  = useState(0); // increment to force fresh StudyScreen mount

  const [xp,        setXP]        = useState(() => getStorage("lf_xp", 0));
  const [favorites, setFavorites] = useState(() => getStorage("lf_favorites", {}));
  const [streak,    setStreak]    = useState(() => {
    const today     = new Date().toDateString();
    const saved     = getStorage("lf_streak", { count: 0, lastDate: null });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return (saved.lastDate === today || saved.lastDate === yesterday) ? saved.count : 0;
  });
  const [stats, setStats] = useState(() => getStorage("lf_stats", { totalCorrect: 0, totalAttempts: 0, completedDecks: {}, studied: {} }));

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

  const addXP = useCallback((amount) => {
    setXP(prev => { const n = prev + amount; setStorage("lf_xp", n); return n; });
    bumpStreak();
  }, [bumpStreak]);

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
      if (!existing.includes(langCode)) {
        next.completedDecks = { ...prev.completedDecks, [deckKey]: [...existing, langCode] };
      }
      setStorage("lf_stats", next);
      return next;
    });
  }, []);

  const goStudy = (lang, deck, fromFavs = false, review = false) => {
    setSelectedLang(lang); setSelectedDeck(deck);
    setFromFavorites(fromFavs);
    setIsReview(review);
    setStudySessionId(id => id + 1); // new id → fresh StudyScreen mount
    if (!fromFavs && lang) {
      setLastStudied(lang);
      setStorage("lf_last_studied", lang);
    }
    setScreen("study");
  };

  const handleSelectDeck = (langCode, deckKey) => {
    const isFavDeck = deckKey.startsWith("__");
    const isDone = !isFavDeck && stats.completedDecks?.[deckKey]?.includes(langCode);
    if (isDone) {
      setSelectedLang(langCode);
      setSelectedDeck(deckKey);
      setScreen("mastered");
    } else {
      goStudy(langCode, deckKey, false, false);
    }
  };

  // Stats screen: tap a completed deck badge → study it as review
  const handleStudyFromStats = (langCode, deckKey) => {
    goStudy(langCode, deckKey, false, true);
  };

  const backFromStudy  = () => setScreen(fromFavorites ? "favorites" : "decks");
  const homeFromResult = () => setScreen(fromFavorites ? "favorites" : "dashboard");

  // Dashboard: direct lang+deck shortcut (from continue button)
  const handleSelectLangDirect = (code, deckKey) => {
    setSelectedLang(code);
    if (deckKey) {
      handleSelectDeck(code, deckKey);
    } else {
      setScreen("decks");
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', sans-serif; } body { background: #fff; }`}</style>
        <AnimatePresence mode="wait">
          {screen === "onboard" && (
            <Onboarding key="onboard" onDone={() => { setStorage("lf_seen_onboard", true); setScreen("dashboard"); }} />
          )}
          {screen === "dashboard" && (
            <Dashboard key="dashboard" xp={xp} streak={streak} favorites={favorites} stats={stats}
              lastStudied={lastStudied}
              onSelectLang={(code, deckKey) => handleSelectLangDirect(code, deckKey)}
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
              onStudyFavs={(code, deck) => goStudy(code === "__all__" ? Object.keys(favorites)[0]?.split(":")[0] || "es" : code, deck, true)}
              onBack={() => setScreen("dashboard")}
              onClearAll={() => { setFavorites({}); setStorage("lf_favorites", {}); }} />
          )}
          {screen === "decks" && (
            <DeckSelector key="decks" langCode={selectedLang} streak={streak}
              completedDecks={stats.completedDecks || {}}
              onSelectDeck={(key) => handleSelectDeck(selectedLang, key)}
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
              isReview={isReview}
              onFinish={(res) => {
                updateStats(res.correct, res.total, res.deckKey, res.langCode);
                setResult(res);
                setScreen("result");
              }}
              onXP={addXP} onBack={backFromStudy} />
          )}
          {screen === "result" && result && (
            <ResultScreen key="result" result={result}
              langCode={selectedLang} deckKey={selectedDeck}
              fromFavorites={fromFavorites}
              onRestart={(forceReview) => {
                setIsReview(true); // always review on replay from result
                setScreen("study");
              }}
              onHome={homeFromResult}
              onNextDeck={(nextKey) => goStudy(selectedLang, nextKey, false)}
              onNextLang={(nextLang, firstDeck) => {
                setSelectedLang(nextLang);
                setSelectedDeck(firstDeck);
                goStudy(nextLang, firstDeck, false, false);
              }} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
