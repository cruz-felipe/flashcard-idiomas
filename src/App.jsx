import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronRight, X, Heart, RotateCcw } from "lucide-react";
import { VOCAB, LANG_META, DECKS } from "./data";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard"); // dashboard, session, results, favorites
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // App Metrics
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("lf_favs") || "{}"));

  // Flashcard Engine States
  const [deckCards, setDeckCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [totalCardsInSession, setTotalCardsInSession] = useState(0);
  const [incorrectCards, setIncorrectCards] = useState([]);

  useEffect(() => {
    localStorage.setItem("lf_favs", JSON.stringify(favorites));
  }, [favorites]);

  const initSession = (langCode, deckKey) => {
    const sourceCards = VOCAB[langCode]?.[deckKey] || [];
    if (sourceCards.length === 0) return;
    
    const formattedCards = sourceCards.map((c, idx) => ({
      ...c,
      nativeId: `${langCode}_${deckKey}_${idx}`
    }));

    setSelectedLanguage(langCode);
    setSelectedDeck(deckKey);
    setDeckCards(formattedCards);
    setTotalCardsInSession(formattedCards.length);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionScore(0);
    setIncorrectCards([]);
    setCurrentScreen("session");
  };

  const handleEvaluation = (known) => {
    setIsFlipped(false);
    
    setTimeout(() => {
      let updatedIncorrect = [...incorrectCards];
      const currentCard = deckCards[currentIndex];

      if (known) {
        setSessionScore(prev => prev + 1);
      } else {
        if (!updatedIncorrect.some(c => c.nativeId === currentCard.nativeId)) {
          updatedIncorrect.push(currentCard);
        }
      }

      if (currentIndex + 1 < deckCards.length) {
        setCurrentIndex(prev => prev + 1);
        setIncorrectCards(updatedIncorrect);
      } else {
        // Round complete. Do we have cards to review?
        if (updatedIncorrect.length > 0) {
          setDeckCards(updatedIncorrect);
          setIncorrectCards([]);
          setCurrentIndex(0);
        } else {
          setCurrentScreen("results");
        }
      }
    }, 200);
  };

  const toggleFavorite = (card, e) => {
    if (e) e.stopPropagation();
    const key = card.nativeId;
    setFavorites(prev => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = { ...card, lang: selectedLanguage, deck: selectedDeck };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans antialiased flex justify-center items-start w-full sm:py-8">
      {/* Phone Viewport Container Sandbox */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[840px] sm:rounded-[32px] sm:shadow-xl bg-white border border-[#E5E5E5] flex flex-col justify-between relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* ─── SCREEN: DASHBOARD ─── */}
          {currentScreen === "dashboard" && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-6 justify-between">
              <div className="space-y-6">
                
                {/* Header (Minimalist Typography Mode) */}
                <div className="flex justify-between items-center pt-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Minha Lista</h1>
                  <button onClick={() => setCurrentScreen("favorites")} className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors relative">
                    <Heart className="w-5 h-5 text-[#111111]" />
                    {Object.keys(favorites).length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-[#0058A3] rounded-full" />
                    )}
                  </button>
                </div>

                {/* Search Bar Accent Component */}
                <div className="relative w-full">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#A0A0A0]" />
                  <input type="text" placeholder="O que você quer aprender?" disabled
                    className="w-full bg-[#F5F5F5] text-sm text-[#111111] pl-11 pr-4 py-3 rounded-xl border border-transparent focus:border-[#111111] outline-none transition-all cursor-not-allowed opacity-80" />
                </div>

                {/* Premium Segmented Segment Switcher */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F5F5] rounded-xl">
                  {Object.keys(LANG_META).map(lang => (
                    <button key={lang} onClick={() => setSelectedLanguage(lang)}
                      className={`py-2.5 text-xs font-semibold rounded-lg transition-all ${selectedLanguage === lang ? "bg-white text-[#111111] shadow-sm" : "text-[#707070] hover:text-[#111111]"}`}>
                      {LANG_META[lang].name}
                    </button>
                  ))}
                </div>

                {/* Dynamic Category List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {Object.entries(DECKS).map(([key, item]) => {
                    const hasCards = VOCAB[selectedLanguage]?.[key]?.length > 0;
                    if (!hasCards) return null;

                    return (
                      <button key={key} onClick={() => initSession(selectedLanguage, key)}
                        className="w-full text-left p-4 rounded-xl border border-[#E5E5E5] hover:border-[#111111] transition-all flex items-center justify-between bg-white group">
                        <div>
                          <h3 className="font-medium text-md text-[#111111]">{item.label}</h3>
                          <p className="text-xs text-[#707070] mt-0.5">{VOCAB[selectedLanguage][key].length} itens disponíveis</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#A0A0A0] group-hover:text-[#111111] transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Visual Brand Footer */}
              <div className="pt-6 border-t border-[#F5F5F5] text-center text-[11px] uppercase tracking-widest text-[#A0A0A0] font-mono">
                linguaflash // core engine v2.0
              </div>
            </motion.div>
          )}

          {/* ─── SCREEN: STUDY SESSION ─── */}
          {currentScreen === "session" && deckCards.length > 0 && (
            <motion.div key="session" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between p-6">
              
              {/* Minimal Top Linear Progress Subsystem */}
              <div className="flex items-center justify-between gap-6 pt-2">
                <button onClick={() => setCurrentScreen("dashboard")} className="p-1 text-[#707070] hover:text-[#111111] transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0058A3] transition-all duration-300" style={{ width: `${(currentIndex / deckCards.length) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-bold text-[#707070]">
                  {currentIndex + 1}/{deckCards.length}
                </span>
              </div>

              {/* High-Contrast Modernist Flashcard Structure */}
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="perspective-1000 w-full max-w-xs h-[360px]" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}>
                    
                    {/* FRONT SIDE (Portuguese Query) */}
                    <div className="absolute inset-0 w-full h-full bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 flex flex-col justify-between backface-hidden items-center shadow-xs">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#A0A0A0]">Sentido Original</span>
                      <div className="text-2xl font-bold text-center text-[#111111] px-4">
                        {deckCards[currentIndex]?.pt}
                      </div>
                      <span className="text-xs text-[#707070] bg-white border border-[#E5E5E5] px-4 py-1.5 rounded-full shadow-2xs">Toque para revelar</span>
                    </div>

                    {/* BACK SIDE (Target Translation) */}
                    <div className="absolute inset-0 w-full h-full bg-white border-2 border-[#111111] rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 items-center shadow-sm">
                      <div className="w-full flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-[#A0A0A0]">
                        <span>Tradução Direta</span>
                        <button onClick={(e) => toggleFavorite(deckCards[currentIndex], e)}>
                          <Heart className={`w-4 h-4 ${favorites[deckCards[currentIndex]?.nativeId] ? "text-[#0058A3] fill-current" : "text-[#A0A0A0]"}`} />
                        </button>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold tracking-tight text-[#0058A3]">
                          {deckCards[currentIndex]?.target}
                        </div>
                        {deckCards[currentIndex]?.phonetic && (
                          <div className="text-xs font-mono text-[#707070] bg-[#F5F5F5] px-2 py-0.5 rounded">
                            {deckCards[currentIndex]?.phonetic}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-mono tracking-wider text-[#A0A0A0] uppercase">Módulo Verificado</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Viewport-Pinned Action Control Deck */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5F5F5]">
                <button onClick={() => handleEvaluation(false)} 
                  className="w-full py-4 bg-white border border-[#111111] text-[#111111] font-medium text-sm rounded-xl hover:bg-[#F5F5F5] active:scale-[0.99] transition-all">
                  Revisar
                </button>
                <button onClick={() => handleEvaluation(true)} 
                  className="w-full py-4 bg-[#0058A3] text-white font-medium text-sm rounded-xl hover:bg-[#004782] active:scale-[0.99] transition-all">
                  Domado
                </button>
              </div>

            </motion.div>
          )}

          {/* ─── SCREEN: EVALUATION RESULTS ─── */}
          {currentScreen === "results" && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-6">
              <div className="w-14 h-14 bg-[#0058A3] text-white rounded-2xl flex items-center justify-center shadow-sm">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#111111]">Sessão Concluída</h2>
                <p className="text-sm text-[#707070] max-w-xs">Seu progresso vocabular foi processado e salvo localmente.</p>
              </div>

              <div className="border border-[#E5E5E5] p-5 rounded-2xl bg-[#F9F9F9] w-full max-w-xs text-center">
                <span className="text-[10px] uppercase font-mono text-[#707070] tracking-widest">Aproveitamento Mínimo</span>
                <div className="text-3xl font-bold text-[#111111] mt-1">{sessionScore} / {totalCardsInSession}</div>
              </div>

              <button onClick={() => setCurrentScreen("dashboard")} 
                className="w-full max-w-xs py-4 bg-[#111111] text-white font-medium text-sm rounded-xl hover:bg-[#222222] transition-colors">
                Voltar ao Painel
              </button>
            </motion.div>
          )}

          {/* ─── SCREEN: FAVORITES REVIEW ARCHIVE ─── */}
          {currentScreen === "favorites" && (
            <motion.div key="favs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 space-y-4">
              <header className="flex justify-between items-center border-b border-[#F5F5F5] pb-4 pt-2">
                <div>
                  <h2 className="text-xl font-bold text-[#111111]">Termos Salvos</h2>
                  <p className="text-xs text-[#707070]">Seu arquivo customizado de revisão.</p>
                </div>
                <button onClick={() => setCurrentScreen("dashboard")} className="text-xs font-semibold border border-[#111111] px-3 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors">
                  Fechar
                </button>
              </header>

              {Object.keys(favorites).length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#E5E5E5] rounded-2xl p-6">
                  <p className="font-medium text-sm text-[#111111]">Nenhum termo salvo</p>
                  <p className="text-xs text-[#707070] mt-1">Marque o coração durante as sessões para arquivar palavras aqui.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[580px]">
                  {Object.entries(favorites).map(([key, item]) => (
                    <div key={key} className="bg-white border border-[#E5E5E5] p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase text-[#707070] bg-[#F5F5F5] px-2 py-0.5 rounded">
                          {item.lang.toUpperCase()} · {item.deck}
                        </span>
                        <div className="text-md font-medium text-[#111111] mt-2">
                          {item.pt} &rarr; <span className="text-[#0058A3] font-bold">{item.target}</span>
                        </div>
                      </div>
                      <button onClick={(e) => toggleFavorite(item, e)} className="p-2 text-[#A0A0A0] hover:text-[#111111] transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}