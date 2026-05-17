import { supabase } from "../config/supabase";

async function seed() {
  console.log("🚀 Starting database seed...");

  const { error: gamesError } = await supabase.from("games").upsert([
    {
      id: "fauna-001",
      slug: "fauna-marinha",
      name: "Fauna Marinha",
      description:
        "Identifique e aprenda sobre as espécies marinhas da costa cearense e dos oceanos brasileiros.",
      icon: "🐠",
      color: "#00D4FF",
      max_score: 1000,
      question_count: 10,
      time_limit: 30,
      category: "fauna",
    },
    {
      id: "flora-001",
      slug: "flora-marinha",
      name: "Flora Marinha",
      description:
        "Explore os ecossistemas de mangue, recifes de coral e pradarias de algas do Ceará.",
      icon: "🌿",
      color: "#10B981",
      max_score: 1000,
      question_count: 10,
      time_limit: 30,
      category: "flora",
    },
    {
      id: "pollution-001",
      slug: "poluicao-oceanica",
      name: "Poluição Oceânica",
      description:
        "Tome decisões e entenda os impactos da poluição nos oceanos de Fortaleza e do Brasil.",
      icon: "🗑️",
      color: "#F59E0B",
      max_score: 1000,
      question_count: 10,
      time_limit: 45,
      category: "pollution",
    },
    {
      id: "ecosystem-001",
      slug: "ecossistema",
      name: "Ecossistema do Manguezal",
      description: "Arraste espécies para as zonas corretas do manguezal cearense.",
      icon: "🌳",
      color: "#10B981",
      max_score: 90,
      question_count: 9,
      time_limit: 0,
      category: "ecosystem",
    },
    {
      id: "pollution-sim-001",
      slug: "simulador-poluicao",
      name: "Simulador de Poluição Visual",
      description: "Tome decisões sustentáveis e veja o impacto visual da poluição no oceano.",
      icon: "🛢️",
      color: "#F59E0B",
      max_score: 100,
      question_count: 5,
      time_limit: 0,
      category: "pollution",
    },
    {
      id: "ocean-cleanup-001",
      slug: "limpeza-oceanica",
      name: "Limpeza Oceânica",
      description: "Remova o lixo antes que chegue ao fundo e proteja os animais marinhos.",
      icon: "🧹",
      color: "#00D4FF",
      max_score: 250,
      question_count: 0,
      time_limit: 0,
      category: "pollution",
    },
    {
      id: "turtle-runner-001",
      slug: "mergulho-tartaruga",
      name: "Mergulho da Tartaruga",
      description: "Nade, desvie do lixo e colete águas-vivas para vencer.",
      icon: "🐢",
      color: "#10B981",
      max_score: 100,
      question_count: 0,
      time_limit: 0,
      category: "fauna",
    },
    {
      id: "coral-defender-001",
      slug: "defensor-corais",
      name: "Defensor dos Corais",
      description: "Posicione defensores para proteger o recife contra lixo e espécies invasoras.",
      icon: "🪸",
      color: "#10B981",
      max_score: 300,
      question_count: 0,
      time_limit: 0,
      category: "ecosystem",
    },
    {
      id: "mangrove-maze-001",
      slug: "resgate-mangue",
      name: "Resgate no Mangue",
      description: "Salve filhotes de caranguejo no labirinto do manguezal antes do tempo acabar.",
      icon: "🦀",
      color: "#F59E0B",
      max_score: 120,
      question_count: 0,
      time_limit: 60,
      category: "ecosystem",
    },
  ]);

  if (gamesError) console.error("Error seeding games:", gamesError);
  else console.log("✅ Games seeded");

  const { error: cardsError } = await supabase.from("study_cards").upsert([
    {
      id: "study-fauna-01",
      category: "fauna",
      title: "Tartaruga-Oliva",
      subtitle: "Lepidochelys olivacea",
      emoji: "🐢",
      color: "#10B981",
      badge: "Em Perigo",
      related_game_id: "fauna-001",
      facts: [
        { icon: "⚠️", label: "Status IUCN", value: "Vulnerável" },
        { icon: "⚖️", label: "Peso adulto", value: "até 50 kg" },
        { icon: "📏", label: "Comprimento", value: "60–75 cm" },
        {
          icon: "🍽️",
          label: "Alimentação",
          value: "Medusas, algas, crustáceos",
        },
        { icon: "🥚", label: "Ninhos no CE", value: "Projeto TAMAR monitora" },
        { icon: "🕰️", label: "Longevidade", value: "Até 50 anos" },
      ],
      did_you_know:
        'A tartaruga-oliva é a menor das tartarugas marinhas do Brasil, mas realiza a maior desovas em massa do mundo — chamada "arribada".',
    },
    {
      id: "study-fauna-02",
      category: "fauna",
      title: "Peixe-Boi Marinho",
      subtitle: "Trichechus manatus",
      emoji: "🦭",
      color: "#00D4FF",
      badge: "Criticamente Ameaçado",
      related_game_id: "fauna-001",
      facts: [
        {
          icon: "🔴",
          label: "Status IUCN",
          value: "Vulnerável (no Brasil: CR)",
        },
        { icon: "⚖️", label: "Peso adulto", value: "400–600 kg" },
        { icon: "📏", label: "Comprimento", value: "até 4 metros" },
        { icon: "🌿", label: "Alimentação", value: "Fanerógamas marinhas" },
        { icon: "📊", label: "Pop. no Brasil", value: "< 500 indivíduos" },
        {
          icon: "🏞️",
          label: "Habitat no CE",
          value: "Estuários e lagoas costeiras",
        },
      ],
      did_you_know:
        "O peixe-boi marinho é um mamífero que respira ar mas passa toda a vida no mar. No Ceará, o CMA/ICMBio em Acaraú é responsável pela sua conservação.",
    },
    {
      id: "study-flora-01",
      category: "flora",
      title: "Manguezal Cearense",
      subtitle: "Rhizophora mangle · Avicennia",
      emoji: "🌳",
      color: "#10B981",
      badge: "Berçário do Mar",
      related_game_id: "flora-001",
      facts: [
        { icon: "🗺️", label: "Área no CE", value: "~25.000 hectares" },
        { icon: "🌱", label: "Espécies arbóreas", value: "4 principais no CE" },
        {
          icon: "🌍",
          label: "Carbono capturado",
          value: "5x florestas tropicais",
        },
        {
          icon: "🦐",
          label: "Espécies dependentes",
          value: "> 70% frutos do mar",
        },
        {
          icon: "🏞️",
          label: "Rios com mangue",
          value: "Jaguaribe, Acaraú, Choró",
        },
      ],
      did_you_know:
        "Os manguezais do Ceará capturam carbono 5 vezes mais eficientemente que florestas tropicais terrestres.",
    },
    {
      id: "study-poll-01",
      category: "pollution",
      title: "Microplásticos",
      subtitle: "A ameaça invisível",
      emoji: "🔬",
      color: "#F59E0B",
      badge: "Alerta Ambiental",
      related_game_id: "pollution-001",
      facts: [
        { icon: "📏", label: "Tamanho", value: "< 5mm" },
        { icon: "🌊", label: "Origem", value: "Degradação de lixo plástico" },
        { icon: "🐟", label: "Impacto", value: "Ingestão por fauna marinha" },
        {
          icon: "🍽️",
          label: "Cadeia Alimentar",
          value: "Chega até os humanos",
        },
      ],
      did_you_know:
        "Estudos indicam que humanos podem estar ingerindo o equivalente a um cartão de crédito em plástico por semana através da cadeia alimentar.",
    },
  ]);

  if (cardsError) console.error("Error seeding study cards:", cardsError);
  else console.log("✅ Study cards seeded");

  console.log("🏁 Seeding completed!");
}

seed();
