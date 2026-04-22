import { supabase } from './supabase';
import type { Round, Tournament, Deck } from './types';

export type { Round, Tournament, Deck };

export async function getAllTournaments(): Promise<Tournament[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function addTournament(
  tournament: Omit<Tournament, 'id' | 'created_at' | 'user_id'>
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('tournaments')
    .insert({ ...tournament, user_id: user.id })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteTournament(id: string): Promise<void> {
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) throw error;
}

export async function getRoundsForTournament(
  tournamentId: string
): Promise<Round[]> {
  const { data, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('round_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addRound(
  round: Omit<Round, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('rounds')
    .insert(round)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteRound(id: string): Promise<void> {
  const { error } = await supabase.from('rounds').delete().eq('id', id);
  if (error) throw error;
}

export async function updateRound(
  id: string,
  updates: Partial<Pick<Round, 'opponent_pokemon_1' | 'opponent_pokemon_2' | 'games'>>
): Promise<void> {
  const { error } = await supabase
    .from('rounds')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function getAllDecks(): Promise<Deck[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addDeck(
  deck: Omit<Deck, 'id' | 'created_at' | 'user_id'>
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('decks')
    .insert({ ...deck, user_id: user.id })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from('decks').delete().eq('id', id);
  if (error) throw error;
}

export async function getDeck(id: string): Promise<Deck | null> {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function updateDeck(
  id: string,
  updates: Partial<Pick<Deck, 'name' | 'sprite_id_1' | 'sprite_id_2'>>
): Promise<void> {
  const { error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}