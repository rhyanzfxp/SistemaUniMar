export interface StudyCard {
  id: string;
  category: 'fauna' | 'flora' | 'pollution';
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  badge?: string;
  facts: { label: string; value: string; icon: string }[];
  didYouKnow: string;
  relatedGameId: string;

  relatedGameSlug?: string;
}
