export const VOCAB = {
  es: {
    cumprimentos: [
      { pt: "Olá", target: "Hola", phonetic: null },
      { pt: "Bom dia", target: "Buenos días", phonetic: null },
      { pt: "Boa noite", target: "Buenas noches", phonetic: null },
      { pt: "Obrigado/Obrigada", target: "Gracias", phonetic: null },
      { pt: "Por favor", target: "Por favor", phonetic: null }
    ],
    alimentos: [
      { pt: "Pão", target: "Pan", phonetic: null },
      { pt: "Água", target: "Agua", phonetic: null },
      { pt: "Carne", target: "Carne", phonetic: null },
      { pt: "Fruta", target: "Fruta", phonetic: null },
      { pt: "Leite", target: "Leche", phonetic: null }
    ]
  },
  it: {
    cumprimentos: [
      { pt: "Olá", target: "Ciao", phonetic: null },
      { pt: "Bom dia", target: "Buongiorno", phonetic: null },
      { pt: "Boa noite", target: "Buonanotte", phonetic: null },
      { pt: "Obrigado/Obrigada", target: "Grazie", phonetic: null },
      { pt: "Por favor", target: "Per favore", phonetic: null }
    ],
    alimentos: [
      { pt: "Pão", target: "Pane", phonetic: null },
      { pt: "Água", target: "Acqua", phonetic: null },
      { pt: "Carne", target: "Carne", phonetic: null },
      { pt: "Fruta", target: "Frutta", phonetic: null },
      { pt: "Leite", target: "Latte", phonetic: null }
    ]
  },
  de: {
    familia: [
      { pt: "Filho", target: "Sohn", phonetic: null },
      { pt: "Filha", target: "Tochter", phonetic: null },
      { pt: "Irmão", target: "Bruder", phonetic: null },
      { pt: "Irmã", target: "Schwester", phonetic: null },
      { pt: "Avó", target: "Oma", phonetic: null },
      { pt: "Avô", target: "Opa", phonetic: null },
      { pt: "Tio", target: "Onkel", phonetic: null },
      { pt: "Tia", target: "Tante", phonetic: null }
    ],
    corpo: [
      { pt: "Cabeça", target: "Kopf", phonetic: null },
      { pt: "Olho", target: "Auge", phonetic: null },
      { pt: "Nariz", target: "Nase", phonetic: null },
      { pt: "Boca", target: "Mund", phonetic: null },
      { pt: "Ouvido", target: "Ohr", phonetic: null },
      { pt: "Mão", target: "Hand", phonetic: null },
      { pt: "Pé", target: "Fuß", phonetic: null },
      { pt: "Coração", target: "Herz", phonetic: null },
      { pt: "Costas", target: "Rücken", phonetic: null },
      { pt: "Perna", target: "Bein", phonetic: null }
    ],
    casa: [
      { pt: "Casa", target: "Haus", phonetic: null }
    ]
  }
};

export const LANG_META = {
  es: { name: "Espanhol", accent: "#111111" },
  it: { name: "Italiano", accent: "#111111" },
  de: { name: "Alemão", accent: "#0058A3" } // Premium IKEA / Work & Co Deep Blue Accent
};

export const DECKS = {
  cumprimentos: { label: "Cumprimentos" },
  alimentos: { label: "Alimentos" },
  familia: { label: "Família" },
  corpo: { label: "Corpo Humano" },
  casa: { label: "Casa & Objetos" }
};