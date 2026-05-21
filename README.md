# 🌍 LinguaFlash

> Aprenda Espanhol, Italiano e Russo com flashcards gamificados — feito para brasileiros.

LinguaFlash is a Duolingo-inspired flashcard web app built for native Brazilian Portuguese speakers to learn vocabulary in Spanish, Italian, and Russian. It features smooth card-flip animations, spaced repetition, XP tracking, daily streaks, and full Cyrillic support with phonetic guides.

---

## ✨ Features

- 🃏 **Interactive Flashcards** — 3D flip animation (Portuguese → target language)
- 🔁 **Spaced Repetition (light)** — incorrect cards are recycled back into the deck
- 🔥 **Daily Streak** — persisted across sessions via LocalStorage
- ⚡ **XP System** — earn points per deck completed, tracked with a level bar
- 🇷🇺 **Cyrillic Support** — Russian cards include the word, phonetic guide, and PT translation
- 🎉 **Confetti Celebration** — particle burst when a deck is fully completed
- 📱 **Mobile-first** — responsive layout optimized for small screens

## 🗂️ Vocabulary Decks

| Category | PT Label | Words |
|---|---|---|
| Greetings | Cumprimentos | 5 per language |
| Food | Alimentos | 5 per language |
| Travel | Viagem | 5 per language |
| Essential Verbs | Verbos Essenciais | 5 per language |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/linguaflash.git
cd linguaflash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Persistence | LocalStorage |
| Font | Nunito (Google Fonts) |

---

## 📁 Project Structure

```
linguaflash/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx       # React entry point
    ├── index.css      # Tailwind directives
    └── App.jsx        # Full application (data + components + screens)
```

---

## 🗺️ Roadmap

- [ ] Audio pronunciation per card
- [ ] More vocabulary decks (Numbers, Colors, Body, etc.)
- [ ] Quiz mode (multiple choice)
- [ ] User accounts + cloud sync
- [ ] More target languages (French, German, Japanese)

---

## 📄 License

MIT — free to use and modify.
