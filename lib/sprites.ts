import spriteMap from "@/src/data/spriteMap.json";

const idToName: Record<string, string> = spriteMap;
const nameToId: Record<string, string> = Object.fromEntries(
  Object.entries(idToName).map(([id, name]) => [name, id])
);

export function getSpritePath(name: string, form?: string): string {
  const id = nameToId[name];
  if (!id) return `/sprites/icons/${name}.png`;

  if (form) {
    return `/sprites/icons/${id}-${form}.png`;
  }
  return `/sprites/icons/${id}.png`;
}

export function getPokemonId(name: string): string | undefined {
  return nameToId[name];
}