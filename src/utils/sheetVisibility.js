export function isSheetVisibleTo({ viewerIsGM, viewerId, ownerId, ownerSheetVisible, forceMode }) {
  if (viewerIsGM || viewerId === ownerId) return true;
  if (forceMode === 'show') return true;
  if (forceMode === 'hide') return false;
  return ownerSheetVisible !== false;
}
