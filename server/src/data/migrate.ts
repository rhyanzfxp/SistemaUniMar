import { supabase } from '../config/supabase';
import { studyCards } from './old_study_clean';
import { games, questions } from './old_game_clean';

async function migrate() {
  console.log(`Migrating ${games.length} games...`);
  for (const g of games) {
    const { error } = await supabase.from('games').upsert({
      id: g.id,
      slug: g.slug,
      name: g.name,
      description: g.description,
      icon: g.icon,
      color: g.color,
      max_score: g.maxScore,
      question_count: g.questionCount,
      time_limit: g.timeLimit,
      category: g.category
    });
    if (error) console.error('Error inserting game', g.id, error);
  }

  console.log(`Migrating ${questions.length} questions...`);
  for (const q of questions) {
    const { error } = await supabase.from('questions').upsert({
      id: q.id,
      game_id: q.gameId,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points
    });
    if (error) console.error('Error inserting question', q.id, error);
  }

  console.log(`Migrating ${studyCards.length} study cards...`);
  for (const c of studyCards) {
    const { error } = await supabase.from('study_cards').upsert({
      id: c.id,
      category: c.category,
      title: c.title,
      subtitle: c.subtitle,
      emoji: c.emoji,
      color: c.color,
      badge: c.badge,
      related_game_id: c.relatedGameId,
      facts: c.facts,
      did_you_know: c.didYouKnow
    });
    if (error) console.error('Error inserting card', c.id, error);
  }

  console.log('Migration completed successfully!');
}

migrate().catch(console.error);
