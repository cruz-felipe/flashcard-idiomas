
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Flame, Star, Zap, Check, X, ChevronRight, RotateCcw,
  Globe, Trophy, BookOpen, Utensils, Plane, MessageCircle,
  Home, Volume2, ChevronLeft, Award, Target, TrendingUp
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const LANGUAGES = {
  es: {
    name: "Espanhol",
    flag: "🇪🇸",
    color: "#FF4B4B",
    accent: "#FFD700",
    gradient: "from-red-500 to-yellow-400",
    bg: "bg-red-50",
    border: "border-red-400",
    badge: "bg-red-500",
    text: "text-red-600",
    light: "bg-red-100",
  },
  it: {
    name: "Italiano",
    flag: "🇮🇹",
    color: "#2D8A4E",
    accent: "#E8F5E9",
    gradient: "from-green-600 to-emerald-400",
    bg: "bg-green-50",
    border: "border-green-500",
    badge: "bg-green-600",
    text: "text-green-700",
    light: "bg-green-100",
  },
  ru: {
    name: "Russo",
    flag: "🇷🇺",
    color: "#1565C0",
    accent: "#EF5350",
    gradient: "from-blue-700 to-blue-400",
    bg: "bg-blue-50",
    border: "border-blue-500",
    badge: "bg-blue-600",
    text: "text-blue-700",
    light: "bg-blue-100",
  },
};

const DECKS = {
  cumprimentos: { label: "Cumprimentos", icon: MessageCircle, color: "purple" },
  alimentos: { label: "Alimentos", icon: Utensils, color: "orange" },
  viagem: { label: "Viagem", icon: Plane, color: "sky" },
  verbos: { label: "Verbos Essenciais", icon: BookOpen, color: "teal" },
};

const VOCAB = {
  es: {
    cumprimentos: [
      { pt: "Olá", target: "Hola", phonetic: null },
      { pt: "Bom dia", target: "Buenos días", phonetic: null },
      { pt: "Boa noite", target: "Buenas noches", phonetic: null },
      { pt: "Obrigado / Obrigada", target: "Gracias", phonetic: null },
      { pt: "Por favor", target: "Por favor", phonetic: null },
    ],
    alimentos: [
      { pt: "Pão", target: "Pan", phonetic: null },
      { pt: "Água", target: "Agua", phonetic: null },
      { pt: "Carne", target: "Carne", phonetic: null },
      { pt: "Fruta", target: "Fruta", phonetic: null },
      { pt: "Leite", target: "Leche", phonetic: null },
    ],
    viagem: [
      { pt: "Aeroporto", target: "Aeropuerto", phonetic: null },
      { pt: "Hotel", target: "Hotel", phonetic: null },
      { pt: "Bilhete", target: "Boleto", phonetic: null },
      { pt: "Passaporte", target: "Pasaporte", phonetic: null },
      { pt: "Mala", target: "Maleta", phonetic: null },
    ],
    verbos: [
      { pt: "Ser / Estar", target: "Ser / Estar", phonetic: null },
      { pt: "Ter", target: "Tener", phonetic: null },
      { pt: "Ir", target: "Ir", phonetic: null },
      { pt: "Querer", target: "Querer", phonetic: null },
      { pt: "Poder", target: "Poder", phonetic: null },
    ],
  },
  it: {
    cumprimentos: [
      { pt: "Olá", target: "Ciao", phonetic: null },
      { pt: "Bom dia", target: "Buongiorno", phonetic: null },
      { pt: "Boa noite", target: "Buonanotte", phonetic: null },
      { pt: "Obrigado / Obrigada", target: "Grazie", phonetic: null },
      { pt: "Por favor", target: "Per favore", phonetic: null },
    ],
    alimentos: [
      { pt: "Pão", target: "Pane", phonetic: null },
      { pt: "Água", target: "Acqua", phonetic: null },
      { pt: "Carne", target: "Carne", phonetic: null },
      { pt: "Fruta", target: "Frutta", phonetic: null },
      { pt: "Leite", target: "Latte", phonetic: null },
    ],
    viagem: [
      { pt: "Aeroporto", target: "Aeroporto", phonetic: null },
      { pt: "Hotel", target: "Hotel", phonetic: null },
      { pt: "Bilhete", target: "Biglietto", phonetic: null },
      { pt: "Passaporte", target: "Passaporto", phonetic: null },
      { pt: "Mala", target: "Valigia", phonetic: null },
    ],
    verbos: [
      { pt: "Ser / Estar", target: "Essere / Stare", phonetic: null },
      { pt: "Ter", target: "Avere", phonetic: null },
      { pt: "Ir", target: "Andare", phonetic: null },
      { pt: "Querer", target: "Volere", phonetic: null },
      { pt: "Poder", target: "Potere", phonetic: null },
    ],
  },
  ru: {
    cumprimentos: [
      { pt: "Olá", target: "Привет", phonetic: "[Privet]" },
      { pt: "Bom dia", target: "Доброе утро", phonetic: "[Dobroye utro]" },
      { pt: "Boa noite", target: "Спокойной ночи", phonetic: "[Spokóynoy nochi]" },
      { pt: "Obrigado / Obrigada", target: "Спасибо", phonetic: "[Spasíbo]" },
      { pt: "Por favor", target: "Пожалуйста", phonetic: "[Pojáluista]" },
    ],
    alimentos: [
      { pt: "Pão", target: "Хлеб", phonetic: "[Khleb]" },
      { pt: "Água", target: "Вода", phonetic: "[Vadá]" },
      { pt: "Carne", target: "Мясо", phonetic: "[Myáso]" },
      { pt: "Fruta", target: "Фрукт", phonetic: "[Frukt]" },
      { pt: "Leite", target: "Молоко", phonetic: "[Malakó]" },
    ],
    viagem: [
      { pt: "Aeroporto", target: "Аэропорт", phonetic: "[Aeropórt]" },
      { pt: "Hotel", target: "Отель", phonetic: "[Otel']" },
      { pt: "Bilhete", target: "Билет", phonetic: "[Bilét]" },
      { pt: "Passaporte", target: "Паспорт", phonetic: "[Páspurt]" },
      { pt: "Mala", target: "Чемодан", phonetic: "[Chemodán]" },
    ],
    verbos: [
      { pt: "Ser / Estar", target: "Быть", phonetic: "[Bit']" },
      { pt: "Ter", target: "Иметь", phonetic: "[Imét']" },
      { pt: "Ir", target: "Идти", phonetic: "[Idtí]" },
      { pt: "Querer", target: "Хотеть", phonetic: "[Khotét']" },
      { pt: "Poder", target: "Мочь", phonetic: "[Moch']" },
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function Particle({ color }) {
  const angle = Math.random() * 360;
  const dist = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 6 + Math.random() * 8;
  const shapes = ["rounded-full", "rounded-sm", "rounded-none rotate-45"];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  return (
    <motion.div
      className={`absolute ${shape} pointer-events-none`}
      style={{ width: size, height: size, backgroundColor: color, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
    />
  );
}

function Confetti({ active }) {
  const colors = ["#FF4B4B","#FFD700","#4CAF50","#2196F3","#FF69B4","#00BCD4","#FF9800"];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 40 }).map((_, i) => (
        <Particle key={i} color={colors[i % colors.length]} />
      ))}
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

function Dashboard({ xp, streak, onSelectLang }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-10"
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between py-4 mb-6">
          <div className="flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-2xl px-3 py-2">
            <Flame className="text-orange-500 w-5 h-5" />
            <span className="font-black text-orange-600 text-lg">{streak}</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-800">🌍 LinguaFlash</div>
            <div className="text-xs text-gray-400 font-semibold tracking-widest uppercase">para brasileiros</div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-3 py-2">
            <Zap className="text-yellow-500 w-5 h-5" />
            <span className="font-black text-yellow-600 text-lg">{xp}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 mb-6 text-white text-center shadow-xl shadow-indigo-200">
          <div className="text-5xl mb-2">🎓</div>
          <h1 className="text-2xl font-black mb-1">Qual idioma hoje?</h1>
          <p className="text-indigo-200 text-sm">Escolha seu destino de aprendizado</p>
        </div>

        <div className="space-y-4">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <motion.button
              key={code}
              onClick={() => onSelectLang(code)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full ${lang.bg} border-2 ${lang.border} rounded-3xl p-5 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${lang.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {lang.flag}
              </div>
              <div className="flex-1 text-left">
                <div className={`text-xl font-black ${lang.text}`}>{lang.name}</div>
                <div className="text-gray-500 text-sm">{Object.keys(DECKS).length} categorias · {Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras</div>
              </div>
              <div className={`w-10 h-10 ${lang.badge} rounded-xl flex items-center justify-center`}>
                <ChevronRight className="text-white w-5 h-5" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-600 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> Nível</span>
            <span className="text-sm font-bold text-gray-500">{xp} / {Math.ceil((xp + 1) / 100) * 100} XP</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((xp % 100), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DeckSelector({ langCode, onSelectDeck, onBack, xp, streak }) {
  const lang = LANGUAGES[langCode];
  const deckColors = {
    purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-600", icon: "bg-purple-500" },
    orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-600", icon: "bg-orange-500" },
    sky: { bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-600", icon: "bg-sky-500" },
    teal: { bg: "bg-teal-50", border: "border-teal-300", text: "text-teal-600", icon: "bg-teal-500" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-10"
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between py-4 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-orange-100 border-2 border-orange-300 rounded-2xl px-3 py-2">
              <Flame className="text-orange-500 w-4 h-4" /><span className="font-black text-orange-600">{streak}</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-3 py-2">
              <Zap className="text-yellow-500 w-4 h-4" /><span className="font-black text-yellow-600">{xp}</span>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${lang.gradient} rounded-3xl p-6 mb-6 text-white text-center shadow-xl`}>
          <div className="text-5xl mb-2">{lang.flag}</div>
          <h2 className="text-2xl font-black">{lang.name}</h2>
          <p className="text-white/70 text-sm mt-1">Escolha uma categoria para estudar</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(DECKS).map(([key, deck]) => {
            const dc = deckColors[deck.color];
            const Icon = deck.icon;
            return (
              <motion.button
                key={key}
                onClick={() => onSelectDeck(key)}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className={`${dc.bg} border-2 ${dc.border} rounded-2xl p-5 flex flex-col items-center gap-3 shadow-md`}
              >
                <div className={`w-12 h-12 ${dc.icon} rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
                <span className={`font-black text-sm ${dc.text} text-center leading-tight`}>{deck.label}</span>
                <span className="text-gray-400 text-xs">{VOCAB[langCode][key].length} cards</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function FlashCard({ card, isFlipped, onClick, langCode }) {
  const lang = LANGUAGES[langCode];
  return (
    <div className="w-full" style={{ perspective: 1200 }} onClick={onClick}>
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="w-full bg-white rounded-3xl border-4 border-gray-100 shadow-2xl p-8 flex flex-col items-center justify-center min-h-52"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Português</div>
          <div className="text-4xl font-black text-gray-800 text-center leading-tight">{card.pt}</div>
          <div className="mt-6 text-gray-300 text-sm flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> toque para revelar
          </div>
        </div>
        <div
          className={`absolute inset-0 w-full ${lang.bg} border-4 ${lang.border} rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-52`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${lang.text}`}>{lang.name}</div>
          <div className={`text-4xl font-black text-center leading-tight ${lang.text}`}>{card.target}</div>
          {card.phonetic && (
            <div className="mt-2 text-gray-500 text-lg font-semibold">{card.phonetic}</div>
          )}
          <div className="mt-2 text-gray-400 text-sm">{card.pt}</div>
        </div>
      </motion.div>
    </div>
  );
}

function StudyScreen({ langCode, deckKey, onFinish, onBack, onXP }) {
  const lang = LANGUAGES[langCode];
  const deck = DECKS[deckKey];
  const originalCards = VOCAB[langCode][deckKey];

  const [queue, setQueue] = useState([...originalCards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  const controls = useAnimation();

  const total = originalCards.length;
  const progress = Math.min(correct / total, 1);
  const card = queue[currentIndex];

  const handleFlip = () => { if (!isFlipped) setIsFlipped(true); };

  const handleAnswer = async (knew) => {
    if (!isFlipped || answered) return;
    setAnswered(true);
    setFlashColor(knew ? "green" : "red");

    await controls.start({
      x: knew ? 120 : -120, opacity: 0, rotate: knew ? 8 : -8,
      transition: { duration: 0.3 }
    });

    setFlashColor(null);

    if (knew) {
      setCorrect(c => c + 1);
      const newQueue = queue.filter((_, i) => i !== currentIndex);
      if (newQueue.length === 0) {
        const xpGained = Math.round((correct + 1) / total * 50) + 10;
        onXP(xpGained);
        setShowConfetti(true);
        setTimeout(() => onFinish({ correct: correct + 1, total, xpGained }), 900);
        return;
      }
      const nextIdx = Math.min(currentIndex, newQueue.length - 1);
      setQueue(newQueue);
      setCurrentIndex(nextIdx);
    } else {
      setIncorrect(inc => inc + 1);
      const newQueue = [...queue];
      const removed = newQueue.splice(currentIndex, 1)[0];
      const insertAt = Math.min(currentIndex + 2, newQueue.length);
      newQueue.splice(insertAt, 0, removed);
      setQueue(newQueue);
      setCurrentIndex(Math.min(currentIndex, newQueue.length - 1));
    }

    await controls.start({ x: 0, opacity: 1, rotate: 0, transition: { duration: 0 } });
    setIsFlipped(false);
    setAnswered(false);
  };

  const Icon = deck.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 pb-10"
    >
      <Confetti active={showConfetti} />
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between py-4 mb-4">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
            className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
            <X className="w-5 h-5 text-gray-500" />
          </motion.button>
          <div className={`flex items-center gap-2 ${lang.light} border-2 ${lang.border} rounded-2xl px-3 py-2`}>
            <Icon className={`w-4 h-4 ${lang.text}`} />
            <span className={`font-bold text-sm ${lang.text}`}>{deck.label}</span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold ${lang.text}`}>
            {queue.length} <span className="text-gray-400 font-normal">restantes</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{correct} acertadas</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              className={`h-full bg-gradient-to-r ${lang.gradient} rounded-full`}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="relative mb-8">
          {flashColor && (
            <motion.div
              className={`absolute inset-0 rounded-3xl z-10 pointer-events-none ${flashColor === "green" ? "bg-green-400/30" : "bg-red-400/30"}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            />
          )}
          <motion.div animate={controls}>
            <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip} langCode={langCode} />
          </motion.div>
        </div>

        <AnimatePresence>
          {!isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="text-center text-gray-400 text-sm mb-6"
            >
              👆 Toque no card para ver a tradução
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="flex gap-4"
            >
              <motion.button onClick={() => handleAnswer(false)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                className="flex-1 bg-red-50 border-2 border-b-4 border-red-400 rounded-2xl py-4 flex flex-col items-center gap-2 shadow-md">
                <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center shadow">
                  <X className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-red-500 text-sm">Ainda Aprendendo</span>
              </motion.button>
              <motion.button onClick={() => handleAnswer(true)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                className="flex-1 bg-green-50 border-2 border-b-4 border-green-400 rounded-2xl py-4 flex flex-col items-center gap-2 shadow-md">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow">
                  <Check className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-green-600 text-sm">Eu Conheço!</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center"><div className="text-lg font-black text-green-500">{correct}</div><div className="text-xs text-gray-400">Acertou</div></div>
          <div className="w-px bg-gray-200" />
          <div className="text-center"><div className="text-lg font-black text-red-400">{incorrect}</div><div className="text-xs text-gray-400">Errou</div></div>
          <div className="w-px bg-gray-200" />
          <div className="text-center"><div className="text-lg font-black text-gray-600">{total}</div><div className="text-xs text-gray-400">Total</div></div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultScreen({ result, langCode, deckKey, onRestart, onHome }) {
  const lang = LANGUAGES[langCode];
  const accuracy = Math.round((result.correct / result.total) * 100);

  const getMessage = () => {
    if (accuracy === 100) return { emoji: "🏆", text: "Incrível! Você acertou tudo!", sub: "Você é uma estrela do aprendizado!" };
    if (accuracy >= 80) return { emoji: "🎉", text: "Muito bem! Quase perfeito!", sub: "Continue assim, você está arrasando!" };
    if (accuracy >= 60) return { emoji: "💪", text: "Bom trabalho! Continue praticando!", sub: "Com dedicação, você vai dominar isso!" };
    return { emoji: "📚", text: "Continue tentando! Você consegue!", sub: "A prática leva à perfeição. Tente novamente!" };
  };
  const msg = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 flex items-center"
    >
      <div className="max-w-md mx-auto w-full">
        <div className={`bg-gradient-to-br ${lang.gradient} rounded-3xl p-8 text-white text-center mb-6 shadow-2xl`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            className="text-7xl mb-4">{msg.emoji}</motion.div>
          <h2 className="text-2xl font-black mb-2">{msg.text}</h2>
          <p className="text-white/80 text-sm">{msg.sub}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Target, label: "Precisão", value: `${accuracy}%`, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
            { icon: Zap, label: "XP Ganho", value: `+${result.xpGained}`, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
            { icon: Check, label: "Acertos", value: `${result.correct}/${result.total}`, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className={`${s.bg} border-2 ${s.border} rounded-2xl p-4 text-center`}>
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-600 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Desempenho</span>
            <span className="text-sm font-bold text-gray-500">{accuracy}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className={`h-full bg-gradient-to-r ${lang.gradient} rounded-full`}
              initial={{ width: 0 }} animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }} />
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onHome}
            className="flex-1 bg-white border-2 border-b-4 border-gray-200 rounded-2xl py-4 font-black text-gray-600 flex items-center justify-center gap-2">
            <Home className="w-5 h-5" /> Início
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onRestart}
            className={`flex-1 bg-gradient-to-r ${lang.gradient} border-2 border-b-4 ${lang.border} rounded-2xl py-4 font-black text-white flex items-center justify-center gap-2 shadow-lg`}>
            <RotateCcw className="w-5 h-5" /> Repetir
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [result, setResult] = useState(null);
  const [xp, setXP] = useState(() => getStorage("lf_xp", 0));
  const [streak, setStreak] = useState(() => {
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    if (saved.lastDate === today) return saved.count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (saved.lastDate === yesterday) return saved.count;
    return 0;
  });

  const addXP = useCallback((amount) => {
    setXP(prev => {
      const next = prev + amount;
      setStorage("lf_xp", next);
      return next;
    });
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    if (saved.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount = saved.lastDate === yesterday ? saved.count + 1 : 1;
      setStreak(newCount);
      setStorage("lf_streak", { count: newCount, lastDate: today });
    }
  }, []);

  const handleFinish = (res) => { setResult(res); setScreen("result"); };

  return (
    <div className="font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>
      <AnimatePresence mode="wait">
        {screen === "dashboard" && (
          <Dashboard key="dashboard" xp={xp} streak={streak}
            onSelectLang={(code) => { setSelectedLang(code); setScreen("decks"); }} />
        )}
        {screen === "decks" && (
          <DeckSelector key="decks" langCode={selectedLang} xp={xp} streak={streak}
            onSelectDeck={(key) => { setSelectedDeck(key); setScreen("study"); }}
            onBack={() => setScreen("dashboard")} />
        )}
        {screen === "study" && (
          <StudyScreen key={`study-${selectedLang}-${selectedDeck}`}
            langCode={selectedLang} deckKey={selectedDeck}
            onFinish={handleFinish} onXP={addXP}
            onBack={() => setScreen("decks")} />
        )}
        {screen === "result" && result && (
          <ResultScreen key="result" result={result}
            langCode={selectedLang} deckKey={selectedDeck}
            onRestart={() => setScreen("study")}
            onHome={() => setScreen("dashboard")} />
        )}
      </AnimatePresence>
    </div>
  );
}
