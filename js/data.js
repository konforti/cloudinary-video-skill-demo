export const BRAND = {
  name: 'Costera Resorts',
  property: 'Costera Playa Azul',
  tagline: 'Coastal escapes on the Pacific shore',
  lede: 'A stretch of Pacific coastline, twelve ways to stay. Watch the property tour, then choose your room.',
};

export const CLOUD_NAME = 'dxuiuruim';
export const HERO_PUBLIC_ID = 'costera/hero-tour';

/**
 * The five hand-typed tags of the before state. `ocean-view` and `ocean-veiw`
 * are near-duplicates — the typo is deliberate and shows manual tagging drift.
 */
export const TYPED_TAGS = ['ocean-view', 'ocean-veiw', 'suite', 'family', 'adults-only'];

export const rooms = [
  { sku: 'CR-OCS-001', name: 'Oceanfront Suite',   price: 480,  tags: ['ocean-view', 'suite'],                     at: 10 },
  { sku: 'CR-PVL-002', name: 'Beach Pavilion',     price: 620,  tags: ['ocean-view', 'suite', 'adults-only'],      at: 26 },
  { sku: 'CR-GDN-003', name: 'Garden Casita',      price: 310,  tags: ['family'],                                  at: 88 },
  { sku: 'CR-PNT-004', name: 'Penthouse Terrace',  price: 890,  tags: ['ocean-veiw', 'suite', 'adults-only'],      at: 32 },
  { sku: 'CR-SWM-005', name: 'Swim-Up Room',       price: 540,  tags: ['family', 'ocean-veiw'],                    at: 158 },
  { sku: 'CR-DLX-006', name: 'Deluxe King',        price: 290,  tags: ['ocean-view'] },
  { sku: 'CR-TWN-007', name: 'Twin Coastal',       price: 265,  tags: ['family'] },
  { sku: 'CR-JNR-008', name: 'Junior Suite',       price: 395,  tags: ['suite'] },
  { sku: 'CR-BNG-009', name: 'Palm Bungalow',      price: 445,  tags: ['family', 'ocean-view'] },
  { sku: 'CR-LFT-010', name: 'Cliffside Loft',     price: 710,  tags: ['ocean-view', 'adults-only'] },
  { sku: 'CR-STD-011', name: 'Courtyard Studio',   price: 240,  tags: ['family'] },
  { sku: 'CR-VIL-012', name: 'Private Villa',      price: 1150, tags: ['suite', 'adults-only', 'ocean-view'] },
];

/**
 * Chapters come from Cloudinary's auto_chaptering (the player loads
 * `<publicId>-chapters.vtt`). Binding each chapter to a SKU is NOT generated —
 * auto-chaptering knows where the segments are, not which room a segment sells.
 * That mapping is authored here against the generated cue start times.
 */
export const chapters = [
  { start: 10,  end: 26,  title: 'The Seven Mile Miracle', sku: 'CR-OCS-001' },
  { start: 26,  end: 32,  title: 'Growing Up by the Ocean', sku: 'CR-PVL-002' },
  { start: 32,  end: 183, title: 'A Unique Perspective',    sku: 'CR-PNT-004' },
];

/**
 * Machine tags from Google Auto Tagging at a 0.65 confidence threshold, read
 * back from the Admin API. Verbatim — not curated. Note there is no
 * `ocean-veiw`: a typo cannot survive a process that never types.
 */
export const machineTags = {
  'CR-OCS-001': ['bed','bed frame','bed sheet','bedding','bedroom','ceiling','furniture','hardwood','interior design','light fixture','lighting','pillow','room','wood','wood stain'],
  'CR-PVL-002': ['beach','caribbean','coast','ocean','outdoor furniture','palm trees','resort','sea','sunlounger','tropics'],
  'CR-GDN-003': ['bed','bed frame','bed sheet','bedding','bedroom','blanket','ceiling','comfort','curtain','cushion','design','duvet','floor','flooring','furniture','hardwood','hotel','interior design','lamp','lighting','linens','mattress','nightstand','pillow','room','suite','textile','throw pillow','window covering','wood'],
  'CR-PNT-004': ['palm trees'],
  'CR-SWM-005': ['hotel','leisure','ocean','palm trees','resort','sea','swimming pool','tropics','vacation'],
  'CR-DLX-006': ['bed','bed frame','bed sheet','bedding','bedroom','comfort','cushion','drawer','duvet','floor','furniture','grey','home','hotel','interior design','lamp','lampshade','linens','mattress','nightstand','pillow','room','suite','throw pillow'],
  'CR-TWN-007': ['bed','bed sheet','bedding','bedroom','comfort','curtain','furniture','interior design','lamp','living room','pillow','room','throw pillow','window covering'],
  'CR-JNR-008': ['mountain range'],
  'CR-BNG-009': ['eco hotel','resort'],
  'CR-LFT-010': ['apartment','armrest','ceiling','chair','coffee table','couch','daybed','den','design','floor','flooring','furniture','glass','hardwood','home','houseplant','interior design','lamp','light fixture','lighting','living room','molding','room','shade','sofa bed','throw pillow'],
  'CR-STD-011': ['cylinder','light fixture','sconce'],
  'CR-VIL-012': ['ceiling','design','interior design','light fixture','living room','room'],
};

/** Machine tags shared by 2+ rooms, so a facet actually narrows the grid. */
export const machineFacets = (() => {
  const counts = new Map();
  for (const tags of Object.values(machineTags)) {
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2 && n < rooms.length)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([tag]) => tag);
})();

export const roomBySku = (sku) => rooms.find((r) => r.sku === sku);

export const formatTime = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
