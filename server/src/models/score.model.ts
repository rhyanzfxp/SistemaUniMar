import { supabase } from '../config/supabase';
import { ScoreEntry } from './types';

export const ScoreModel = {
  async getAll(): Promise<ScoreEntry[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false });
    
    if (error) {
      console.error('Error fetching scores:', error);
      return [];
    }
    
    return data.map(s => ({
      id: s.id,
      playerName: s.player_name,
      gameId: s.game_id,
      gameName: s.game_name,
      score: s.score,
      maxScore: s.max_score,
      percentage: s.percentage,
      timeSpent: s.time_spent,
      createdAt: new Date(s.created_at)
    })) as ScoreEntry[];
  },

  async getByGame(gameId: string): Promise<ScoreEntry[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false });
    
    if (error) {
      console.error('Error fetching scores by game:', error);
      return [];
    }
    
    return data.map(s => ({
      id: s.id,
      playerName: s.player_name,
      gameId: s.game_id,
      gameName: s.game_name,
      score: s.score,
      maxScore: s.max_score,
      percentage: s.percentage,
      timeSpent: s.time_spent,
      createdAt: new Date(s.created_at)
    })) as ScoreEntry[];
  },

  async addScore(entry: Omit<ScoreEntry, 'id' | 'createdAt'>): Promise<ScoreEntry> {
    const { data, error } = await supabase
      .from('scores')
      .insert([{
        player_name: entry.playerName,
        game_id: entry.gameId,
        game_name: entry.gameName,
        score: entry.score,
        max_score: entry.maxScore,
        percentage: entry.percentage,
        time_spent: entry.timeSpent
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      playerName: data.player_name,
      gameId: data.game_id,
      gameName: data.game_name,
      score: data.score,
      maxScore: data.max_score,
      percentage: data.percentage,
      timeSpent: data.time_spent,
      createdAt: new Date(data.created_at)
    } as ScoreEntry;
  },

  async getTopN(n: number): Promise<ScoreEntry[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(n);
    
    if (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
    
    return data.map(s => ({
      id: s.id,
      playerName: s.player_name,
      gameId: s.game_id,
      gameName: s.game_name,
      score: s.score,
      maxScore: s.max_score,
      percentage: s.percentage,
      timeSpent: s.time_spent,
      createdAt: new Date(s.created_at)
    })) as ScoreEntry[];
  }
};
