import {
  CLOUD_NAME,
  HERO_PUBLIC_ID,
  TYPED_TAGS,
  chapters,
  machineFacets,
  machineTags,
  roomBySku,
  formatTime,
} from './data.js';
import { after, BREAKPOINTS } from './media.js';
import { features } from './features.js';
import { renderChrome, renderGrid, renderReviews } from './shared.js';

renderChrome('after');

/* ---------- grid ---------- */

// Machine tags come from the Google Auto Tagging add-on, which is not on every
// cloud — it cannot be enabled through the API, only the console, and a
// claimable cloud has to be claimed before anyone can get there. So fall back
// to the hand-typed tags rather than rendering an empty facet row.
const hasMachineTags = features.machineTags && machineFacets.length > 0;

const highlightTile = renderGrid(document.querySelector('[data-grid-section]'), {
  facets: hasMachineTags ? machineFacets : TYPED_TAGS,
  tagsFor: hasMachineTags ? (sku) => machineTags[sku] ?? [] : undefined,
  imageUrl: after.roomImage,
  previewUrl: features.hoverPreviews ? after.roomPreview : undefined,
});

renderReviews(document.querySelector('[data-reviews]'));

/* ---------- player ---------- */

const host = document.querySelector('[data-player]');

/**
 * The player is built on demand.
 *
 * Until someone presses play the hero is an `e_preview` loop — an AI-chosen
 * summary of the video, playing silently — so the page opens with motion
 * instead of a still frame, and nothing of the real stream is fetched. The
 * first interaction swaps in the player and starts playback.
 */
let player = null;
const playerReady = [];

/** Runs `fn` once the player exists, building it on the first call. */
function withPlayer(fn) {
  if (player) return fn(player);
  playerReady.push(fn);
  if (playerReady.length === 1) buildPlayer();
}

function buildPlayer(autoplay = false) {
  const el = document.createElement('video');
  el.className = 'cld-video-player cld-fluid';
  el.playsInline = true;
  host.replaceChildren(el);

  player = createPlayer(el);
  attachSource(player, autoplay);

  for (const fn of playerReady.splice(0)) fn(player);
  return player;
}

function createPlayer(el) {
  return window.cloudinary.videoPlayer(el, {
    cloudName: CLOUD_NAME,
    // Adaptive streaming: the player negotiates rendition instead of pulling one MP4.
    sourceTypes: features.adaptiveStreaming ? ['hls'] : ['mp4'],
    // `breakpoints` must stay OFF while adaptive streaming is on. It makes the
    // player prepend a resize (c_limit,w_…) to the source URL, and Cloudinary
    // rejects a resize combined with sp_auto — the streaming profile already
    // defines the rendition ladder. Breakpoints are for the MP4 path only.
    ...(features.adaptiveStreaming
      ? {}
      : { breakpoints: { enabled: true, sizes: BREAKPOINTS } }),
    seekThumbnails: features.seekThumbnails,
    chaptersButton: features.chapters,
    fluid: features.responsivePlayer,
    controls: true,
    showLogo: false,
    // Player chrome sits over dark footage, so `text` must be LIGHT — the page's
    // Polar Night text token renders the controls nearly invisible on video.
    colors: { accent: '#88c0d0', base: '#0b1015', text: '#eceff4' },
  });
}

function attachSource(player, autoplay) {
  player.source(HERO_PUBLIC_ID, {
    // Auto-generated chapters: loads costera/hero-tour-chapters.vtt
    ...(features.chapters ? { chapters: true } : {}),
    // AI-selected poster keyframe rather than frame zero. Skipped when the
    // preview loop is the opening frame — there is no poster to choose.
    ...(features.aiPoster && !features.previewLoopPoster
      ? { posterOptions: { transformation: { start_offset: 'auto' } } }
      : {}),
    // Title and description in the player's title bar. `true` reads the values
    // straight from the asset's context metadata, which `auto_video_details`
    // wrote at upload — the player only falls back to generating them if no
    // value is stored, and that fallback is a request happening mid-demo.
    ...(features.titleAndDescription ? { title: true, description: true } : {}),
    // English captions from auto-transcription; es/fr from its translations.
    // Omitting `url` lets the player resolve the .transcript for this public ID.
    ...(features.captions
      ? {
          textTracks: {
            captions: { label: 'English', default: true },
            subtitles: [
              // Translated subtitles need the Google Translation add-on. Where
              // it is absent the .es/.fr transcripts were never produced, so
              // these entries are skipped rather than left loading nothing.
              ...(features.translatedSubtitles
                ? [
                    { label: 'Español', language: 'es', url: after.transcript('es') },
                    { label: 'Français', language: 'fr', url: after.transcript('fr') },
                  ]
                : []),
              // Audio description, as a subtitles track — the player has no
              // native descriptions kind, so this is described *text*: the
              // visual transcription from AI Video Analysis, describing what
              // is on screen rather than what is said.
              { label: 'AD', language: 'en', url: after.audioDescription },
            ],
            options: { theme: 'player-colors' },
          },
        }
      : {}),
    // Clickable regions over the rooms as they appear.
    ...(features.hotspots
      ? {
          interactionAreas: {
            enable: true,
            template: chapters.map((c) => ({
              left: 8,
              top: 62,
              width: 34,
              height: 30,
              id: c.sku,
            })),
            onClick: (event) => addToCart(event?.item?.id),
          },
          interactionDisplay: { enable: true, template: 'pulsing' },
        }
      : {}),
  });

  if (features.chapters) bindChapterRail(player);
  if (autoplay) void player.play();
}

/**
 * The opening frame: an `e_preview` summary loop playing silently, with a
 * play affordance over it. Clicking anywhere builds the real player and starts
 * playback, so the full stream is never fetched until someone wants it.
 */
function mountPreviewLoop() {
  const wrap = document.createElement('button');
  wrap.className = 'preview-loop';
  wrap.type = 'button';
  wrap.setAttribute('aria-label', 'Play the property tour');
  wrap.innerHTML = `
    <video src="${after.heroPreviewLoop}" poster="${after.heroPreviewPoster}"
           muted loop playsinline preload="metadata"></video>
    <span class="preview-loop__badge">AI preview</span>
    <span class="preview-loop__play" aria-hidden="true"></span>
  `;

  const loop = wrap.querySelector('video');
  // Autoplay is only permitted while muted, and can still be refused.
  void loop.play().catch(() => {});

  wrap.addEventListener('click', () => {
    loop.pause();
    buildPlayer(true);
  });

  host.replaceChildren(wrap);
}

const seek = (seconds) =>
  withPlayer((p) => {
    p.currentTime(seconds);
    void p.play();
  });

/* ---------- room rail ---------- */

/*
 * The rail renders immediately, before the player exists — selecting a room
 * is one of the things that can build the player. Its playback-following
 * behaviour is attached separately, once the player is there.
 */
let setActiveRoom = () => {};

if (features.chapters) {
  const rail = document.querySelector('[data-rail]');
  rail.hidden = false;
  rail.innerHTML = `<h3 class="rail__title">In this tour</h3>`;

  const items = chapters.map((c) => {
    const room = roomBySku(c.sku);
    const b = document.createElement('button');
    b.className = 'rail__item';
    b.dataset.sku = c.sku;
    b.innerHTML = `
      <img src="${after.railThumb(c.sku)}" alt="">
      <span>
        <span class="rail__name">${room.name}</span><br>
        <span class="rail__meta">${formatTime(c.start)} · $${room.price}</span>
      </span>
    `;
    b.addEventListener('click', () => {
      setActiveRoom(c.sku);
      seek(c.start);
    });
    rail.append(b);
    return b;
  });

  setActiveRoom = (sku) => {
    for (const b of items) b.setAttribute('aria-current', String(b.dataset.sku === sku));
    highlightTile(sku);
  };
}

/** Follows playback position and highlights the room being shown. */
function bindChapterRail(player) {
  let lastSku;
  player.on('timeupdate', () => {
    const t = player.currentTime();
    const match = chapters.find((c) => t >= c.start && t < c.end);
    if (match?.sku !== lastSku) {
      lastSku = match?.sku;
      setActiveRoom(lastSku);
    }
  });
}

/* ---------- hotspot -> cart ---------- */

const cart = [];
function addToCart(sku) {
  if (!sku || cart.includes(sku)) return;
  cart.push(sku);
  const notice = document.querySelector('[data-cart]');
  notice.hidden = false;
  notice.innerHTML = `<strong>Added from the tour:</strong> ${cart
    .map((s) => roomBySku(s)?.name)
    .join(', ')}`;
}

/* ---------- searchable transcript ---------- */

if (features.transcript) {
  const section = document.querySelector('[data-transcript]');
  section.hidden = false;
  section.innerHTML = `
    <div class="section-head">
      <h2>Transcript</h2>
      <input class="search" type="search" placeholder="Search the tour…" data-search>
    </div>
    <div class="transcript" data-cues><p class="muted" style="padding:12px">Loading transcript…</p></div>
  `;

  const cuesEl = section.querySelector('[data-cues]');
  const searchEl = section.querySelector('[data-search]');

  // The transcript is Cloudinary's JSON (cues with word-level timings), not
  // WebVTT — so it is fetched and rendered here rather than handed to the player.
  fetch(after.transcript())
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((cues) => {
      const paint = () => {
        const q = searchEl.value.trim().toLowerCase();
        const shown = q
          ? cues.filter((c) => c.transcript.toLowerCase().includes(q))
          : cues;

        if (!shown.length) {
          cuesEl.innerHTML = `<p class="muted" style="padding:12px">No matches.</p>`;
          return;
        }

        cuesEl.replaceChildren(
          ...shown.map((cue) => {
            const start = cue.words?.[0]?.start_time ?? 0;
            const b = document.createElement('button');
            b.className = 'transcript__cue';
            b.innerHTML = `<span class="transcript__time">${formatTime(start)}</span><span>${cue.transcript.trim()}</span>`;
            b.addEventListener('click', () => seek(start));
            return b;
          }),
        );
      };
      searchEl.addEventListener('input', paint);
      paint();
    })
    .catch(() => {
      cuesEl.innerHTML = `<p class="muted" style="padding:12px">Transcript unavailable.</p>`;
    });
}

/* ---------- structured data ---------- */

if (features.titleAndDescription) {
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'Life on the Seven Mile Miracle',
    description:
      'Explore the unique experience of growing up on the shores of a beautiful island.',
    duration: 'PT3M3S',
    hasPart: chapters.map((c) => ({
      '@type': 'Clip',
      name: c.title,
      startOffset: c.start,
      endOffset: c.end,
    })),
  });
  document.head.append(ld);
}

/* ---------- opening frame ---------- */

if (features.previewLoopPoster) {
  mountPreviewLoop();
} else {
  buildPlayer();
}
