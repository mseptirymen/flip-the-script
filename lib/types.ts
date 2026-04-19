export interface Tournament {
  id: string;
  user_id: string;
  name: string;
  date: string | null;
  created_at: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  opponent_deck_archetype: string;
  result: 'win' | 'loss';
  created_at: string;
}