import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw, BarChart2,
  Home, ChevronLeft, Target, ArrowRight, Shuffle,
  Bookmark, BookMarked, Sparkles
} from "lucide-react";
import { LANG_META, DECKS, DECK_KEYS, VOCAB } from "./data.js";

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

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Particle({ color }) {
  const angle = Math.random() * 360, dist = 100 + Math.random() * 140;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 5 + Math.random() * 7;
  return (
    <motion.div className="absolute pointer-events-none"
      style={{ width: size, height: size, backgroundColor: color, borderRadius: 2, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: 360 }}
      transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }} />
  );
}
function Confetti({ active }) {
  const colors = ["#E63329","#1B4FD8","#1A7A4A","#C8850A","#1251A3","#9B59B6"];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 48 }).map((_, i) => <Particle key={i} color={colors[i % colors.length]} />)}
    </div>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
import { Component } from "react";
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="font-bold text-gray-800">Algo deu errado.</p>
        <p className="text-sm text-gray-500">{this.state.error.message}</p>
        <button onClick={() => this.setState({ error: null })}
          className="px-6 py-3 bg-gray-900 text-white rounded-full font-bold text-sm">
          Tentar novamente
        </button>
      </div>
    );
    return this.props.children;
  }
}

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
function NavBar({ title, left, right, bgColor = "#ffffff", textColor = "#111111", borderColor = "#E5E7EB" }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md"
      style={{ backgroundColor: bgColor + "E8", borderBottom: `2px solid ${borderColor}` }}>
      <div className="max-w-md mx-auto h-14 flex items-center justify-between px-4">
        <div className="w-24 flex justify-start">{left}</div>
        <span className="text-sm font-bold tracking-tight truncate" style={{ color: textColor }}>{title}</span>
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
      style={{ borderRadius: 999, border: "2px solid transparent", ...style }}>
      {children}
    </motion.button>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const steps = [
    { emoji: "🌍", title: "Bem-vindo ao LinguaFlash", body: "Aprenda vocabulário em 5 idiomas com flashcards gamificados." },
    { emoji: "🃏", title: "Como funciona", body: "Toque no card para revelar a tradução. Depois diga se conhecia a palavra ou não." },
    { emoji: "🔖", title: "Salve favoritas", body: "Toque no ícone de favorito no card para salvar palavras e revisar depois." },
    { emoji: "🔥", title: "Mantenha seu streak", body: "Estude todos os dias para acumular XP e manter sua sequência ativa." },
  ];
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const s = steps[step];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center px-8 pb-16">
      <motion.div key={step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-xs">
        <div className="text-7xl mb-8">{s.emoji}</div>
        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{s.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{s.body}</p>
      </motion.div>
      {/* dots */}
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

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen({ stats, xp, streak, onBack }) {
  const totalStudied = Object.values(stats.studied || {}).reduce((a, b) => a + b, 0);
  const totalCorrect = stats.totalCorrect || 0;
  const totalAttempts = stats.totalAttempts || 0;
  const overallAcc = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen bg-white">
      <NavBar title="Minhas Estatísticas"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><ChevronLeft className="w-4 h-4" /> Voltar</button>} />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total estudadas", value: totalStudied, icon: "📚" },
            { label: "Precisão geral",  value: `${overallAcc}%`, icon: "🎯" },
            { label: "Streak atual",    value: streak, icon: "🔥" },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-sm border border-gray-100 p-4 text-center" style={{ borderRadius: 2 }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-sm border border-gray-100 p-4" style={{ borderRadius: 2 }}>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">XP Total</p>
          <p className="text-3xl font-black text-gray-900">{xp} <span className="text-base font-semibold text-gray-400">XP</span></p>
        </div>
        {Object.keys(stats.completedDecks || {}).length > 0 && (
          <div className="bg-gray-50 rounded-sm border border-gray-100 p-4" style={{ borderRadius: 2 }}>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Categorias concluídas</p>
            <div className="space-y-2">
              {Object.entries(stats.completedDecks || {}).map(([key, langs]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{DECKS[key]?.label}</span>
                  <div className="flex gap-1">
                    {langs.map(l => <span key={l} className="text-xs">{LANG_META[l]?.flag}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ xp, streak, favorites, stats, onSelectLang, onOpenFavorites, onOpenStats }) {
  const favCount = Object.keys(favorites).length;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-white">
      <NavBar title="LinguaFlash"
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1" style={{ border: "2px solid #FED7AA", borderRadius: 999 }}>
              <Flame className="text-orange-500 w-3.5 h-3.5" />
              <span className="font-bold text-orange-600 text-xs">{streak}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1" style={{ border: "2px solid #FDE68A", borderRadius: 999 }}>
              <Zap className="text-yellow-500 w-3.5 h-3.5" />
              <span className="font-bold text-yellow-600 text-xs">{xp}</span>
            </div>
          </div>
        }
      />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Aprenda com flashcards</p>
        <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight mb-8">Qual idioma hoje?</h1>

        {/* XP bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold">Progresso geral</span><span>{xp} XP</span>
          </div>
          <div className="h-1.5 bg-gray-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <motion.div className="h-full bg-gray-900" style={{ borderRadius: 2 }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((xp % 100), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3 mb-4">
          {Object.entries(LANG_META).map(([code, lang], i) => {
            const doneCount = Object.values(stats.completedDecks || {}).filter(ls => ls.includes(code)).length;
            return (
              <motion.button key={code} onClick={() => onSelectLang(code)}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
                <span className="shrink-0 text-3xl leading-none">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{lang.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {DECK_KEYS.length} categorias · {Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras
                  </div>
                </div>
                {doneCount > 0 && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    {doneCount}/{DECK_KEYS.length} ✓
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </motion.button>
            );
          })}
        </div>

        {/* Favorites & Stats */}
        <div className="space-y-3">
          <motion.button onClick={onOpenFavorites} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
            style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
            <BookMarked size={28} strokeWidth={1.5} className="text-gray-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">Palavras Favoritas</div>
              <div className="text-xs text-gray-400 mt-0.5">{favCount} {favCount === 1 ? "palavra salva" : "palavras salvas"}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </motion.button>
          <motion.button onClick={onOpenStats} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
            style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
            <BarChart2 size={28} strokeWidth={1.5} className="text-gray-500 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-gray-900">Estatísticas</div>
              <div className="text-xs text-gray-400 mt-0.5">XP, precisão, categorias concluídas</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FAVORITES SCREEN ────────────────────────────────────────────────────────
function FavoritesScreen({ favorites, onStudyFavs, onBack, onClearAll }) {
  const favByLang = Object.entries(LANG_META).map(([code, lang]) => {
    const count = Object.keys(favorites).filter(k => k.startsWith(code + ":")).length;
    return { code, lang, count };
  }).filter(x => x.count > 0);
  const totalCount = Object.keys(favorites).length;

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen bg-white">
      <NavBar title="Palavras Favoritas"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><ChevronLeft className="w-4 h-4" /> Início</button>} />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16">
        {favByLang.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center">
            <Bookmark size={40} strokeWidth={1.5} className="text-gray-200" />
            <p className="font-bold text-gray-400">Nenhuma palavra favorita ainda.</p>
            <p className="text-sm text-gray-400">
              Salve palavras tocando no ícone <Bookmark size={13} strokeWidth={2} className="inline-block align-middle -mt-0.5" /> durante os estudos.
            </p>
            <PillButton onClick={onBack} style={{ backgroundColor: "#111111", color: "#fff", border: "2px solid #111111" }}>Voltar</PillButton>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Escolha o idioma para revisar</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onClearAll}
                className="self-start flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-3 py-1.5"
                style={{ border: "2px solid #FECACA", borderRadius: 999, backgroundColor: "#FEF2F2" }}>
                <X size={12} /> Limpar tudo
              </motion.button>
            </div>
            <div className="space-y-3">
              <motion.button onClick={() => onStudyFavs("__all__", "__favorites_all__")}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
                <BookMarked size={28} strokeWidth={1.5} className="text-gray-700 shrink-0" />
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
                  style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
                  <span className="text-3xl leading-none shrink-0">{lang.flag}</span>
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
          <div className="flex items-center gap-1 px-2 py-1" style={{ border: "2px solid rgba(255,255,255,0.4)", borderRadius: 999 }}>
            <Flame size={14} className="text-white" />
            <span className="font-bold text-xs text-white">{streak}</span>
          </div>
        }
      />
      <div className="max-w-md mx-auto px-4 pt-6 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-white">{lang.name}</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Escolha uma categoria</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DECK_KEYS.map((key, i) => {
            const deck = DECKS[key];
            const Icon = deck.icon;
            const done = completedDecks[key]?.includes(langCode);
            return (
              <motion.button key={key} onClick={() => onSelectDeck(key)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex flex-col items-start gap-3 p-4 text-left transition-opacity hover:opacity-90"
                style={{ border: "2px solid rgba(255,255,255,0.25)", borderRadius: 2, backgroundColor: "#ffffff" }}>
                {done && (
                  <span className="absolute top-2 right-2 text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">✓</span>
                )}
                <Icon size={40} strokeWidth={1.5} style={{ color: lang.accent }} />
                <div>
                  <div className="font-bold text-sm leading-tight" style={{ color: lang.textPrimary }}>{deck.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: lang.textSecondary }}>{VOCAB[langCode][key].length} cards</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── FLASH CARD ───────────────────────────────────────────────────────────────
function FlashCard({ card, isFlipped, onClick, lang, isFav, onToggleFav, showLangBadge }) {
  return (
    <div className="w-full h-full" style={{ perspective: 1400 }}>
      <motion.div key={card.pt + card.target}
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
        onClick={onClick}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            backgroundColor: "#ffffff", border: "2px solid #E5E7EB", borderRadius: 2 }}>
          {showLangBadge && (
            <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5"
              style={{ backgroundColor: lang.accent, color: "#fff", borderRadius: 999 }}>
              {lang.name}
            </span>
          )}
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">Português</p>
          <p className="text-3xl font-black text-gray-900 text-center leading-tight">{card.pt}</p>
          <p className="mt-6 text-xs font-medium flex items-center gap-1.5" style={{ color: "#6B7280" }}>
            <RotateCcw className="w-3 h-3" /> toque para revelar
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)", backgroundColor: lang.accent,
            border: `2px solid ${lang.accent}`, borderRadius: 2 }}>
          <button onClick={e => { e.stopPropagation(); onToggleFav(card); }}
            className="absolute top-3 right-3 p-2 hover:opacity-70 transition-opacity">
            {isFav
              ? <BookMarked size={20} style={{ color: "#ffffff" }} />
              : <Bookmark size={20} style={{ color: "rgba(255,255,255,0.5)" }} />}
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>{lang.name}</p>
          <p className="text-3xl font-black text-center leading-tight text-white">{card.target}</p>
          {card.phonetic && <p className="mt-2 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>{card.phonetic}</p>}
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{card.pt}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── STUDY SCREEN ─────────────────────────────────────────────────────────────
function StudyScreen({ langCode, deckKey, onFinish, onBack, onXP, favorites, onToggleFav }) {
  const isFavAll  = deckKey === "__favorites_all__";
  const isFavDeck = deckKey === "__favorites__" || isFavAll;
  const deckLabel = isFavAll ? "Todas as Favoritas" : isFavDeck ? "Favoritas" : DECKS[deckKey]?.label;

  const neutralLang = { name: "Favoritas", accent: "#374151", bg: "#F9FAFB", textPrimary: "#111827", textSecondary: "#6B7280", borderColor: "#D1D5DB" };

  // Build original cards with _lang tag for cross-language favs
  const originalCards = isFavAll
    ? shuffle(Object.entries(LANG_META).flatMap(([code]) =>
        Object.values(VOCAB[code]).flat()
          .filter(c => favorites[`${code}:${c.pt}`])
          .map(c => ({ ...c, _lang: code }))
      ))
    : isFavDeck
      ? shuffle(Object.values(VOCAB[langCode]).flat().filter(c => favorites[`${langCode}:${c.pt}`]))
      : shuffle([...VOCAB[langCode][deckKey]]);

  const [queue,        setQueue]        = useState(originalCards);
  const [currentIdx,   setCurrentIdx]   = useState(0);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const [correct,      setCorrect]      = useState(0);
  const [incorrect,    setIncorrect]    = useState(0);
  const [answered,     setAnswered]     = useState(false);
  const [flashColor,   setFlashColor]   = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const controls = useAnimation();

  const total    = originalCards.length;
  const progress = total > 0 ? Math.min(correct / total, 1) : 0;
  const card     = queue[currentIdx];

  // Graceful empty state
  if (!card) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-white">
      <NavBar title={deckLabel}
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500"><X className="w-4 h-4" /> Sair</button>} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <Bookmark size={40} strokeWidth={1.5} className="text-gray-200" />
        <p className="font-bold text-gray-400">Nenhuma palavra encontrada.</p>
        <PillButton onClick={onBack} style={{ backgroundColor: "#111111", color: "#fff", border: "2px solid #111111" }}>Voltar</PillButton>
      </div>
    </motion.div>
  );

  const cardLang     = isFavAll ? (card._lang || langCode) : langCode;
  const cardLangMeta = isFavAll ? (LANG_META[card._lang] || neutralLang) : (LANG_META[langCode] || neutralLang);
  const favKey       = `${cardLang}:${card.pt}`;
  const isFav        = !!favorites[favKey];

  const handleFlip = () => { if (!isFlipped) setIsFlipped(true); };

  const handleAnswer = async (knew) => {
    if (!isFlipped || answered) return;
    setAnswered(true);
    setFlashColor(knew ? "green" : "red");
    await controls.start({ x: knew ? 100 : -100, opacity: 0, rotate: knew ? 6 : -6, transition: { duration: 0.26, ease: "easeIn" } });
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
        setTimeout(() => onFinish({ correct: newCorrect, total: totalAnswered, xpGained, deckKey, langCode }), 800);
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
    setIsFlipped(false);
    setAnswered(false);
  };

  // Progress bar accent: for all-favs use the current card's lang color
  const progressAccent = isFavAll ? cardLangMeta.accent : (LANG_META[langCode]?.accent || "#374151");

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen flex flex-col bg-white">
      <Confetti active={showConfetti} />
      <NavBar title={deckLabel} bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB"
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900"><X className="w-4 h-4" /> Sair</button>}
        right={<span className="text-sm font-semibold text-gray-400">{queue.length} restantes</span>}
      />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-10 flex flex-col">
        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden bg-gray-100" style={{ borderRadius: 2 }}>
            <motion.div className="h-full" style={{ backgroundColor: progressAccent, borderRadius: 2 }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{correct} acertadas</span>
            <span className="text-xs font-semibold text-gray-500">{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Card — auto height with min, grows for long content */}
        <div className="flex flex-col gap-4 flex-1 justify-center">
          <div className="relative" style={{ minHeight: 200 }}>
            <AnimatePresence>
              {flashColor && (
                <motion.div className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: flashColor === "green" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", borderRadius: 2 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            <motion.div animate={controls} style={{ minHeight: 200 }}>
              <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip}
                lang={cardLangMeta} isFav={isFav}
                onToggleFav={(c) => onToggleFav(cardLang, c)}
                showLangBadge={isFavAll} />
            </motion.div>
          </div>

          {/* Fixed-height hint slot */}
          <div style={{ height: 20 }} className="flex items-center justify-center">
            {!isFlipped && (
              <p className="text-center text-xs font-medium" style={{ color: "#6B7280" }}>
                Toque no card para ver a tradução
              </p>
            )}
          </div>

          {/* Action pills — always in DOM, opacity toggle = no layout shift */}
          <div className="flex gap-3" style={{ opacity: isFlipped ? 1 : 0, pointerEvents: isFlipped ? "auto" : "none", transition: "opacity 0.2s" }}>
            <PillButton onClick={() => handleAnswer(false)} className="flex-1 gap-2 py-3.5 min-w-0"
              style={{ backgroundColor: "#ffffff", border: "2px solid #E5E7EB", color: "#DC2626" }}>
              <X size={18} strokeWidth={2} className="shrink-0" />
              <span className="text-sm font-bold text-center leading-tight">Ainda Aprendendo</span>
            </PillButton>
            <PillButton onClick={() => handleAnswer(true)} className="flex-1 gap-2 py-3.5 min-w-0"
              style={{ backgroundColor: "#16A34A", border: "2px solid #16A34A", color: "#ffffff" }}>
              <Check size={18} strokeWidth={2} className="shrink-0" />
              <span className="text-sm font-bold text-center leading-tight">Eu Conheço!</span>
            </PillButton>
          </div>
        </div>

        {/* Stats footer */}
        <div className="flex justify-center gap-8 mt-8 pt-4 border-t border-gray-100">
          {[{ label: "Acertou", val: correct, color: "#16A34A" }, { label: "Errou", val: incorrect, color: "#DC2626" }, { label: "Total", val: total, color: "#6B7280" }].map(s => (
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

  const msg = accuracy === 100 ? { emoji: "🏆", text: "Perfeito!", sub: "Você acertou todas!" }
    : accuracy >= 80 ? { emoji: "🎉", text: "Muito bem!", sub: "Quase perfeito, continue assim!" }
    : accuracy >= 60 ? { emoji: "💪", text: "Bom trabalho!", sub: "Continue praticando!" }
    : { emoji: "📚", text: "Continue tentando!", sub: "A prática leva à perfeição." };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white">
      <NavBar title="Resultado" bgColor="#ffffff" textColor="#111827" borderColor="#E5E7EB" />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-16 flex flex-col">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
            className="text-7xl mb-4">{msg.emoji}</motion.div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{msg.text}</h2>
          <p className="text-sm mt-2 text-gray-500">{msg.sub}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Target, label: "Precisão", value: `${accuracy}%` },
            { icon: Zap,    label: "XP Ganho", value: `+${result.xpGained}` },
            { icon: Check,  label: "Acertos",  value: `${result.correct}/${result.total}` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="p-4 text-center" style={{ borderRadius: 2, backgroundColor: lang.accent }}>
              <s.icon size={16} className="mx-auto mb-2" style={{ color: "rgba(255,255,255,0.75)" }} />
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
              style={{ backgroundColor: lang.accent, color: "#ffffff", borderRadius: 999, border: `2px solid ${lang.accent}` }}>
              <span>Próxima: {nextDeck.label}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          {nextLang && (
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              whileTap={{ scale: 0.97 }} onClick={() => onNextLang(nextLangCode)}
              className="w-full flex items-center justify-between px-6 py-4 font-bold"
              style={{ backgroundColor: "#111827", color: "#ffffff", borderRadius: 999, border: "2px solid #111827" }}>
              <span>Começar {nextLang.flag} {nextLang.name}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
          <div className="flex gap-3">
            <PillButton onClick={onHome} className="flex-1 gap-2"
              style={{ backgroundColor: "transparent", border: "2px solid #E5E7EB", color: "#374151" }}>
              <Home size={16} /> {homeLabel}
            </PillButton>
            <PillButton onClick={onRestart} className="flex-1 gap-2"
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
  const [screen,        setScreen]        = useState(() => getStorage("lf_seen_onboard", false) ? "dashboard" : "onboard");
  const [selectedLang,  setSelectedLang]  = useState(null);
  const [selectedDeck,  setSelectedDeck]  = useState(null);
  const [result,        setResult]        = useState(null);
  const [fromFavorites, setFromFavorites] = useState(false);

  const [xp,        setXP]        = useState(() => getStorage("lf_xp", 0));
  const [favorites, setFavorites] = useState(() => getStorage("lf_favorites", {}));
  const [streak,    setStreak]    = useState(() => {
    const today     = new Date().toDateString();
    const saved     = getStorage("lf_streak", { count: 0, lastDate: null });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return (saved.lastDate === today || saved.lastDate === yesterday) ? saved.count : 0;
  });
  // stats: { totalCorrect, totalAttempts, completedDecks: {deckKey: [langCode,...]}, studied: {langCode: count} }
  const [stats, setStats] = useState(() => getStorage("lf_stats", { totalCorrect: 0, totalAttempts: 0, completedDecks: {}, studied: {} }));

  // Streak: increment on first activity of each day
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
      const next = { ...prev,
        totalCorrect:   (prev.totalCorrect  || 0) + correct,
        totalAttempts:  (prev.totalAttempts || 0) + total,
        studied: { ...prev.studied, [langCode]: ((prev.studied || {})[langCode] || 0) + total },
      };
      // mark deck complete for this lang (perfect round not required — just finishing)
      const existing = (prev.completedDecks || {})[deckKey] || [];
      if (!existing.includes(langCode)) {
        next.completedDecks = { ...prev.completedDecks, [deckKey]: [...existing, langCode] };
      }
      setStorage("lf_stats", next);
      return next;
    });
  }, []);

  const goStudy = (lang, deck, fromFavs = false) => {
    setSelectedLang(lang); setSelectedDeck(deck);
    setFromFavorites(fromFavs);
    setScreen("study");
  };

  const backFromStudy  = () => setScreen(fromFavorites ? "favorites" : "decks");
  const homeFromResult = () => setScreen(fromFavorites ? "favorites" : "dashboard");

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
              onSelectLang={(code) => { setSelectedLang(code); setScreen("decks"); }}
              onOpenFavorites={() => setScreen("favorites")}
              onOpenStats={() => setScreen("stats")} />
          )}
          {screen === "stats" && (
            <StatsScreen key="stats" stats={stats} xp={xp} streak={streak} onBack={() => setScreen("dashboard")} />
          )}
          {screen === "favorites" && (
            <FavoritesScreen key="favorites" favorites={favorites}
              onStudyFavs={(code, deck) => goStudy(code === "__all__" ? "es" : code, deck, true)}
              onBack={() => setScreen("dashboard")}
              onClearAll={() => { setFavorites({}); setStorage("lf_favorites", {}); }} />
          )}
          {screen === "decks" && (
            <DeckSelector key="decks" langCode={selectedLang} streak={streak}
              completedDecks={stats.completedDecks || {}}
              onSelectDeck={(key) => goStudy(selectedLang, key, false)}
              onBack={() => setScreen("dashboard")} />
          )}
          {screen === "study" && (
            <StudyScreen key={`study-${selectedLang}-${selectedDeck}`}
              langCode={selectedLang} deckKey={selectedDeck}
              favorites={favorites} onToggleFav={handleToggleFav}
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
              onRestart={() => setScreen("study")}
              onHome={homeFromResult}
              onNextDeck={(nextKey) => goStudy(selectedLang, nextKey, false)}
              onNextLang={(nextLang) => { setSelectedLang(nextLang); setScreen("decks"); }} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
