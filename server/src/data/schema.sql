-- schema.sql
-- UniMar Database Schema for Supabase

-- 1. CLEANUP (Optional: use with caution)
-- DROP TABLE IF EXISTS study_cards;
-- DROP TABLE IF EXISTS scores;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS games;

-- 2. DISABLE RLS (For development phase)
ALTER TABLE IF EXISTS games DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_cards DISABLE ROW LEVEL SECURITY;

-- 3. CREATE TABLES
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  max_score INTEGER DEFAULT 1000,
  question_count INTEGER DEFAULT 10,
  time_limit INTEGER DEFAULT 30,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  difficulty TEXT,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  game_name TEXT,
  score INTEGER NOT NULL,
  max_score INTEGER,
  percentage INTEGER,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_cards (
  id TEXT PRIMARY KEY,
  category TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  emoji TEXT,
  color TEXT,
  badge TEXT,
  related_game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  facts JSONB,
  did_you_know TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSERT MOCK DATA (GAMES)
INSERT INTO games (id, slug, name, description, icon, color, max_score, question_count, time_limit, category)
VALUES 
('fauna-001', 'fauna-marinha', 'Fauna Marinha', 'Identifique e aprenda sobre as espécies marinhas da costa cearense e dos oceanos brasileiros.', '🐠', '#00D4FF', 1000, 10, 30, 'fauna'),
('flora-001', 'flora-marinha', 'Flora Marinha', 'Explore os ecossistemas de mangue, recifes de coral e pradarias de algas do Ceará.', '🌿', '#10B981', 1000, 10, 30, 'flora'),
('pollution-001', 'poluicao-oceanica', 'Poluição Oceânica', 'Tome decisões e entenda os impactos da poluição nos oceanos de Fortaleza e do Brasil.', '🗑️', '#F59E0B', 1000, 10, 45, 'pollution'),
('ecosystem-001', 'ecossistema', 'Ecossistema do Manguezal', 'Aprenda sobre o delicado equilíbrio dos manguezais cearenses.', '🌳', '#10B981', 1000, 1, 0, 'ecosystem')
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT MOCK DATA (QUESTIONS)
INSERT INTO questions (id, game_id, question, options, correct_answer, explanation, difficulty, points)
VALUES
('q-fauna-01', 'fauna-001', 'Qual é o maior peixe ósseo do mundo, frequentemente avistado na costa nordeste do Brasil?', ARRAY['Peixe-lua (Mola mola)', 'Tubarão-baleia', 'Arraia-jamanta', 'Barracuda'], 0, 'O peixe-lua (Mola mola) é o maior peixe ósseo do mundo, podendo pesar mais de 2 toneladas. É frequentemente avistado na costa do Nordeste brasileiro.', 'medium', 100),
('q-fauna-02', 'fauna-001', 'Qual tartaruga marinha é a mais encontrada na costa cearense e está em lista de espécies ameaçadas?', ARRAY['Tartaruga-de-couro', 'Tartaruga-verde', 'Tartaruga-cabeçuda', 'Tartaruga-oliva'], 3, 'A tartaruga-oliva (Lepidochelys olivacea) é a mais abundante na costa cearense, mas figura na lista de espécies ameaçadas. Projeto TAMAR monitora seus ninhos no estado.', 'hard', 100),
('q-fauna-03', 'fauna-001', 'Qual mamífero marinho é frequentemente avistado na Enseada do Mucuripe, em Fortaleza, nadando próximo aos banhistas?', ARRAY['Boto-cinza', 'Lobo-marinho', 'Baleia-franca', 'Peixe-boi-da-amazônia'], 0, 'O boto-cinza (Sotalia guianensis) é um pequeno golfinho muito comum no litoral de Fortaleza. Eles costumam se alimentar na Enseada do Mucuripe e na foz do Rio Ceará, sendo símbolos da biodiversidade urbana.', 'easy', 100),
('q-fauna-04', 'fauna-001', 'Como o Ceará tem combatido a invasão do Peixe-Leão nos seus recifes?', ARRAY['Usando venenos químicos na água', 'Treinando pescadores para captura manual e consumo em restaurantes', 'Introduzindo tubarões de outros países', 'Fechando o acesso ao mar'], 1, 'Diferente de outros lugares, o Ceará adotou uma estratégia criativa: treinar pescadores artesanais para capturar o peixe-leão manualmente e incentivar o consumo da sua carne em restaurantes de Fortaleza como forma de controle biológico.', 'hard', 100),
('q-fauna-05', 'fauna-001', 'Quantos corações um polvo possui?', ARRAY['1', '2', '3', '4'], 2, 'O polvo possui 3 corações: um coração principal que bombeia sangue pelo corpo e dois corações branquiais que bombeiam sangue pelas brânquias. Seu sangue é azul devido à hemocianina.', 'medium', 100),
('q-fauna-06', 'fauna-001', 'Qual mamífero marinho é encontrado na costa nordestina e está criticamente ameaçado de extinção no Brasil?', ARRAY['Golfinho-nariz-de-garrafa', 'Peixe-boi-marinho', 'Baleia-jubarte', 'Orca'], 1, 'O peixe-boi-marinho (Trichechus manatus) é criticamente ameaçado de extinção. No Brasil, há menos de 500 indivíduos, concentrados principalmente no Nordeste. O IBAMA mantém projeto de conservação.', 'medium', 100),
('q-fauna-07', 'fauna-001', 'Como a estrela-do-mar se alimenta?', ARRAY['Filtra partículas da água', 'Expele o estômago para fora e digere externamente', 'Usa veneno para paralisar as presas', 'Absorve nutrientes pela pele'], 1, 'A estrela-do-mar tem um método de alimentação fascinante: ela expele o estômago para fora do corpo e envolve sua presa (como mexilhões), digerindo-a externamente antes de retrair o estômago.', 'hard', 100),
('q-fauna-08', 'fauna-001', 'Qual é a função da nadadeira dorsal do tubarão?', ARRAY['Propulsão para frente', 'Estabilização e equilíbrio lateral', 'Comunicação com outros tubarões', 'Regulação de temperatura'], 1, 'A nadadeira dorsal do tubarão serve principalmente para estabilização e equilíbrio, impedindo que o peixe role de lado enquanto nada. A propulsão vem da nadadeira caudal (cauda).', 'medium', 100),
('q-fauna-09', 'fauna-001', 'O cavalo-marinho é um dos poucos animais onde o macho engravida. Quanto tempo dura a gestação?', ARRAY['2 a 4 semanas', '6 a 8 semanas', '3 a 6 meses', 'Mais de 1 ano'], 0, 'A gestação do cavalo-marinho dura de 2 a 4 semanas. O macho carrega os ovos em uma bolsa ventral e dá à luz filhotes completamente formados. Podem nascer de 5 a 2.000 filhotes de uma vez.', 'medium', 100),
('q-fauna-10', 'fauna-001', 'Qual é a principal espécie da pesca artesanal que move a economia e a cultura do litoral cearense?', ARRAY['Atum', 'Lagosta', 'Sardinha', 'Bacalhau'], 1, 'A lagosta é o "ouro do mar" cearense. O Ceará é um dos maiores exportadores mundiais de lagosta, e essa atividade moldou a cultura das vilas de pescadores e o artesanato local por décadas.', 'easy', 100),
('q-flora-01', 'flora-001', 'Qual espécie de manguezal é a mais comum na costa cearense e tem raízes escora visíveis acima da água?', ARRAY['Mangue-branco (Laguncularia)', 'Mangue-vermelho (Rhizophora)', 'Mangue-siriúba (Avicennia)', 'Mangue-botão (Conocarpus)'], 1, 'O mangue-vermelho (Rhizophora mangle) é identificado pelas suas características raízes-escora arqueadas que crescem acima da lama. Essas raízes criam habitat para diversas espécies e fixam o sedimento.', 'medium', 100),
('q-flora-02', 'flora-001', 'Os manguezais do Ceará estão entre os mais produtivos do mundo. Qual é a principal função ecológica deles?', ARRAY['Produzir oxigênio para a atmosfera', 'Berçário de peixes, crustáceos e aves marinhas', 'Filtrar a água da chuva', 'Produzir medicamentos naturais'], 1, 'Os manguezais funcionam como berçários naturais: 75% dos frutos do mar consumidos nos países tropicais dependem dos manguezais em algum estágio de vida. No Ceará, são essenciais para a carcinicultura e pesca artesanal.', 'easy', 100),
('q-flora-03', 'flora-001', 'O que são as "algas calcárias crostosas" (rodolitos) encontradas na plataforma continental do Ceará?', ARRAY['Plantas com raízes que crescem no fundo do mar', 'Algas vermelhas que formam nódulos calcáreos, criando habitats para biodiversidade', 'Coral morto coberto de musgo', 'Fungos marinhos parasitas'], 1, 'Os rodolitos são algas vermelhas calcárias (Rhodophyta) que formam nódulos arredondados no fundo do mar. Os bancos de rodolitos do Ceará são reconhecidos internacionalmente como hotspots de biodiversidade marinha.', 'hard', 100),
('q-poll-01', 'pollution-001', 'Quanto tempo um copo plástico descartável leva para se decompor no oceano?', ARRAY['5 anos', '50 anos', '450 anos', 'Nunca se decompõe completamente'], 2, 'Um copo plástico descartável leva cerca de 450 anos para se decompor no ambiente. No oceano, o plástico se fragmenta em microplásticos que permanecem por muito mais tempo, sendo ingeridos por toda a cadeia alimentar marinha.', 'easy', 100)
ON CONFLICT (id) DO NOTHING;

-- 5. INSERT MOCK DATA (STUDY CARDS)
INSERT INTO study_cards (id, category, title, subtitle, emoji, color, badge, related_game_id, facts, did_you_know)
VALUES
('study-fauna-01', 'fauna', 'Tartaruga-Oliva', 'Lepidochelys olivacea', '🐢', '#10B981', 'Em Perigo', 'fauna-001', '[{"icon": "⚠️", "label": "Status IUCN", "value": "Vulnerável"}, {"icon": "⚖️", "label": "Peso adulto", "value": "até 50 kg"}, {"icon": "📏", "label": "Comprimento", "value": "60–75 cm"}, {"icon": "🍽️", "label": "Alimentação", "value": "Medusas, algas, crustáceos"}, {"icon": "🥚", "label": "Ninhos no CE", "value": "Projeto TAMAR monitora"}, {"icon": "🕰️", "label": "Longevidade", "value": "Até 50 anos"}]', 'A tartaruga-oliva é a menor das tartarugas marinhas do Brasil, mas realiza a maior desovas em massa do mundo — chamada "arribada" — onde milhares de fêmeas sobem à praia na mesma noite para desovar. O fenômeno acontece principalmente na Índia (Praia de Gahirmatha), mas ocorre em menor escala na costa cearense.'),
('study-fauna-02', 'fauna', 'Peixe-Boi Marinho', 'Trichechus manatus', '🦭', '#00D4FF', 'Criticamente Ameaçado', 'fauna-001', '[{"icon": "🔴", "label": "Status IUCN", "value": "Vulnerável (no Brasil: CR)"}, {"icon": "⚖️", "label": "Peso adulto", "value": "400–600 kg"}, {"icon": "📏", "label": "Comprimento", "value": "até 4 metros"}, {"icon": "🌿", "label": "Alimentação", "value": "Fanerógamas marinhas"}, {"icon": "📊", "label": "Pop. no Brasil", "value": "< 500 indivíduos"}, {"icon": "🏞️", "label": "Habitat no CE", "value": "Estuários e lagoas costeiras"}]', 'O peixe-boi marinho é um mamífero que respira ar mas passa toda a vida no mar. No Ceará, o CMA/ICMBio em Acaraú é responsável pela reabilitação e soltura de animais encalhados. Sua principal ameaça é a colisão com embarcações e o emaranhamento em redes de pesca — não a predação natural.'),
('study-flora-01', 'flora', 'Manguezal Cearense', 'Rhizophora mangle · Avicennia · Laguncularia', '🌳', '#10B981', 'Berçário do Mar', 'flora-001', '[{"icon": "🗺️", "label": "Área no CE", "value": "~25.000 hectares"}, {"icon": "🌱", "label": "Espécies arbóreas", "value": "4 principais no CE"}, {"icon": "🌍", "label": "Carbono capturado", "value": "5x florestas tropicais"}, {"icon": "🦐", "label": "Espécies dependentes", "value": "> 70% frutos do mar tropicais"}, {"icon": "🏞️", "label": "Rios com mangue", "value": "Jaguaribe, Acaraú, Choró"}, {"icon": "⚖️", "label": "Proteção legal", "value": "APP (Lei 12.651/2012)"}]', 'Os manguezais do Ceará são "berçários do mar" — praticamente todos os camarões e lagostas que chegam à sua mesa passaram parte da vida num manguezal. Além disso, capturam carbono 5 vezes mais eficientemente que florestas tropicais terrestres, sendo aliados essenciais contra as mudanças climáticas.'),
('study-poll-01', 'pollution', 'Microplásticos', 'A ameaça invisível nos oceanos', '🔬', '#F59E0B', 'Alerta Ambiental', 'pollution-001', '[{"icon": "📏", "label": "Tamanho", "value": "< 5mm"}, {"icon": "🌊", "label": "Origem", "value": "Degradação de plásticos"}, {"icon": "🐟", "label": "Impacto", "value": "Ingestão por fauna"}, {"icon": "🍽️", "label": "Cadeia", "value": "Bioacumulação"}]', 'Estudos indicam que humanos podem estar ingerindo o equivalente a um cartão de crédito em plástico por semana através da cadeia alimentar marinha.'),
('study-eco-01', 'ecosystem', 'Recifes de Coral', 'Hotspots de biodiversidade', '🪸', '#00D4FF', 'Ecossistema Crítico', 'ecosystem-001', '[{"icon": "🌎", "label": "Biodiversidade", "value": "25% da vida marinha"}, {"icon": "🌡️", "label": "Ameaça", "value": "Aquecimento global"}, {"icon": "🛡️", "label": "Proteção", "value": "Barreira contra erosão"}]', 'Embora cubram menos de 1% do fundo do mar, os recifes de coral abrigam mais de 25% de toda a vida marinha conhecida.')
ON CONFLICT (id) DO NOTHING;
