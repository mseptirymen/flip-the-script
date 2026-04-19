import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface TournamentDBSchema extends DBSchema {
  tournaments: {
    key: string;
    value: Tournament;
    indexes: { 'by-date': string };
  };
}

export interface Round {
  id: string;
  roundNumber: number;
  opponentDeckArchetype: string;
  result: 'win' | 'loss';
}

export interface Tournament {
  id: string;
  name: string;
  date: string | null;
  rounds: Round[];
  createdAt: number;
}

const DB_NAME = 'flip-the-script';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TournamentDBSchema>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TournamentDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('tournaments', { keyPath: 'id' });
        store.createIndex('by-date', 'date');
      },
    });
  }
  return dbPromise;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  const db = await getDB();
  return db.getAll('tournaments');
}

export async function getTournament(id: string): Promise<Tournament | undefined> {
  const db = await getDB();
  return db.get('tournaments', id);
}

export async function addTournament(tournament: Tournament): Promise<string> {
  const db = await getDB();
  await db.add('tournaments', tournament);
  return tournament.id;
}

export async function updateTournament(tournament: Tournament): Promise<void> {
  const db = await getDB();
  await db.put('tournaments', tournament);
}

export async function deleteTournament(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tournaments', id);
}
