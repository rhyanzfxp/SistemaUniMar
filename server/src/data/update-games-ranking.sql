-- Execute este SQL no Supabase para cadastrar todos os minigames no ranking.
-- Ele também corrige o max_score dos jogos interativos para a porcentagem ficar certa.

INSERT INTO games (id, slug, name, description, icon, color, max_score, question_count, time_limit, category)
VALUES 
('fauna-001', 'fauna-marinha', 'Fauna Marinha', 'Identifique e aprenda sobre as espécies marinhas da costa cearense e dos oceanos brasileiros.', '🐠', '#00D4FF', 1000, 10, 30, 'fauna'),
('flora-001', 'flora-marinha', 'Flora Marinha', 'Explore os ecossistemas de mangue, recifes de coral e pradarias de algas do Ceará.', '🌿', '#10B981', 1000, 10, 30, 'flora'),
('pollution-001', 'poluicao-oceanica', 'Poluição Oceânica', 'Tome decisões e entenda os impactos da poluição nos oceanos de Fortaleza e do Brasil.', '🗑️', '#F59E0B', 1000, 10, 45, 'pollution'),
('ecosystem-001', 'ecossistema', 'Ecossistema do Manguezal', 'Arraste espécies para as zonas corretas do manguezal cearense.', '🌳', '#10B981', 90, 9, 0, 'ecosystem'),
('pollution-sim-001', 'simulador-poluicao', 'Simulador de Poluição Visual', 'Tome decisões sustentáveis e veja o impacto visual da poluição no oceano.', '🛢️', '#F59E0B', 100, 5, 0, 'pollution'),
('ocean-cleanup-001', 'limpeza-oceanica', 'Limpeza Oceânica', 'Remova o lixo antes que chegue ao fundo e proteja os animais marinhos.', '🧹', '#00D4FF', 250, 0, 0, 'pollution'),
('turtle-runner-001', 'mergulho-tartaruga', 'Mergulho da Tartaruga', 'Nade, desvie do lixo e colete águas-vivas para vencer.', '🐢', '#10B981', 100, 0, 0, 'fauna'),
('coral-defender-001', 'defensor-corais', 'Defensor dos Corais', 'Posicione defensores para proteger o recife contra lixo e espécies invasoras.', '🪸', '#10B981', 300, 0, 0, 'ecosystem'),
('mangrove-maze-001', 'resgate-mangue', 'Resgate no Mangue', 'Salve filhotes de caranguejo no labirinto do manguezal antes do tempo acabar.', '🦀', '#F59E0B', 120, 0, 60, 'ecosystem')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  max_score = EXCLUDED.max_score,
  question_count = EXCLUDED.question_count,
  time_limit = EXCLUDED.time_limit,
  category = EXCLUDED.category;
