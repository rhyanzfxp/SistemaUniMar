import { supabase } from '../config/supabase';
import { StudyCard } from './study.types';

export const StudyModel = {
  async getAll(): Promise<StudyCard[]> {
    const { data, error } = await supabase
      .from('study_cards')
      .select('*, games(slug)')
      .order('id');
    
    if (error) {
      console.error('Error fetching study cards:', error);
      return [];
    }
    
    return data.map(c => ({
      id: c.id,
      category: c.category,
      title: c.title,
      subtitle: c.subtitle,
      emoji: c.emoji,
      color: c.color,
      badge: c.badge,
      facts: c.facts,
      didYouKnow: c.did_you_know,
      relatedGameId: c.related_game_id,
      relatedGameSlug: (c.games as any)?.slug
    })) as StudyCard[];
  },

  async getByCategory(category: string): Promise<StudyCard[]> {
    const { data, error } = await supabase
      .from('study_cards')
      .select('*, games(slug)')
      .eq('category', category)
      .order('id');
    
    if (error) {
      console.error('Error fetching study cards by category:', error);
      return [];
    }
    
    return data.map(c => ({
      id: c.id,
      category: c.category,
      title: c.title,
      subtitle: c.subtitle,
      emoji: c.emoji,
      color: c.color,
      badge: c.badge,
      facts: c.facts,
      didYouKnow: c.did_you_know,
      relatedGameId: c.related_game_id,
      relatedGameSlug: (c.games as any)?.slug
    })) as StudyCard[];
  },

  async getById(id: string): Promise<StudyCard | null> {
    const { data, error } = await supabase
      .from('study_cards')
      .select('*, games(slug)')
      .eq('id', id)
      .single();
    
    if (error) return null;
    
    return {
      id: data.id,
      category: data.category,
      title: data.title,
      subtitle: data.subtitle,
      emoji: data.emoji,
      color: data.color,
      badge: data.badge,
      facts: data.facts,
      didYouKnow: data.did_you_know,
      relatedGameId: data.related_game_id,
      relatedGameSlug: (data.games as any)?.slug
    } as StudyCard;
  },

  getCategories(): string[] {
    return ['fauna', 'flora', 'pollution'];
  },
};
