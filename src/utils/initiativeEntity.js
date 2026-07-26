export function resolveQueueEntity(id, players, npcs) {
  const p = players?.[id];
  if (p) return { name: p.name, imageUrl: p.portraitUrl, color: p.color, isNpc: false };
  const npc = npcs?.[id];
  if (npc && (npc.category || 'karakter') === 'karakter') {
    return { name: npc.name, imageUrl: npc.imageUrl, isNpc: true };
  }
  return null;
}
