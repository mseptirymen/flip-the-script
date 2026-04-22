export interface Tournament {
  id: string;
  user_id: string;
  name: string;
  type: string | null;
  date: string | null;
  created_at: string;
}

export interface Game {
  result: 'win' | 'loss' | 'tie' | 'bye' | 'no_show';
  went_first: boolean | null;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  opponent_pokemon_1: number;
  opponent_pokemon_2: number;
  games: Game[];
  created_at: string;
}

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  sprite_id_1: number;
  sprite_id_2: number;
  created_at: string;
}