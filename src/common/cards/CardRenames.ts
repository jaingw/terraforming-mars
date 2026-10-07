import {CardName} from './CardName';

// Maps old/alternate card name spellings to their canonical CardName values.
// When renaming a card, add the old name here with a TODO and removal date.
// Remember to add a test in tests/common/cards/CardRenames.spec.ts.
export const CARD_RENAMES = new Map<string, CardName>([
  // #2839: Fix card names to match printed English versions
  ['Thorgate', CardName.THORGATE],
  ['Terralabs Research', CardName.TERRALABS_RESEARCH],
  ['Astrodrill', CardName.ASTRODRILL],
  ['EcoLine', CardName.ECOLINE],
  ['Colony', CardName.BUILD_COLONY_STANDARD_PROJECT],
  // e13079e6: Concession Rights renamed to Tunneling Loophole
  ['Concession Rights', CardName.TUNNELING_LOOPHOLE],
  // Space Corridors renamed to Space Lanes (old name used in custom card lists)
  ['Space Corridors', CardName.SPACE_LANES],
]);

export function resolveCardName(cardName: CardName): CardName {
  const renamed = CARD_RENAMES.get(cardName);
  if (renamed !== undefined) return renamed;
  // Old save data may include ':module' suffix (e.g. 'Geological Survey:underworld')
  const colonIdx = cardName.indexOf(':underworld');
  if (colonIdx > 0) {
    const stripped = cardName.slice(0, colonIdx) as CardName;
    if (CARD_RENAMES.has(stripped)) return CARD_RENAMES.get(stripped)!;
    return stripped;
  }
  return cardName;
}
