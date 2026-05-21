import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette,
  Users, Heart, Home, ChevronLeft, Award,
  Smile, Bookmark, Sparkles
} from "lucide-react";

// ─── LINGUISTIC STYLE TOKENS ────────────────────────────────────────────────
const LANG_META = {
  es: { name: "Espanhol", accent: "#E63329", bg: "#FFF1F0", textPrimary: "#111111" },
  it: { name: "Italiano", accent: "#1A7A4A", bg: "#F0FAF4", textPrimary: "#111111" },
  ru: { name: "Russo",    accent: "#1B4FD8", bg: "#EEF3FF", textPrimary: "#111111" },
};

const DECKS = {
  cumprimentos: { label: "Cumprimentos",   icon: MessageCircle },
  alimentos:    { label: "Alimentos",      icon: Utensils      },
  viagem:       { label: "Viagem",         icon: Plane         },
  verbos:       { label: "Verbos",         icon: BookOpen      },
  numeros:      { label: "Números",        icon: Hash          },
  cores:        { label: "Cores",          icon: Palette       },
  familia:      { label: "Família",        icon: Users         },
  corpo:        { label: "Corpo Humano",   icon: Heart         },
  casa:         { label: "Casa & Objetos", icon: Home          },
  adjetivos:    { label: "Adjetivos",      icon: Smile         },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard"); // dashboard, session, favorites, results
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Storage Metrics
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("lf_xp") || "0"));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("lf_streak") || "3"));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("lf_favs") || "{}"));

  // Engine States
  const [deckCards, setDeckCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [incorrectCards, setIncorrectCards] = useState([]);

  useEffect(() => { localStorage.setItem("lf_xp", xp); }, [xp]);
  useEffect(() => { localStorage.setItem("lf_favs", JSON.stringify(favorites)); }, [favorites]);

  const initSession = (langCode, deckKey) => {
    setSelectedLanguage(langCode);
    setSelectedDeck(deckKey);
    const sourceCards = VOCAB[langCode]?.[deckKey] || [];
    if (sourceCards.length === 0) return;
    
    setDeckCards(sourceCards.map((c, idx) => ({ ...c, nativeId: `${langCode}_${deckKey}_${idx}` })));
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore(0);
    setIncorrectCards([]);
    setCurrentScreen("session");
  };

  const handleCardEvaluation = (known) => {
    setIsFlipped(false);
    setTimeout(() => {
      if (known) {
        setScore(prev => prev + 1);
        setXp(prev => prev + 10);
      } else {
        setIncorrectCards(prev => [...prev, deckCards[currentIndex]]);
      }

      if (currentIndex + 1 < deckCards.length) {
        setCurrentIndex(prev => prev + 1);
      } else if (incorrectCards.length > 0 || (!known && incorrectCards.length === 0)) {
        const remaining = [...incorrectCards];
        if (!known) remaining.push(deckCards[currentIndex]);
        setDeckCards(remaining);
        setIncorrectCards([]);
        setCurrentIndex(0);
      } else {
        setCurrentScreen("results");
      }
    }, 240);
  };

  const toggleFavorite = (card) => {
    const key = card.nativeId;
    setFavorites(prev => {
      const updated = { ...prev };
      if (updated[key]) delete updated[key];
      else updated[key] = { ...card, lang: selectedLanguage, deck: selectedDeck };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans antialiased flex flex-col items-center justify-start w-full">
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between relative bg-[#FFFFFF]">
        <AnimatePresence mode="wait">
          
          {/* ─── DASHBOARD SCREEN ─── */}
          {currentScreen === "dashboard" && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-5 space-y-6">
              
              {/* Premium Geometric Header */}
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4 pt-2">
                <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-md">
                  <Sparkles className="w-5 h-5 text-[#111111]" />
                  <span>linguaflash</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-bold">
                    <Flame className="w-4 h-4 text-[#111111] fill-current" />
                    <span>{streak}d</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold bg-[#111111] text-white px-2 py-0.5 rounded-md">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Language Selector Pivot */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F5F5F5] rounded-xl">
                {Object.keys(LANG_META).map(lang => (
                  <button key={lang} onClick={() => setSelectedLanguage(lang)}
                    className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-150 ${selectedLanguage === lang ? "bg-[#111111] text-white shadow-sm" : "text-[#666666] hover:text-[#111111]"}`}>
                    {LANG_META[lang].name}
                  </button>
                ))}
              </div>

              {/* Modern Grid Categorization */}
              <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5" style={{ maxHeight: "calc(100vh - 210px)" }}>
                {Object.entries(DECKS).map(([key, item]) => {
                  const IconComponent = item.icon;
                  return (
                    <button key={key} onClick={() => initSession(selectedLanguage, key)}
                      className="w-full text-left p-4 rounded-xl border-2 border-[#E5E5E5] hover:border-[#111111] transition-all flex items-center justify-between group bg-[#FFFFFF]">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg border border-[#E5E5E5] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-all">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight">{item.label}</h3>
                          <p className="text-xs text-[#666666] mt-0.5">10 entradas base</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#CCCCCC] group-hover:text-[#111111] transition-colors" />
                    </button>
                  );
                })}

                {/* Secondary Favorites Accessor Row */}
                <button onClick={() => setCurrentScreen("favorites")}
                  className="w-full text-left p-4 rounded-xl border-2 border-[#E5E5E5] hover:border-[#111111] transition-all flex items-center justify-between bg-[#FBFBFB] group mt-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg border border-[#E5E5E5] text-[#666666]">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight text-[#111111]">Termos Salvos</h3>
                      <p className="text-xs text-[#666666] mt-0.5">{Object.keys(favorites).length} arquivados</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
                </button>
              </div>

            </motion.div>
          )}

          {/* ─── INTERACTIVE FLASHCARD SESSION ─── */}
          {currentScreen === "session" && deckCards.length > 0 && (
            <motion.div key="session" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between p-5 space-y-6">
              
              {/* Minimal Linear Progress Tracker */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button onClick={() => setCurrentScreen("dashboard")} className="text-[#666666] hover:text-[#111111] transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] transition-all duration-300" style={{ width: `${((currentIndex) / deckCards.length) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-bold text-[#666666]">
                  {currentIndex + 1}/{deckCards.length}
                </span>
              </div>

              {/* Work & Co Styled Geometric Flip Card Core */}
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="perspective-1000 w-full max-w-sm aspect-[4/5]" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? "rotate-y-180" : ""}`}>
                    
                    {/* CARD SIDE: FRONT */}
                    <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] border-2 border-[#111111] rounded-2xl p-6 flex flex-col justify-between backface-hidden items-center shadow-sm">
                      <div className="w-full flex justify-between text-[10px] font-bold tracking-widest text-[#A0A0A0] uppercase">
                        <span>Origem</span>
                        <span>PT-BR</span>
                      </div>
                      <div className="text-2xl font-black text-center text-[#111111] max-w-[90%]">
                        {deckCards[currentIndex]?.pt}
                      </div>
                      <div className="text-[10px] font-bold tracking-wider text-[#666666] uppercase bg-[#F5F5F5] px-3 py-1 rounded-md">
                        Toque para revelar
                      </div>
                    </div>

                    {/* CARD SIDE: BACK */}
                    <div className="absolute inset-0 w-full h-full bg-[#FFFFFF] border-2 border-[#111111] rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 items-center shadow-sm">
                      <div className="w-full flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                        <span style={{ color: LANG_META[selectedLanguage].accent }}>Alvo ({LANG_META[selectedLanguage].name})</span>
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(deckCards[currentIndex]); }}>
                          <Bookmark className={`w-4 h-4 ${favorites[deckCards[currentIndex]?.nativeId] ? "text-[#111111] fill-current" : "text-[#CCCCCC]"}`} />
                        </button>
                      </div>
                      
                      <div className="text-center space-y-3">
                        <div className="text-3xl font-black tracking-wide" style={{ color: LANG_META[selectedLanguage].accent }}>
                          {deckCards[currentIndex]?.target}
                        </div>
                        {deckCards[currentIndex]?.phonetic && (
                          <div className="text-xs font-mono font-medium text-[#666666] bg-[#F5F5F5] px-2.5 py-1 rounded-md inline-block">
                            {deckCards[currentIndex]?.phonetic}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-bold tracking-widest text-[#A0A0A0] uppercase">Verificado</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Dual Flat Control Deck Triggers */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <button onClick={() => handleCardEvaluation(false)} 
                  className="w-full py-3.5 bg-[#FFFFFF] border-2 border-[#111111] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#F5F5F5] active:scale-[0.98] transition-all">
                  Revisar
                </button>
                <button onClick={() => handleCardEvaluation(true)} 
                  className="w-full py-3.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#222222] active:scale-[0.98] transition-all">
                  Domado
                </button>
              </div>

            </motion.div>
          )}

          {/* ─── SUMMARY RESULTS SCREEN ─── */}
          {currentScreen === "results" && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center items-center p-6 text-center space-y-6">
              <div className="w-16 h-16 bg-[#111111] text-white rounded-xl flex items-center justify-center shadow-sm">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Treino Encerrado</h2>
                <p className="text-xs text-[#666666] mt-1.5 max-w-xs mx-auto">As conexões lexicais foram processadas com sucesso em seu banco de dados local.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                <div className="border-2 border-[#111111] p-3.5 rounded-xl bg-[#FFFFFF]">
                  <div className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Desempenho</div>
                  <div className="text-xl font-black mt-0.5">{score}/{deckCards.length}</div>
                </div>
                <div className="border-2 border-[#111111] p-3.5 rounded-xl bg-[#FFFFFF]">
                  <div className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">Rendimento</div>
                  <div className="text-xl font-black text-[#111111] mt-0.5">+{score * 10} XP</div>
                </div>
              </div>

              <button onClick={() => setCurrentScreen("dashboard")} 
                className="w-full max-w-sm py-3.5 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#222222] transition-colors">
                Retornar ao Painel
              </button>
            </motion.div>
          )}

          {/* ─── FAVORITES MANAGEMENT LIST ─── */}
          {currentScreen === "favorites" && (
            <motion.div key="favs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-5 space-y-5">
              <header className="flex justify-between items-center border-b-2 border-[#111111] pb-3 pt-2">
                <div>
                  <h2 className="text-md font-black uppercase tracking-wider">Termos Arquivados</h2>
                  <p className="text-xs text-[#666666]">Revisão de marcações personalizadas.</p>
                </div>
                <button onClick={() => setCurrentScreen("dashboard")} className="text-xs font-bold uppercase tracking-wider border-2 border-[#111111] px-3 py-1 rounded-lg hover:bg-[#F5F5F5]">
                  Fechar
                </button>
              </header>

              {Object.keys(favorites).length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-[#E5E5E5] rounded-xl p-6">
                  <h4 className="font-bold text-sm text-[#111111]">Nenhuma palavra salva</h4>
                  <p className="text-xs text-[#666666] max-w-xs mx-auto mt-1">Acione o marcador de favoritos durante as rodadas ativas de aprendizado.</p>
                </div>
              ) : (
                <div className="flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
                  {Object.entries(favorites).map(([key, item]) => (
                    <div key={key} className="bg-white border-2 border-[#E5E5E5] p-3.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase text-[#666666] tracking-wider bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                          {item.lang.toUpperCase()} · {item.deck}
                        </span>
                        <div className="text-md font-bold text-[#111111] mt-1.5">
                          {item.pt} &rarr; <span style={{ color: LANG_META[item.lang].accent }}>{item.target}</span>
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(item)} className="p-1.5 text-[#CCCCCC] hover:text-[#111111] transition-colors">
                        <X className="w-4 h-4 stroke-[2.5]" />
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

// ─── COMPLETE VOCABULARY INTERNAL DATABASE RECONSTRUCTION ──────────────────
const VOCAB = {
  es: {
    cumprimentos: [
      { pt: "Olá",               target: "Hola",          phonetic: null },
      { pt: "Bom dia",           target: "Buenos días",   phonetic: null },
      { pt: "Boa tarde",         target: "Buenas tardes", phonetic: null },
      { pt: "Boa noite",         target: "Buenas noches", phonetic: null },
      { pt: "Obrigado/Obrigada", target: "Gracias",       phonetic: null },
      { pt: "Por favor",         target: "Por favor",     phonetic: null },
      { pt: "De nada",           target: "De nada",       phonetic: null },
      { pt: "Com licença",       target: "Con permiso",   phonetic: null },
      { pt: "Desculpe",          target: "Lo siento",     phonetic: null },
      { pt: "Tchau",             target: "Adiós",         phonetic: null },
    ],
    alimentos: [
      { pt: "Pão",    target: "Pan",      phonetic: null },
      { pt: "Água",   target: "Agua",     phonetic: null },
      { pt: "Carne",  target: "Carne",    phonetic: null },
      { pt: "Fruta",  target: "Fruta",    phonetic: null },
      { pt: "Leite",  target: "Leche",    phonetic: null },
      { pt: "Ovo",    target: "Huevo",    phonetic: null },
      { pt: "Arroz",  target: "Arroz",    phonetic: null },
      { pt: "Feijão", target: "Frijoles", phonetic: null },
      { pt: "Queijo", target: "Queso",    phonetic: null },
      { pt: "Vinho",  target: "Vino",     phonetic: null },
    ],
    viagem: [
      { pt: "Aeroporto",  target: "Aeropuerto", phonetic: null },
      { pt: "Hotel",      target: "Hotel",      phonetic: null },
      { pt: "Bilhete",    target: "Boleto",     phonetic: null },
      { pt: "Passaporte", target: "Pasaporte",  phonetic: null },
      { pt: "Mala",       target: "Maleta",     phonetic: null },
      { pt: "Trem",       target: "Tren",       phonetic: null },
      { pt: "Ônibus",     target: "Autobús",    phonetic: null },
      { pt: "Táxi",       target: "Taxi",       phonetic: null },
      { pt: "Mapa",       target: "Mapa",       phonetic: null },
      { pt: "Praia",      target: "Playa",      phonetic: null },
    ],
    verbos: [
      { pt: "Ser/Estar", target: "Ser/Estar", phonetic: null },
      { pt: "Ter",       target: "Tener",     phonetic: null },
      { pt: "Ir",        target: "Ir",        phonetic: null },
      { pt: "Querer",    target: "Querer",    phonetic: null },
      { pt: "Poder",     target: "Poder",     phonetic: null },
      { pt: "Fazer",     target: "Hacer",     phonetic: null },
      { pt: "Falar",     target: "Hablar",    phonetic: null },
      { pt: "Comer",     target: "Comer",     phonetic: null },
      { pt: "Beber",     target: "Beber",     phonetic: null },
      { pt: "Dormir",    target: "Dormir",    phonetic: null },
    ],
    numeros: [
      { pt: "Um",     target: "Uno",    phonetic: null },
      { pt: "Dois",   target: "Dos",    phonetic: null },
      { pt: "Três",   target: "Tres",   phonetic: null },
      { pt: "Quatro", target: "Cuatro", phonetic: null },
      { pt: "Cinco",  target: "Cinco",  phonetic: null },
      { pt: "Seis",   target: "Seis",   phonetic: null },
      { pt: "Sete",   target: "Siete",  phonetic: null },
      { pt: "Oito",   target: "Ocho",   phonetic: null },
      { pt: "Nove",   target: "Nueve",  phonetic: null },
      { pt: "Dez",    target: "Diez",   phonetic: null },
    ],
    cores: [
      { pt: "Vermelho", target: "Rojo",     phonetic: null },
      { pt: "Azul",     target: "Azul",     phonetic: null },
      { pt: "Amarelo",  target: "Amarillo", phonetic: null },
      { pt: "Verde",    target: "Verde",    phonetic: null },
      { pt: "Branco",   target: "Blanco",   phonetic: null },
      { pt: "Preto",    target: "Negro",    phonetic: null },
      { pt: "Laranja",  target: "Naranja",  phonetic: null },
      { pt: "Rosa",     target: "Rosa",     phonetic: null },
      { pt: "Roxo",     target: "Morado",   phonetic: null },
      { pt: "Cinza",    target: "Gris",     phonetic: null },
    ],
    familia: [
      { pt: "Mãe",   target: "Madre",   phonetic: null },
      { pt: "Pai",   target: "Padre",   phonetic: null },
      { pt: "Filho", target: "Hijo",    phonetic: null },
      { pt: "Filha", target: "Hija",    phonetic: null },
      { pt: "Irmão", target: "Hermano", phonetic: null },
      { pt: "Irmã",  target: "Hermana", phonetic: null },
      { pt: "Avó",   target: "Abuela",  phonetic: null },
      { pt: "Avô",   target: "Abuelo",  phonetic: null },
      { pt: "Tio",   target: "Tío",     phonetic: null },
      { pt: "Tia",   target: "Tía",     phonetic: null },
    ],
    corpo: [
      { pt: "Cabeça",  target: "Cabeza",  phonetic: null },
      { pt: "Olho",    target: "Ojo",     phonetic: null },
      { pt: "Nariz",   target: "Nariz",   phonetic: null },
      { pt: "Boca",    target: "Boca",    phonetic: null },
      { pt: "Ouvido",  target: "Oído",    phonetic: null },
      { pt: "Mão",     target: "Mano",    phonetic: null },
      { pt: "Pé",      target: "Pie",     phonetic: null },
      { pt: "Coração", target: "Corazón", phonetic: null },
      { pt: "Costas",  target: "Espalda", phonetic: null },
      { pt: "Perna",   target: "Pierna",  phonetic: null },
    ],
    casa: [
      { pt: "Casa",     target: "Casa",     phonetic: null },
      { pt: "Porta",    target: "Puerta",   phonetic: null },
      { pt: "Janela",   target: "Ventana",  phonetic: null },
      { pt: "Mesa",     target: "Mesa",     phonetic: null },
      { pt: "Cadeira",  target: "Silla",    phonetic: null },
      { pt: "Cama",     target: "Cama",     phonetic: null },
      { pt: "Cozinha",  target: "Cocina",   phonetic: null },
      { pt: "Banheiro", target: "Baño",     phonetic: null },
      { pt: "Livro",    target: "Libro",    phonetic: null },
      { pt: "Telefone", target: "Teléfono", phonetic: null },
    ],
    adjetivos: [
      { pt: "Grande",  target: "Grande",   phonetic: null },
      { pt: "Pequeno", target: "Pequeño",  phonetic: null },
      { pt: "Bonito",  target: "Bonito",   phonetic: null },
      { pt: "Feio",    target: "Feo",      phonetic: null },
      { pt: "Rápido",  target: "Rápido",   phonetic: null },
      { pt: "Lento",   target: "Lento",    phonetic: null },
      { pt: "Quente",  target: "Caliente", phonetic: null },
      { pt: "Frio",    target: "Frío",     phonetic: null },
      { pt: "Feliz",   target: "Feliz",    phonetic: null },
      { pt: "Triste",  target: "Triste",   phonetic: null },
    ],
  },
  it: {
    cumprimentos: [
      { pt: "Olá",               target: "Ciao",            phonetic: null },
      { pt: "Bom dia",           target: "Buongiorno",      phonetic: null },
      { pt: "Boa tarde",         target: "Buon pomeriggio", phonetic: null },
      { pt: "Boa noite",         target: "Buonanotte",      phonetic: null },
      { pt: "Obrigado/Obrigada", target: "Grazie",          phonetic: null },
      { pt: "Por favor",         target: "Per favore",      phonetic: null },
      { pt: "De nada",           target: "Prego",           phonetic: null },
      { pt: "Com licença",       target: "Permesso",        phonetic: null },
      { pt: "Desculpe",          target: "Mi dispiace",     phonetic: null },
      { pt: "Tchau",             target: "Arrivederci",     phonetic: null },
    ],
    alimentos: [
      { pt: "Pão",    target: "Pane",      phonetic: null },
      { pt: "Água",   target: "Acqua",     phonetic: null },
      { pt: "Carne",  target: "Carne",     phonetic: null },
      { pt: "Fruta",  target: "Frutta",    phonetic: null },
      { pt: "Leite",  target: "Latte",     phonetic: null },
      { pt: "Ovo",    target: "Uovo",      phonetic: null },
      { pt: "Arroz",  target: "Riso",      phonetic: null },
      { pt: "Feijão", target: "Fagioli",   phonetic: null },
      { pt: "Queijo", target: "Formaggio", phonetic: null },
      { pt: "Vinho",  target: "Vino",      phonetic: null },
    ],
    viagem: [
      { pt: "Aeroporto",  target: "Aeroporto",  phonetic: null },
      { pt: "Hotel",      target: "Hotel",      phonetic: null },
      { pt: "Bilhete",    target: "Biglietto",  phonetic: null },
      { pt: "Passaporte", target: "Passaporto", phonetic: null },
      { pt: "Mala",       target: "Valigia",    phonetic: null },
      { pt: "Trem",       target: "Treno",      phonetic: null },
      { pt: "Ônibus",     target: "Autobus",    phonetic: null },
      { pt: "Táxi",       target: "Taxi",       phonetic: null },
      { pt: "Mapa",       target: "Mappa",      phonetic: null },
      { pt: "Praia",      target: "Spiaggia",   phonetic: null },
    ],
    verbos: [
      { pt: "Ser/Estar", target: "Essere/Stare", phonetic: null },
      { pt: "Ter",       target: "Avere",        phonetic: null },
      { pt: "Ir",        target: "Andare",       phonetic: null },
      { pt: "Querer",    target: "Volere",       phonetic: null },
      { pt: "Poder",     target: "Potere",       phonetic: null },
      { pt: "Fazer",     target: "Fare",         phonetic: null },
      { pt: "Falar",     target: "Parlare",      phonetic: null },
      { pt: "Comer",     target: "Mangiare",     phonetic: null },
      { pt: "Beber",     target: "Bere",         phonetic: null },
      { pt: "Dormir",    target: "Dormire",      phonetic: null },
    ],
    numeros: [
      { pt: "Um",     target: "Uno",     phonetic: null },
      { pt: "Dois",   target: "Due",     phonetic: null },
      { pt: "Três",   target: "Tre",     phonetic: null },
      { pt: "Quatro", target: "Quattro", phonetic: null },
      { pt: "Cinco",  target: "Cinque",  phonetic: null },
      { pt: "Seis",   target: "Sei",     phonetic: null },
      { pt: "Sete",   target: "Sette",   phonetic: null },
      { pt: "Oito",   target: "Otto",    phonetic: null },
      { pt: "Nove",   target: "Nove",    phonetic: null },
      { pt: "Dez",    target: "Dieci",   phonetic: null },
    ],
    cores: [
      { pt: "Vermelho", target: "Rosso",     phonetic: null },
      { pt: "Azul",     target: "Blu",       phonetic: null },
      { pt: "Amarelo",  target: "Giallo",    phonetic: null },
      { pt: "Verde",    target: "Verde",     phonetic: null },
      { pt: "Branco",   target: "Bianco",    phonetic: null },
      { pt: "Preto",    target: "Nero",      phonetic: null },
      { pt: "Laranja",  target: "Arancione", phonetic: null },
      { pt: "Rosa",     target: "Rosa",      phonetic: null },
      { pt: "Roxo",     target: "Viola",     phonetic: null },
      { pt: "Cinza",    target: "Grigio",    phonetic: null },
    ],
    familia: [
      { pt: "Mãe",   target: "Madre",    phonetic: null },
      { pt: "Pai",   target: "Padre",    phonetic: null },
      { pt: "Filho", target: "Figlio",   phonetic: null },
      { pt: "Filha", target: "Figlia",   phonetic: null },
      { pt: "Irmão", target: "Fratello", phonetic: null },
      { pt: "Irmã",  target: "Sorella",  phonetic: null },
      { pt: "Avó",   target: "Nonna",    phonetic: null },
      { pt: "Avô",   target: "Nonno",    phonetic: null },
      { pt: "Tio",   target: "Zio",      phonetic: null },
      { pt: "Tia",   target: "Zia",      phonetic: null },
    ],
    corpo: [
      { pt: "Cabeça",  target: "Testa",    phonetic: null },
      { pt: "Olho",    target: "Occhio",   phonetic: null },
      { pt: "Nariz",   target: "Naso",     phonetic: null },
      { pt: "Boca",    target: "Bocca",    phonetic: null },
      { pt: "Ouvido",  target: "Orecchio", phonetic: null },
      { pt: "Mão",     target: "Mano",     phonetic: null },
      { pt: "Pé",      target: "Piede",    phonetic: null },
      { pt: "Coração", target: "Cuore",    phonetic: null },
      { pt: "Costas",  target: "Schiena",  phonetic: null },
      { pt: "Perna",   target: "Gamba",    phonetic: null },
    ],
    casa: [
      { pt: "Casa",     target: "Casa",     phonetic: null },
      { pt: "Porta",    target: "Porta",    phonetic: null },
      { pt: "Janela",   target: "Finestra", phonetic: null },
      { pt: "Mesa",     target: "Tavolo",   phonetic: null },
      { pt: "Cadeira",  target: "Sedia",    phonetic: null },
      { pt: "Cama",     target: "Letto",    phonetic: null },
      { pt: "Cozinha",  target: "Cucina",   phonetic: null },
      { pt: "Banheiro", target: "Bagno",    phonetic: null },
      { pt: "Livro",    target: "Libro",    phonetic: null },
      { pt: "Telefone", target: "Telefono", phonetic: null },
    ],
    adjetivos: [
      { pt: "Grande",  target: "Grande",  phonetic: null },
      { pt: "Pequeno", target: "Piccolo", phonetic: null },
      { pt: "Bonito",  target: "Bello",   phonetic: null },
      { pt: "Feio",    target: "Brutto",  phonetic: null },
      { pt: "Rápido",  target: "Veloce",  phonetic: null },
      { pt: "Lento",   target: "Lento",   phonetic: null },
      { pt: "Quente",  target: "Caldo",   phonetic: null },
      { pt: "Frio",    target: "Freddo",  phonetic: null },
      { pt: "Feliz",   target: "Felice",  phonetic: null },
      { pt: "Triste",  target: "Triste",  phonetic: null },
    ],
  },
  ru: {
    cumprimentos: [
      { pt: "Olá",               target: "Привет",         phonetic: "[Privet]"          },
      { pt: "Bom dia",           target: "Доброе утро",    phonetic: "[Dobroye utro]"    },
      { pt: "Boa tarde",         target: "Добрый день",    phonetic: "[Dobry den']"      },
      { pt: "Boa noite",         target: "Спокойной ночи", phonetic: "[Spokóynoy nochi]" },
      { pt: "Obrigado/Obrigada", target: "Спасибо",        phonetic: "[Spasíbo]"         },
      { pt: "Por favor",         target: "Пожалуйста",     phonetic: "[Pojáluista]"      },
      { pt: "De nada",           target: "Не за что",      phonetic: "[Nye za chto]"     },
      { pt: "Com licença",       target: "Извините",       phonetic: "[Izvinyíte]"       },
      { pt: "Desculpe",          target: "Простите",       phonetic: "[Prostíte]"        },
      { pt: "Tchau",             target: "До свидания",    phonetic: "[Do svidánya]"     },
    ],
    alimentos: [
      { pt: "Pão",    target: "Хлеб",   phonetic: "[Khleb]"   },
      { pt: "Água",   target: "Вода",   phonetic: "[Vadá]"    },
      { pt: "Carne",  target: "Мясо",   phonetic: "[Myáso]"   },
      { pt: "Fruta",  target: "Фрукт",  phonetic: "[Frukt]"   },
      { pt: "Leite",  target: "Молоко", phonetic: "[Malakó]"  },
      { pt: "Ovo",    target: "Яйцо",   phonetic: "[Yaitsó]"  },
      { pt: "Arroz",  target: "Рис",    phonetic: "[Ris]"     },
      { pt: "Feijão", target: "Фасоль", phonetic: "[Fasol']"  },
      { pt: "Queijo", target: "Сыр",    phonetic: "[Sir]"     },
      { pt: "Vinho",  target: "Вино",   phonetic: "[Vinó]"    },
    ],
    viagem: [
      { pt: "Aeroporto",  target: "Аэропорт", phonetic: "[Aeropórt]" },
      { pt: "Hotel",      target: "Отель",    phonetic: "[Otel']"    },
      { pt: "Bilhete",    target: "Билет",    phonetic: "[Bilét]"    },
      { pt: "Passaporte", target: "Паспорт",  phonetic: "[Páspurt]"  },
      { pt: "Mala",       target: "Чемоdan",  phonetic: "[Chemodán]" },
      { pt: "Trem",       target: "Поезд",    phonetic: "[Póyezd]"   },
      { pt: "Ônibus",     target: "Автобус",  phonetic: "[Avtóbus]"  },
      { pt: "Táxi",       target: "Такси",    phonetic: "[Taksí]"    },
      { pt: "Mapa",       target: "Карта",    phonetic: "[Kárta]"    },
      { pt: "Praia",      target: "Пляж",     phonetic: "[Plyaj]"    },
    ],
    verbos: [
      { pt: "Ser/Estar", target: "Быть",     phonetic: "[Bit']"     },
      { pt: "Ter",       target: "Иметь",    phonetic: "[Imét']"    },
      { pt: "Ir",        target: "Идти",     phonetic: "[Idtí]"     },
      { pt: "Querer",    target: "Хотеть",   phonetic: "[Khotét']"  },
      { pt: "Poder",     target: "Мочь",     phonetic: "[Moch']"    },
      { pt: "Fazer",     target: "Делать",   phonetic: "[Délat']"   },
      { pt: "Falar",     target: "Говорить", phonetic: "[Gavarít']" },
      { pt: "Comer",     target: "Есть",     phonetic: "[Yest']"    },
      { pt: "Beber",     target: "Пить",     phonetic: "[Pit']"     },
      { pt: "Dormir",    target: "Спать",    phonetic: "[Spat']"    },
    ],
    numeros: [
      { pt: "Um",     target: "Один",   phonetic: "[Adín]"     },
      { pt: "Dois",   target: "Два",    phonetic: "[Dva]"      },
      { pt: "Três",   target: "Три",    phonetic: "[Tri]"      },
      { pt: "Quatro", target: "Четыре", phonetic: "[Chetíre]"  },
      { pt: "Cinco",  target: "Пять",   phonetic: "[Pyat']"    },
      { pt: "Seis",   target: "Шесть",  phonetic: "[Shest']"   },
      { pt: "Sete",   target: "Семь",   phonetic: "[Sem']"     },
      { pt: "Oito",   target: "Восемь", phonetic: "[Vósem']"   },
      { pt: "Nove",   target: "Девять", phonetic: "[Dyévyat']" },
      { pt: "Dez",    target: "Десять", phonetic: "[Dyésat']"  },
    ],
    cores: [
      { pt: "Vermelho", target: "Красный",    phonetic: "[Krásniy]"     },
      { pt: "Azul",     target: "Синий",      phonetic: "[Síniy]"       },
      { pt: "Amarelo",  target: "Жёлтый",     phonetic: "[Jóltiy]"      },
      { pt: "Verde",    target: "Зелёный",    phonetic: "[Zelóniy]"     },
      { pt: "Branco",   target: "Белый",      phonetic: "[Béliy]"       },
      { pt: "Preto",    target: "Чёрный",     phonetic: "[Chórniy]"     },
      { pt: "Laranja",  target: "Оранжевый",  phonetic: "[Aránjiviy]"   },
      { pt: "Rosa",     target: "Розовый",    phonetic: "[Rózoviy]"     },
      { pt: "Roxo",     target: "Фиолетовый", phonetic: "[Fialyétoviy]" },
      { pt: "Cinza",    target: "Серый",      phonetic: "[Sériy]"       },
    ],
    familia: [
      { pt: "Mãe",   target: "Мама",    phonetic: "[Máma]"      },
      { pt: "Pai",   target: "Папа",    phonetic: "[Pápa]"      },
      { pt: "Filho", target: "Сын",     phonetic: "[Sin]"       },
      { pt: "Filha", target: "Дочь",    phonetic: "[Doch']"     },
      { pt: "Irmão", target: "Брат",    phonetic: "[Brat]"      },
      { pt: "Irmã",  target: "Сестра",  phonetic: "[Sistrá]"    },
      { pt: "Avó",   target: "Бабушка", phonetic: "[Bábushka]"  },
      { pt: "Avô",   target: "Дедушка", phonetic: "[Dyédushka]" },
      { pt: "Tio",   target: "Дядя",    phonetic: "[Dyádya]"    },
      { pt: "Tia",   target: "Тётя",    phonetic: "[Tyótya]"    },
    ],
    corpo: [
      { pt: "Cabeça",  target: "Голова", phonetic: "[Galavá]"  },
      { pt: "Olho",    target: "Глаз",   phonetic: "[Glas]"    },
      { pt: "Nariz",   target: "Нос",    phonetic: "[Nos]"     },
      { pt: "Boca",    target: "Рот",    phonetic: "[Rot]"     },
      { pt: "Ouvido",  target: "Ухо",    phonetic: "[Úkho]"    },
      { pt: "Mão",     target: "Рука",   phonetic: "[Ruká]"    },
      { pt: "Pé",      target: "Нога",   phonetic: "[Nagá]"    },
      { pt: "Coração", target: "Сердце", phonetic: "[Syértse]" },
      { pt: "Costas",  target: "Спина",  phonetic: "[Spiná]"   },
      { pt: "Perna",   target: "Нога",   phonetic: "[Nagá]"    },
    ],
    casa: [
      { pt: "Casa",     target: "Дом",     phonetic: "[Dom]"     },
      { pt: "Porta",    target: "Дверь",   phonetic: "[Dver']"   },
      { pt: "Janela",   target: "Окно",    phonetic: "[Akno]"    },
      { pt: "Mesa",     target: "Стол",    phonetic: "[Stol]"    },
      { pt: "Cadeira",  target: "Стул",    phonetic: "[Stul]"    },
      { pt: "Cama",     target: "Кровать", phonetic: "[Krovat']" },
      { pt: "Cozinha",  target: "Кухня",   phonetic: "[Kúkhnya]" },
      { pt: "Banheiro", target: "Ванная",  phonetic: "[Vánnaya]" },
      { pt: "Livro",    target: "Книга",   phonetic: "[Kníga]"   },
      { pt: "Telefone", target: "Телефон", phonetic: "[Telefón]" },
    ],
    adjetivos: [
      { pt: "Grande",  target: "Большой",    phonetic: "[Bal'shóy]"   },
      { pt: "Pequeno", target: "Маленький",  phonetic: "[Málen'kiy]"  },
      { pt: "Bonito",  target: "Красивый",   phonetic: "[Krasíviy]"   },
      { pt: "Feio",    target: "Некрасивый", phonetic: "[Nekrasíviy]" },
      { pt: "Rápido",  target: "Быстрый",    phonetic: "[Bístriy]"    },
      { pt: "Lento",   target: "Медленный",  phonetic: "[Myédlenniy]" },
      { pt: "Quente",  target: "Горячий",    phonetic: "[Garyáchiy]"  },
      { pt: "Frio",    target: "Холодный",   phonetic: "[Khalódniy]"  },
      { pt: "Feliz",   target: "Счастливый", phonetic: "[Shastlíviy]" },
      { pt: "Triste",  target: "Грустный",   phonetic: "[Grústniy]"   },
    ],
  },
};