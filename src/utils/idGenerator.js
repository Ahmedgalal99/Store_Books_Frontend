/**
 * Generates a new unique ID based on existing items
 * @param {Array} existingItems - Array of items with id property
 * @returns {number} New unique ID
 */
export function generateId(existingItems) {
  if (!existingItems || existingItems.length === 0) return 1;
  return Math.max(...existingItems.map(item => item.id)) + 1;
}

/**
 * Generates a color based on a string (deterministic)
 * @param {string} str - Input string
 * @returns {string} Hex color with opacity
 */
export function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = hash % 360;
  const s = 65 + (hash % 20);
  const l = 75 + (hash % 15);
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}
