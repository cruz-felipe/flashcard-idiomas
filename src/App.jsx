import { useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Flame, Zap, Check, X, ChevronRight, RotateCcw,
  BookOpen, Utensils, Plane, MessageCircle, Hash, Palette,
  Users, Heart, Home, ChevronLeft, Target, ArrowRight,
  Smile, Bookmark, BookMarked
} from "lucide-react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────

const LANG_META = {
  es: { name: "Espanhol", accent: "#E63329", bg: "#FFF1F0", textPrimary: "#1A0A09", textSecondary: "#7A3530", borderColor: "#F4A9A6" },
  it: { name: "Italiano", accent: "#1A7A4A", bg: "#F0FAF4", textPrimary: "#071A0E", textSecondary: "#2D6647", borderColor: "#90CFA9" },
  ru: { name: "Russo",    accent: "#1B4FD8", bg: "#EEF3FF", textPrimary: "#060D2A", textSecondary: "#2D4799", borderColor: "#93ACEE" },
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
const DECK_KEYS = Object.keys(DECKS);

// ─── VOCAB ────────────────────────────────────────────────────────────────────

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
      { pt: "Mala",       target: "Чемодан",  phonetic: "[Chemodán]" },
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

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function getStorage(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } }
function setStorage(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Particle({ color }) {
  const angle = Math.random() * 360, dist = 100 + Math.random() * 140;
  const x = Math.cos((angle * Math.PI) / 180) * dist, y = Math.sin((angle * Math.PI) / 180) * dist;
  const size = 5 + Math.random() * 7;
  return (
    <motion.div className="absolute pointer-events-none" style={{ width: size, height: size, backgroundColor: color, borderRadius: 2, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: 360 }}
      transition={{ duration: 0.9 + Math.random() * 0.4, ease: "easeOut" }} />
  );
}
function Confetti({ active }) {
  const colors = ["#E63329","#1B4FD8","#1A7A4A","#F5A623","#9B59B6"];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 48 }).map((_, i) => <Particle key={i} color={colors[i % colors.length]} />)}
    </div>
  );
}

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
// bg/text colors passed in so it adapts to each screen's background
function NavBar({ title, left, right, bgColor = "#ffffff", textColor = "#111111", borderColor = "#e5e5e5" }) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md" style={{ backgroundColor: bgColor + "E8", borderBottom: `2px solid ${borderColor}` }}>
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

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ xp, streak, favorites, onSelectLang, onOpenFavorites }) {
  const favCount = Object.keys(favorites).length;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
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
        <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight mb-8">Qual idioma<br />hoje?</h1>

        {/* XP bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-semibold">Progresso geral</span><span>{xp} XP</span>
          </div>
          <div className="h-1.5 bg-gray-100 overflow-hidden" style={{ borderRadius: 2 }}>
            <motion.div className="h-full bg-gray-900" style={{ borderRadius: 2 }}
              initial={{ width: 0 }} animate={{ width: `${Math.min((xp % 100), 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>

        {/* Language rows */}
        <div className="space-y-3 mb-6">
          {Object.entries(LANG_META).map(([code, lang], i) => (
            <motion.button key={code} onClick={() => onSelectLang(code)}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50"
              style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
              <div className="shrink-0" style={{ width: 40, height: 40 }}>
                {code === "es" && <MessageCircle size={40} strokeWidth={1.5} style={{ color: lang.accent }} />}
                {code === "it" && <BookOpen size={40} strokeWidth={1.5} style={{ color: lang.accent }} />}
                {code === "ru" && <Globe40 color={lang.accent} />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{lang.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{DECK_KEYS.length} categorias · {Object.values(VOCAB[code]).reduce((a, b) => a + b.length, 0)} palavras</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </motion.button>
          ))}
        </div>

        {/* Favorites access from home */}
        <motion.button onClick={onOpenFavorites}
          whileTap={{ scale: 0.97 }} whileHover={{ x: 3 }}
          className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-gray-50"
          style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
          <BookMarked size={40} strokeWidth={1.5} className="text-gray-500 shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-gray-900">Palavras Favoritas</div>
            <div className="text-xs text-gray-400 mt-0.5">{favCount} {favCount === 1 ? "palavra salva" : "palavras salvas"}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// small inline svg globe for Russian (avoids importing Globe which is ambiguous)
function Globe40({ color }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

// ─── FAVORITES SCREEN (language picker) ──────────────────────────────────────
function FavoritesScreen({ favorites, onStudyFavs, onBack }) {
  const favByLang = Object.entries(LANG_META).map(([code, lang]) => {
    const count = Object.keys(favorites).filter(k => k.startsWith(code + ":")).length;
    return { code, lang, count };
  }).filter(x => x.count > 0);

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <NavBar title="Palavras Favoritas"
        left={
          <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors text-sm font-semibold">
            <ChevronLeft className="w-4 h-4" /> Início
          </button>
        }
      />
      <div className="max-w-md mx-auto px-4 pt-8 pb-16">
        {favByLang.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center">
            <BookMarked size={40} strokeWidth={1.5} className="text-gray-200" />
            <p className="font-bold text-gray-400">Nenhuma palavra favorita ainda.</p>
            <p className="text-sm text-gray-400">Salve palavras tocando no ícone 🔖 durante os estudos.</p>
            <PillButton onClick={onBack} style={{ backgroundColor: "#111111", color: "#fff", border: "2px solid #111111" }}>Voltar</PillButton>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">Escolha o idioma para revisar</p>
            <div className="space-y-3">
              {favByLang.map(({ code, lang, count }) => (
                <motion.button key={code} onClick={() => onStudyFavs(code)}
                  whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  style={{ border: "2px solid #E5E7EB", borderRadius: 2, backgroundColor: "#FAFAFA" }}>
                  <BookMarked size={40} strokeWidth={1.5} style={{ color: lang.accent }} className="shrink-0" />
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
function DeckSelector({ langCode, onSelectDeck, onBack, xp, streak }) {
  const lang = LANG_META[langCode];
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen" style={{ backgroundColor: lang.bg }}>
      <NavBar title={lang.name}
        bgColor={lang.bg} textColor={lang.textPrimary} borderColor={lang.borderColor}
        left={
          <button onClick={onBack} className="flex items-center gap-1 transition-colors text-sm font-semibold" style={{ color: lang.textSecondary }}>
            <ChevronLeft className="w-4 h-4" /> Início
          </button>
        }
        right={
          <div className="flex items-center gap-1 px-2 py-1" style={{ border: `2px solid ${lang.borderColor}`, borderRadius: 999 }}>
            <Flame size={14} style={{ color: lang.accent }} />
            <span className="font-bold text-xs" style={{ color: lang.accent }}>{streak}</span>
          </div>
        }
      />
      <div className="max-w-md mx-auto px-4 pt-6 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight" style={{ color: lang.textPrimary }}>{lang.name}</h2>
          <p className="text-sm mt-1" style={{ color: lang.textSecondary }}>Escolha uma categoria</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {DECK_KEYS.map((key, i) => {
            const deck = DECKS[key];
            const Icon = deck.icon;
            return (
              <motion.button key={key} onClick={() => onSelectDeck(key)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-start gap-3 p-4 text-left transition-colors"
                style={{ border: `2px solid ${lang.borderColor}`, borderRadius: 2, backgroundColor: "#ffffff30" }}
              >
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
function FlashCard({ card, isFlipped, onClick, lang, isFav, onToggleFav }) {
  return (
    <div className="w-full" style={{ perspective: 1400 }}>
      <motion.div key={card.pt + card.target}
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d", minHeight: 220 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
        onClick={onClick}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", backgroundColor: "#ffffff", border: "2px solid #E5E7EB", borderRadius: 2 }}>
          <p className="text-xs font-semibold tracking-widest text-gray-300 uppercase mb-6">Português</p>
          <p className="text-4xl font-black text-gray-900 text-center leading-tight">{card.pt}</p>
          <p className="mt-8 text-xs text-gray-300 flex items-center gap-1.5">
            <RotateCcw className="w-3 h-3" /> toque para revelar
          </p>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)",
            backgroundColor: lang.bg, border: `2px solid ${lang.borderColor}`, borderRadius: 2 }}>
          <button onClick={e => { e.stopPropagation(); onToggleFav(card); }}
            className="absolute top-4 right-4 p-2 transition-colors hover:opacity-70">
            {isFav
              ? <BookMarked size={20} style={{ color: lang.accent }} />
              : <Bookmark size={20} style={{ color: lang.borderColor }} />}
          </button>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: lang.textSecondary }}>{lang.name}</p>
          <p className="text-4xl font-black text-center leading-tight" style={{ color: lang.textPrimary }}>{card.target}</p>
          {card.phonetic && <p className="mt-2 text-base font-semibold" style={{ color: lang.textSecondary }}>{card.phonetic}</p>}
          <p className="mt-3 text-sm" style={{ color: lang.textSecondary }}>{card.pt}</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── STUDY SCREEN ─────────────────────────────────────────────────────────────
function StudyScreen({ langCode, deckKey, onFinish, onBack, onXP, favorites, onToggleFav }) {
  const lang          = LANG_META[langCode];
  const isFavDeck     = deckKey === "__favorites__";
  const deckLabel     = isFavDeck ? "Favoritas" : DECKS[deckKey]?.label;
  const DeckIcon      = isFavDeck ? BookMarked : DECKS[deckKey]?.icon;
  const originalCards = isFavDeck
    ? Object.values(VOCAB[langCode]).flat().filter(c => favorites[`${langCode}:${c.pt}`])
    : VOCAB[langCode][deckKey];

  const [queue,        setQueue]        = useState([...originalCards]);
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

  if (!card) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col" style={{ backgroundColor: lang.bg }}>
      <NavBar title="Favoritas" bgColor={lang.bg} textColor={lang.textPrimary} borderColor={lang.borderColor}
        left={<button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold" style={{ color: lang.textSecondary }}><ChevronLeft className="w-4 h-4" /> Voltar</button>} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <BookMarked size={40} strokeWidth={1.5} style={{ color: lang.borderColor }} />
        <p className="font-bold" style={{ color: lang.textSecondary }}>Nenhuma palavra favorita ainda.</p>
        <PillButton onClick={onBack} style={{ backgroundColor: lang.accent, color: "#fff", border: `2px solid ${lang.accent}` }}>Voltar</PillButton>
      </div>
    </motion.div>
  );

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
        const xpGained = Math.round(newCorrect / total * 50) + 10;
        onXP(xpGained);
        setShowConfetti(true);
        setTimeout(() => onFinish({ correct: newCorrect, total, xpGained }), 800);
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

  const favKey = `${langCode}:${card.pt}`;
  const isFav  = !!favorites[favKey];

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: lang.bg }}>
      <Confetti active={showConfetti} />
      <NavBar title={deckLabel}
        bgColor={lang.bg} textColor={lang.textPrimary} borderColor={lang.borderColor}
        left={
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: lang.textSecondary }}>
            <X className="w-4 h-4" /> Sair
          </button>
        }
        right={<span className="text-sm font-semibold" style={{ color: lang.textSecondary }}>{queue.length} restantes</span>}
      />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-10 flex flex-col">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-1.5 overflow-hidden" style={{ backgroundColor: lang.borderColor, borderRadius: 2 }}>
            <motion.div className="h-full" style={{ backgroundColor: lang.accent, borderRadius: 2 }}
              animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: lang.textSecondary }}>{correct} acertadas</span>
            <span className="text-xs font-semibold" style={{ color: lang.textSecondary }}>{Math.round(progress * 100)}%</span>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="relative mb-6" style={{ minHeight: 220 }}>
            <AnimatePresence>
              {flashColor && (
                <motion.div className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: flashColor === "green" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", borderRadius: 2 }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            <motion.div animate={controls}>
              <FlashCard card={card} isFlipped={isFlipped} onClick={handleFlip} lang={lang} isFav={isFav}
                onToggleFav={(c) => onToggleFav(langCode, c)} />
            </motion.div>
          </div>

          <AnimatePresence>
            {!isFlipped && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center text-xs mb-6" style={{ color: lang.borderColor }}>
                Toque no card para ver a tradução
              </motion.p>
            )}
          </AnimatePresence>

          {/* Action pills — consistent colors regardless of language */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                className="flex gap-3">
                <PillButton onClick={() => handleAnswer(false)} className="flex-1 flex-col gap-1 py-4"
                  style={{ backgroundColor: "#FEF2F2", border: "2px solid #FECACA", color: "#DC2626" }}>
                  <X size={20} strokeWidth={2} />
                  <span className="text-xs font-bold">Ainda Aprendendo</span>
                </PillButton>
                <PillButton onClick={() => handleAnswer(true)} className="flex-1 flex-col gap-1 py-4"
                  style={{ backgroundColor: "#F0FDF4", border: "2px solid #BBF7D0", color: "#16A34A" }}>
                  <Check size={20} strokeWidth={2} />
                  <span className="text-xs font-bold">Eu Conheço!</span>
                </PillButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8 pt-4" style={{ borderTop: `2px solid ${lang.borderColor}` }}>
          {[{ label: "Acertou", val: correct, color: "#16A34A" }, { label: "Errou", val: incorrect, color: "#DC2626" }, { label: "Total", val: total, color: lang.textSecondary }].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs" style={{ color: lang.textSecondary }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────
function ResultScreen({ result, langCode, deckKey, onRestart, onHome, onNextDeck }) {
  const lang             = LANG_META[langCode];
  const accuracy         = Math.round((result.correct / result.total) * 100);
  const currentDeckIndex = DECK_KEYS.indexOf(deckKey);
  const nextDeckKey      = DECK_KEYS[currentDeckIndex + 1] ?? null;
  const nextDeck         = nextDeckKey ? DECKS[nextDeckKey] : null;

  const msg = accuracy === 100 ? { emoji: "🏆", text: "Perfeito!", sub: "Você acertou todas as palavras!" }
    : accuracy >= 80 ? { emoji: "🎉", text: "Muito bem!", sub: "Quase perfeito, continue assim!" }
    : accuracy >= 60 ? { emoji: "💪", text: "Bom trabalho!", sub: "Continue praticando!" }
    : { emoji: "📚", text: "Continue tentando!", sub: "A prática leva à perfeição." };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col" style={{ backgroundColor: lang.bg }}>
      <NavBar title="Resultado" bgColor={lang.bg} textColor={lang.textPrimary} borderColor={lang.borderColor} />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-16 flex flex-col">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.15 }}
            className="text-7xl mb-4">{msg.emoji}</motion.div>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: lang.textPrimary }}>{msg.text}</h2>
          <p className="text-sm mt-2" style={{ color: lang.textSecondary }}>{msg.sub}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Target, label: "Precisão", value: `${accuracy}%` },
            { icon: Zap,    label: "XP Ganho", value: `+${result.xpGained}` },
            { icon: Check,  label: "Acertos",  value: `${result.correct}/${result.total}` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="p-4 text-center" style={{ border: `2px solid ${lang.borderColor}`, borderRadius: 2, backgroundColor: "#ffffff30" }}>
              <s.icon size={16} style={{ color: lang.textSecondary }} className="mx-auto mb-2" />
              <div className="text-xl font-black" style={{ color: lang.textPrimary }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: lang.textSecondary }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="h-1.5 overflow-hidden" style={{ backgroundColor: lang.borderColor, borderRadius: 2 }}>
            <motion.div className="h-full" style={{ backgroundColor: lang.accent, borderRadius: 2 }}
              initial={{ width: 0 }} animate={{ width: `${accuracy}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.4 }} />
          </div>
        </div>

        {/* CTAs */}
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
          <div className="flex gap-3">
            <PillButton onClick={onHome} className="flex-1 gap-2"
              style={{ backgroundColor: "transparent", border: `2px solid ${lang.borderColor}`, color: lang.textSecondary }}>
              <Home size={16} /> Início
            </PillButton>
            <PillButton onClick={onRestart} className="flex-1 gap-2"
              style={{ backgroundColor: "transparent", border: `2px solid ${lang.borderColor}`, color: lang.textSecondary }}>
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
  const [screen,       setScreen]       = useState("dashboard");
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [result,       setResult]       = useState(null);
  const [xp,           setXP]           = useState(() => getStorage("lf_xp", 0));
  const [favorites,    setFavorites]    = useState(() => getStorage("lf_favorites", {}));
  const [streak,       setStreak]       = useState(() => {
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return (saved.lastDate === today || saved.lastDate === yesterday) ? saved.count : 0;
  });

  const addXP = useCallback((amount) => {
    setXP(prev => { const n = prev + amount; setStorage("lf_xp", n); return n; });
    const today = new Date().toDateString();
    const saved = getStorage("lf_streak", { count: 0, lastDate: null });
    if (saved.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCount  = saved.lastDate === yesterday ? saved.count + 1 : 1;
      setStreak(newCount);
      setStorage("lf_streak", { count: newCount, lastDate: today });
    }
  }, []);

  const handleToggleFav = useCallback((langCode, card) => {
    const key = `${langCode}:${card.pt}`;
    setFavorites(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next[key]) delete next[key];
      setStorage("lf_favorites", next);
      return next;
    });
  }, []);

  const goStudy = (lang, deck) => { setSelectedLang(lang); setSelectedDeck(deck); setScreen("study"); };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Inter', sans-serif; }`}</style>
      <AnimatePresence mode="wait">
        {screen === "dashboard" && (
          <Dashboard key="dashboard" xp={xp} streak={streak} favorites={favorites}
            onSelectLang={(code) => { setSelectedLang(code); setScreen("decks"); }}
            onOpenFavorites={() => setScreen("favorites")} />
        )}
        {screen === "favorites" && (
          <FavoritesScreen key="favorites" favorites={favorites}
            onStudyFavs={(code) => goStudy(code, "__favorites__")}
            onBack={() => setScreen("dashboard")} />
        )}
        {screen === "decks" && (
          <DeckSelector key="decks" langCode={selectedLang} xp={xp} streak={streak}
            onSelectDeck={(key) => goStudy(selectedLang, key)}
            onBack={() => setScreen("dashboard")} />
        )}
        {screen === "study" && (
          <StudyScreen key={`study-${selectedLang}-${selectedDeck}`}
            langCode={selectedLang} deckKey={selectedDeck}
            favorites={favorites} onToggleFav={handleToggleFav}
            onFinish={(res) => { setResult(res); setScreen("result"); }}
            onXP={addXP} onBack={() => setScreen("decks")} />
        )}
        {screen === "result" && result && (
          <ResultScreen key="result" result={result}
            langCode={selectedLang} deckKey={selectedDeck}
            onRestart={() => setScreen("study")}
            onHome={() => setScreen("dashboard")}
            onNextDeck={(nextKey) => goStudy(selectedLang, nextKey)} />
        )}
      </AnimatePresence>
    </div>
  );
}
