import { useState, useCallback, useMemo, Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw, BarChart2,
  Home, ChevronLeft, Target, ArrowRight, Bookmark, BookMarked, Sparkles,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette, Users, Heart,
  Smile, Globe, Volume2, Search, Award, HelpCircle, RefreshCw
} from "lucide-react";
import { LANG_META, DECKS, DECK_KEYS, VOCAB } from "./data.js";

// ─── STORAGE UTILITIES ────────────────────────────────────────────────────────
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

// ─── NATIVE SPEECH PROCESSING ENGINE ──────────────────────────────────────────
function speak(text, langCode) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const map = { es: "es-ES", it: "it-IT", ru: "ru-RU", fr: "fr-FR", de: "de-DE", pt: "pt-BR", en: "en-US" };
  u.lang = map[langCode] || "en-US";
  window.speechSynthesis.speak(u);
}

// ─── STRUCTURAL ERROR BOUNDARY (PREVENTS SCRIPT CRASHES) ──────────────────────
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Boundary Caught Error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-4 max-w-md mx-auto mt-20 bg-white border-2 border-red-500 rounded-xl">
          <h2 className="font-bold text-red-600">Ocorreu um erro na renderização.</h2>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm">
            Recarregar Aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── PRINCIPAL EXPORT COMPONENT ──────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard"); // dashboard, decks, study, result, mastered
  const [selectedLang, setSelectedLang] = useState("es");
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [isReview, setIsReview] = useState(false);
  const [fromFavorites, setFromFavorites] = useState(false);

  // Persistent States
  const [xp, setXp] = useState(() => getStorage("lf_xp", 0));
  const [streak, setStreak] = useState(() => getStorage("lf_streak", 0));
  const [lastStudyDate, setLastStudyDate] = useState(() => getStorage("lf_last_date", ""));
  const [favorites, setFavorites] = useState(() => getStorage("lf_favs", {}));
  const [stats, setStats] = useState(() => getStorage("lf_stats", {}));
  const [result, setResult] = useState(null);

  const addXP = useCallback((amount) => {
    setXp((prev) => {
      const next = prev + amount;
      setStorage("lf_xp", next);
      return next;
    });

    const today = new Date().toISOString().split("T")[0];
    if (lastStudyDate !== today) {
      setStreak((prev) => {
        let next = prev;
        if (!lastStudyDate) {
          next = 1;
        } else {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yestStr = yesterday.toISOString().split("T")[0];
          if (lastStudyDate === yestStr) next = prev + 1;
          else next = 1;
        }
        setStorage("lf_streak", next);
        return next;
      });
      setLastStudyDate(today);
      setStorage("lf_last_date", today);
    }
  }, [lastStudyDate]);

  const handleToggleFav = useCallback((card) => {
    setFavorites((prev) => {
      const next = { ...prev };
      if (next[card.nativeId]) delete next[card.nativeId];
      else next[card.nativeId] = card;
      setStorage("lf_favs", next);
      return next;
    });
  }, []);

  const updateStats = useCallback((correct, total, deckKey, langCode) => {
    setStats((prev) => {
      const next = { ...prev };
      const id = `${langCode}_${deckKey}`;
      const existing = next[id] || { correct: 0, total: 0, count: 0 };
      next[id] = {
        correct: existing.correct + correct,
        total: existing.total + total,
        count: existing.count + 1
      };
      setStorage("lf_stats", next);
      return next;
    });
  }, []);

  const goDecks = (lang) => { setSelectedLang(lang); setScreen("decks"); };
  
  const goStudy = (lang, deck, favMode = false, reviewMode = false) => {
    setSelectedLang(lang);
    setSelectedDeck(deck);
    setFromFavorites(favMode);
    setIsReview(reviewMode);
    setScreen("study");
  };

  const backFromStudy = () => {
    if (fromFavorites) setScreen("dashboard");
    else setScreen("decks");
  };

  const homeFromResult = () => { setScreen("dashboard"); };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8F9FF] text-neutral-900 font-sans antialiased flex flex-col items-center justify-start w-full sm:py-6">
        <div className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:rounded-[24px] sm:shadow-xl bg-white border border-neutral-200 flex flex-col justify-between relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* SCREEN: DASHBOARD */}
            {screen === "dashboard" && (
              <DashboardScreen key="dashboard" 
                xp={xp} streak={streak} favorites={favorites} stats={stats}
                onSelectLang={goDecks} onStudyFavs={(lang, deck) => goStudy(lang, deck, true, false)} />
            )}

            {/* SCREEN: DECKS ARCHITECTURE */}
            {screen === "decks" && (
              <DecksScreen key={`decks-${selectedLang}`}
                langCode={selectedLang} stats={stats} favorites={favorites}
                onSelectDeck={(key) => goStudy(selectedLang, key, false, false)}
                onReviewDeck={(key) => goStudy(selectedLang, key, false, true)}
                onBack={() => setScreen("dashboard")} />
            )}

            {/* SCREEN: STUDY EXECUTION HUB */}
            {screen === "study" && (
              <StudyScreen key={`study-${selectedLang}-${selectedDeck}-${isReview}`}
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

            {/* SCREEN: RESULT SUMMARY */}
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
      </div>
    </ErrorBoundary>
  );
}

// ─── SUB-COMPONENTS SECTOR (YOUR CLAUDE WORK FRAMEWORK ENHANCED) ──────────────

function DashboardScreen({ xp, streak, favorites, stats, onSelectLang, onStudyFavs }) {
  const favArray = useMemo(() => Object.values(favorites), [favorites]);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between p-5 space-y-6">
      <div className="space-y-6">
        {/* Editorial Top Status Control */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 pt-1">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm text-neutral-900">
            <Sparkles className="w-4 h-4" />
            <span>linguaflash</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-800">
              <Flame className="w-4 h-4 text-orange-500 fill-current" />
              <span>{streak}d</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold bg-neutral-900 text-white px-2.5 py-1 rounded-md">
              <Zap className="w-3.5 h-3.5 fill-current text-yellow-400" />
              <span>{xp} XP</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Idiomas disponíveis</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Escolha uma trilha para carregar os baralhos de vocabulário.</p>
        </div>

        {/* Multi-Language Route Selectors */}
        <div className="grid grid-cols-1 gap-2.5">
          {Object.entries(LANG_META).map(([code, meta]) => (
            <button key={code} onClick={() => onSelectLang(code)}
              style={{ backgroundColor: meta.bg, borderColor: meta.borderColor }}
              className="w-full text-left p-4 rounded-xl border-2 transition-all hover:scale-[1.01] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{meta.flag}</span>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{meta.name}</h3>
                  <p className="text-xs text-neutral-600 mt-0.5">Acessar módulos de conversação</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            </button>
          ))}
        </div>

        {/* Saved Favorites Row */}
        {favArray.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Termos Arquivados</h4>
            <button onClick={() => onStudyFavs(favArray[0].lang, favArray[0].deck)}
              className="w-full p-4 border-2 border-neutral-200 hover:border-neutral-900 rounded-xl text-left bg-white transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-neutral-900 fill-current" />
                <span className="text-xs font-bold text-neutral-900">{favArray.length} palavras marcadas para treino</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DecksScreen({ langCode, stats, favorites, onSelectDeck, onReviewDeck, onBack }) {
  const meta = LANG_META[langCode];

  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="flex-1 flex flex-col p-5 space-y-5">
      <header className="flex items-center gap-3 pt-2">
        <button onClick={onBack} className="p-1.5 border border-neutral-200 rounded-lg hover:bg-neutral-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{meta.flag}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{meta.name}</span>
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mt-0.5">Baralhos de Vocabulário</h2>
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[560px] pr-0.5">
        {DECK_KEYS.map((key) => {
          const deckMeta = DECKS[key];
          const cards = VOCAB[langCode]?.[key] || [];
          if (cards.length === 0) return null;

          const statId = `${langCode}_${key}`;
          const currentStat = stats[statId] || { correct: 0, total: 0, count: 0 };
          const Icon = deckMeta.icon || BookOpen;

          return (
            <div key={key} className="border-2 border-neutral-100 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg border border-neutral-100" style={{ backgroundColor: meta.bg }}>
                    <Icon className="w-4 h-4" style={{ color: meta.accent }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{deckMeta.label}</h4>
                    <p className="text-[11px] text-neutral-500">{cards.length} entradas estruturadas</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => onSelectDeck(key)}
                  className="flex-1 py-2 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg text-center hover:bg-neutral-800 transition-colors">
                  Praticar
                </button>
                {currentStat.count > 0 && (
                  <button onClick={() => onReviewDeck(key)}
                    className="px-3 py-2 border border-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StudyScreen({ langCode, deckKey, favorites, onToggleFav, isReview, onFinish, onXP, onBack }) {
  const meta = LANG_META[langCode];
  const rawCards = useMemo(() => VOCAB[langCode]?.[deckKey] || [], [langCode, deckKey]);
  
  const [sessionCards, setSessionCards] = useState(() => {
    const matched = rawCards.map((c, i) => ({ ...c, nativeId: `${langCode}_${deckKey}_${i}` }));
    return isReview ? shuffle(matched) : matched;
  });

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectList, setIncorrectList] = useState([]);

  const currentCard = sessionCards[idx];

  const handleChoice = (known) => {
    setFlipped(false);
    if (known) {
      setCorrectCount(p => p + 1);
      onXP(10);
    } else {
      setIncorrectList(p => [...p, currentCard]);
    }

    setTimeout(() => {
      if (idx + 1 < sessionCards.length) {
        setIdx(p => p + 1);
      } else {
        // Evaluate cycles correctly
        if (incorrectList.length > 0 || (!known && incorrectList.length === 0)) {
          const rem = [...incorrectList];
          if (!known && !rem.some(c => c.nativeId === currentCard.nativeId)) rem.push(currentCard);
          setSessionCards(rem);
          setIncorrectList([]);
          setIdx(0);
        } else {
          onFinish({ correct: correctCount + (known ? 1 : 0), total: sessionCards.length, deckKey, langCode });
        }
      }
    }, 200);
  };

  if (!currentCard) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col justify-between p-5 space-y-4">
      <div className="flex items-center justify-between gap-4 pt-1">
        <button onClick={onBack} className="text-neutral-500 hover:text-neutral-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ backgroundColor: meta.accent, width: `${(idx / sessionCards.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs font-bold text-neutral-500">{idx + 1}/{sessionCards.length}</span>
      </div>

      {/* Card Arena */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="perspective-1000 w-full aspect-[4/5] max-w-xs" onClick={() => { setFlipped(!flipped); speak(currentCard.target, langCode); }}>
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${flipped ? "rotate-y-180" : ""}`}>
            
            {/* FRONT */}
            <div className="absolute inset-0 w-full h-full border-2 rounded-2xl p-6 flex flex-col justify-between backface-hidden items-center shadow-sm bg-white" style={{ borderColor: meta.borderColor }}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">Português</span>
              <div className="text-2xl font-black text-center text-neutral-900">{currentCard.pt}</div>
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-50 px-3 py-1 rounded-md border border-neutral-100">Toque para ouvir e traduzir</span>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 w-full h-full border-2 bg-white rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 items-center shadow-sm" style={{ borderColor: meta.accent }}>
              <div className="w-full flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                <span>{meta.name}</span>
                <button onClick={(e) => { e.stopPropagation(); onToggleFav(currentCard); }}>
                  <Bookmark className={`w-4 h-4 ${favorites[currentCard.nativeId] ? "fill-current text-neutral-900" : "text-neutral-300"}`} />
                </button>
              </div>

              <div className="text-center space-y-2">
                <div className="text-3xl font-black tracking-tight" style={{ color: meta.accent }}>{currentCard.target}</div>
                {currentCard.phonetic && <div className="text-xs font-mono text-neutral-500 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">{currentCard.phonetic}</div>}
              </div>

              <div className="w-full text-center text-[11px] text-neutral-500 italic max-w-[90%]">{currentCard.tip || "Termo validado do repositório base"}</div>
            </div>

          </div>
        </div>
      </div>

      {/* Control Frame */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button onClick={() => handleChoice(false)} className="py-3.5 border-2 border-neutral-900 text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-50 transition-colors">
          Revisar
        </button>
        <button onClick={() => handleChoice(true)} className="py-3.5 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors">
          Domado
        </button>
      </div>
    </motion.div>
  );
}

function ResultScreen({ result, langCode, deckKey, fromFavorites, onRestart, onHome, onNextDeck, onNextLang }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-6">
      <div className="w-14 h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center shadow-sm">
        <Award className="w-6 h-6 text-yellow-400" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Módulo Finalizado</h2>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto">Suas pontuações estatísticas e bônus de XP foram integrados ao banco de dados.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
        <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Acertos totais</div>
          <div className="text-xl font-black text-neutral-900 mt-1">{result.correct}/{result.total}</div>
        </div>
        <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50">
          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Rendimento</div>
          <div className="text-xl font-black text-neutral-900 mt-1">+{result.correct * 10} XP</div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2 pt-2">
        <button onClick={onRestart} className="w-full py-3 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors">
          Refazer Estudo
        </button>
        <button onClick={onHome} className="w-full py-3 border border-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-50 transition-colors">
          Voltar ao Início
        </button>
      </div>
    </motion.div>
  );
}