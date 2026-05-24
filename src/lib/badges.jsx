import { getLangDeckKeys } from "../data.js";

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
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FEF3C7"} />
      <path d="M18 9 L27 26 L9 26 Z" fill={dim ? "#BDBDBD" : "#F59E0B"} />
      <path d="M18 13 L24.5 24 L11.5 24 Z" fill={dim ? "#D0D0D0" : "#FDE68A"} />
      <circle cx="15.5" cy="21" r="1.5" fill={dim ? "#BDBDBD" : "#DC2626"} />
      <circle cx="20.5" cy="20" r="1.5" fill={dim ? "#BDBDBD" : "#DC2626"} />
      <circle cx="18" cy="23.5" r="1" fill={dim ? "#BDBDBD" : "#16A34A"} />
    </svg>
  ),
  all_es: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#FEE2E2"} />
      <rect x="15.5" y="9" width="5" height="9" rx="2.5" fill={dim ? "#BDBDBD" : "#DC2626"} />
      <path d="M12 17 C12 21.4 14.7 25 18 25 C21.3 25 24 21.4 24 17" stroke={dim ? "#BDBDBD" : "#DC2626"} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="18" y1="25" x2="18" y2="28" stroke={dim ? "#BDBDBD" : "#DC2626"} strokeWidth="2"/>
      <line x1="15" y1="28" x2="21" y2="28" stroke={dim ? "#BDBDBD" : "#DC2626"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  all_ru: ({ dim }) => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" fill={dim ? "#E0E0E0" : "#DBEAFE"} />
      <ellipse cx="18" cy="24" rx="8" ry="3" fill={dim ? "#BDBDBD" : "#1B4FD8"} opacity="0.35"/>
      <rect x="10" y="15" width="16" height="9" rx="2" fill={dim ? "#BDBDBD" : "#1B4FD8"} />
      <ellipse cx="18" cy="15" rx="8" ry="3" fill={dim ? "#D0D0D0" : "#3B82F6"} />
      <line x1="23" y1="11" x2="27" y2="15" stroke={dim ? "#BDBDBD" : "#1E40AF"} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="23" cy="11" r="2" fill={dim ? "#BDBDBD" : "#93C5FD"} />
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
  { id: "all_it",     label: "Mestre Pizzaiolo",    check: (s)      => getLangDeckKeys("it").every(k => s.completedDecks?.[k]?.includes("it")) },
  { id: "all_es",     label: "Julio Iglesias",      check: (s)      => getLangDeckKeys("es").every(k => s.completedDecks?.[k]?.includes("es")) },
  { id: "all_ru",     label: "Pagode Russo",        check: (s)      => getLangDeckKeys("ru").every(k => s.completedDecks?.[k]?.includes("ru")) },
  { id: "sharp",      label: "Afiado",              check: (s)      => (s.totalAttempts || 0) >= 20 && Math.round((s.totalCorrect || 0) / (s.totalAttempts || 1) * 100) >= 90 },
];

export { BadgeIllustrations, BADGES };
