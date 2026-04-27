import { supabase } from '../config/supabase';
import { Game, GameQuestion } from './types';

export const GameModel = {
  async getAll(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching games:', error);
      return [];
    }
    
    return data.map(g => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      description: g.description,
      icon: g.icon,
      color: g.color,
      maxScore: g.max_score,
      questionCount: g.question_count,
      timeLimit: g.time_limit,
      category: g.category
    })) as Game[];
  },
  
  async getById(id: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`id.eq."${id}",slug.eq."${id}"`)
      .single();
    
    if (error) return null;
    
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      maxScore: data.max_score,
      questionCount: data.question_count,
      timeLimit: data.time_limit,
      category: data.category
    } as Game;
  },

  async getQuestions(gameId: string): Promise<GameQuestion[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId);
    
    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    return data.map(q => ({
      id: q.id,
      gameId: q.game_id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: q.points
    })) as GameQuestion[];
  },

  async getQuestionById(id: string): Promise<GameQuestion | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;

    return {
      id: data.id,
      gameId: data.game_id,
      question: data.question,
      options: data.options,
      correctAnswer: data.correct_answer,
      explanation: data.explanation,
      difficulty: data.difficulty,
      points: data.points
    } as GameQuestion;
  }
};
