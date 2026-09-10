import { BRAND, rooms, machineTags, roomBySku } from './data.js';

/**
 * Shared rendering for both states. The before and after pages call the same
 * functions with different media resolvers — so the two states cannot drift
 * apart, which is the whole point of keeping them in one repo.
 */

export function renderChrome(state) {
  document.querySelector('[data-brand]').textContent = BRAND.name;
  document.querySelector('[data-tagline]').textContent = BRAND.tagline;
  document.querySelector('[data-property]').textContent = BRAND.property;
  document.querySelector('[data-lede]').textContent = BRAND.lede;
  document.querySelector('[data-footer]').textContent = `${BRAND.name} · ${BRAND.property}`;

  const badge = document.querySelector('[data-state-badge]');
  badge.textContent = state;
  badge.className = `state-badge state-badge--${state}`;
}

/**
 * @param {object} opts
 * @param {string[]} opts.facets            facet values to show as chips
 * @param {(sku:string)=>string} opts.imageUrl
 * @param {(sku:string)=>string[]} [opts.tagsFor]   defaults to the typed tags
 * @param {(sku:string)=>string|undefined} [opts.previewUrl]
 */
export function renderGrid(root, opts) {
  const { facets, imageUrl, tagsFor, previewUrl } = opts;
  let active = null;

  const tagsOf = (sku) => (tagsFor ? tagsFor(sku) : (roomBySku(sku)?.tags ?? []));

  root.innerHTML = `
    <h2>Rooms &amp; suites</h2>
    <div class="facets" data-facets></div>
    <div class="grid" data-grid></div>
    <p class="muted" data-empty hidden>No rooms match that filter.</p>
  `;

  const facetsEl = root.querySelector('[data-facets]');
  const gridEl = root.querySelector('[data-grid]');
  const emptyEl = root.querySelector('[data-empty]');

  const chip = (label, value) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = label;
    b.setAttribute('aria-pressed', String(active === value));
    b.addEventListener('click', () => {
      active = value;
      paint();
    });
    return b;
  };

  function paint() {
    facetsEl.replaceChildren(chip('All', null), ...facets.map((f) => chip(f, f)));

    const visible = active ? rooms.filter((r) => tagsOf(r.sku).includes(active)) : rooms;
    emptyEl.hidden = visible.length > 0;

    gridEl.replaceChildren(
      ...visible.map((room) => {
        const preview = previewUrl?.(room.sku);
        const el = document.createElement('article');
        el.className = 'tile';
        el.dataset.sku = room.sku;
        el.innerHTML = `
          <div class="tile__media">
            <img src="${imageUrl(room.sku)}" alt="${room.name}" loading="lazy">
            ${preview ? `<video src="${preview}" muted loop playsinline preload="none"></video>` : ''}
          </div>
          <div class="tile__body">
            <h3 class="tile__name">${room.name}</h3>
            <span class="tile__price">$${room.price} <span>/ night</span></span>
          </div>
        `;
        const vid = el.querySelector('video');
        if (vid) {
          el.addEventListener('mouseenter', () => void vid.play().catch(() => {}));
          el.addEventListener('mouseleave', () => vid.pause());
        }
        return el;
      }),
    );
  }

  paint();

  /** Highlight one tile — used by the after state when a chapter is reached. */
  return function highlight(sku) {
    for (const t of gridEl.querySelectorAll('.tile')) {
      t.dataset.highlighted = String(t.dataset.sku === sku);
    }
  };
}

export function renderReviews(root) {
  root.innerHTML = `
    <h2>Video reviews — coming soon</h2>
    <div class="reviews__empty">Guest video reviews will appear here.</div>
  `;
}

export { machineTags };
