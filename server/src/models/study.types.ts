export interface StudyCard {
  id: string;
  category: 'fauna' | 'flora' | 'pollution';
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  badge?: string;
  facts: StudyFact[];
  didYouKnow: string;
  relatedGameId: string;

  relatedGameSlug?: string;
}

export interface StudyFact {
  label: string;
  value: string;
  icon: string;
}
