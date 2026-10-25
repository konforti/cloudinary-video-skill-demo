export const BRAND = {
  name: 'Costera Resorts',
  property: 'Costera Playa Azul',
  tagline: 'Coastal escapes on the Pacific shore',
  lede: 'A stretch of Pacific coastline, twelve ways to stay. Watch the property tour, then choose your room.',
};

export const CLOUD_NAME = 'raz';
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
  { start: 10,  end: 26,  title: 'The Seven Mile Miracle',  sku: 'CR-OCS-001' },
  { start: 26,  end: 40,  title: 'Growing Up by the Shore', sku: 'CR-PVL-002' },
  { start: 40,  end: 183, title: 'Meeting a Local',         sku: 'CR-PNT-004' },
];

/**
 * Machine tags from Google Auto Tagging at a 0.65 confidence threshold, read
 * back from the Admin API. Verbatim — not curated. Note there is no
 * `ocean-veiw`: a typo cannot survive a process that never types.
 */
export const machineTags = {
  'CR-OCS-001': ['apartment','bed','bed frame','bed sheet','bedding','bedroom','ceiling','chair','den','eco hotel','floor','flooring','furniture','hardwood','home','hotel','houseplant','interior design','laminate flooring','lamp','light fixture','lighting','picture frame','pillow','resort','room','suite','varnish','wood','wood flooring','wood stain'],
  'CR-PVL-002': ['beach','boardwalk','body of water','caribbean','chair','coast','coastal and oceanic landforms','deck','eco hotel','furniture','hardwood','holiday','island','leisure','ocean','outdoor furniture','palm trees','plank','resort','resort town','sea','seaside resort','shade','shore','summer','sunlounger','swimming pool','tropics','umbrella','vacation','water'],
  'CR-GDN-003': ['bed','bed frame','bed sheet','bedding','bedroom','hardwood','hotel','linens','mattress','resort'],
  'CR-PNT-004': ['eco hotel','hacienda','hotel','outdoor furniture','palm trees','reflecting pool','resort','shade','swimming pool'],
  'CR-SWM-005': ['blue','caribbean','eco hotel','holiday','hotel','leisure','ocean','outdoor furniture','palm trees','resort','resort town','sea','seaside resort','shade','swimming pool','tropics','vacation'],
  'CR-DLX-006': ['bed','bed frame','bed sheet','bedding','bedroom','floor','furniture','hotel','lamp','linens','pillow','throw pillow'],
  'CR-TWN-007': ['apartment','bed','bed frame','bed sheet','bedding','bedroom','ceiling','chair','comfort','curtain','den','floor','flooring','furniture','hardwood','hotel','interior design','lamp','lampshade','light fixture','linens','living room','mattress','molding','nightstand','picture frame','pillow','room','suite','textile','throw pillow','window covering','window treatment','wood stain'],
  'CR-JNR-008': ['chair','comfort','eco hotel','furniture','hardwood','hill station','lake district','mountain range','ridge','sound','valley'],
  'CR-BNG-009': ['deck','eco hotel','hotel','leisure','outdoor furniture','resort','resort town','seaside resort','shade','sunlounger','swimming pool','vacation','villa'],
  'CR-LFT-010': ['apartment','armrest','cabinetry','carpet','ceiling','chair','club chair','coffee table','comfort','couch','daybed','den','design','desk','floor','flooring','flowerpot','furniture','hardwood','home','houseplant','interior design','kitchen & dining room table','laminate flooring','lamp','light fixture','lighting','living room','loft','loveseat','molding','picture frame','pillow','room','sofa bed','table','television','throw pillow','varnish','wood','wood flooring','wood stain'],
  'CR-STD-011': ['bed','bed frame','bed sheet','bedding','bedroom','blanket','cushion','drawer','duvet','floor','furniture','grey','hardwood','home','interior design','lamp','lampshade','light fixture','lighting','linens','mattress','nightstand','pillow','room','throw pillow'],
  'CR-VIL-012': ['apartment','bed','bed frame','bed sheet','bedding','bedroom','ceiling','chair','comfort','couch','cushion','daybed','den','design','floor','flooring','furniture','hardwood','home','hotel','interior design','lamp','linens','living room','mattress','pillow','room','suite','throw pillow','wood flooring','wood stain'],
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
