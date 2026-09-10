import { CLOUD_NAME, HERO_PUBLIC_ID, chapters } from './data.js';

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`;

/**
 * BEFORE state media — served from this app's own origin, NOT from Cloudinary.
 *
 * That is the whole point: files sit on the origin as uploaded, every visitor
 * downloads the same bytes, and there is no CDN, no transformation layer and no
 * format or quality negotiation in front of them.
 *
 *  - one 31 MB progressive MP4, the only rendition that exists
 *  - poster is frame zero, extracted once by hand
 *  - room tiles are the original camera JPEGs, downscaled by the browser
 */
export const before = {
  heroVideo: 'media/hero-tour.mp4',
  heroPoster: 'media/poster.jpg',
  roomImage: (sku) => `media/${sku}.jpg`,
};

/**
 * AFTER state media. Every URL is built from the transformation reference.
 * Note f_auto and q_auto must be SEPARATE components — `f_auto/q_auto`, never
 * `f_auto,q_auto`.
 */
export const after = {
  /** Adaptive streaming. The player builds this itself from sourceTypes: ['hls']. */
  heroStream: `${BASE}/video/upload/sp_auto/${HERO_PUBLIC_ID}.m3u8`,

  /** Portrait variant: g_auto finds the subject instead of centre-cropping. */
  heroPortrait: `${BASE}/video/upload/c_fill,g_auto,h_1280,w_720/sp_auto/${HERO_PUBLIC_ID}.m3u8`,

  chaptersVtt: `${BASE}/raw/upload/${HERO_PUBLIC_ID}-chapters.vtt`,
  spriteVtt: `${BASE}/video/upload/fl_sprite/${HERO_PUBLIC_ID}.vtt`,

  /**
   * AI-summarized preview loop, used in place of a static poster.
   *
   * `e_preview` picks the most interesting segments and stitches them into a
   * short reel — so the hero moves before anyone presses play, and what it
   * shows is chosen by content analysis rather than by a timestamp someone
   * guessed. Syntax: e_preview[:duration_<s>][:max_seg_<n>][:min_seg_dur_<s>].
   *
   * NOTE: the first request for an un-derived preview returns HTTP 423 while
   * Cloudinary builds it asynchronously. It must be warmed before a live demo —
   * see the pre-flight check in the Phase 3 harness.
   */
  heroPreviewLoop: `${BASE}/video/upload/e_preview:duration_10.0:max_seg_3:min_seg_dur_2.0/f_auto/q_auto/${HERO_PUBLIC_ID}.mp4`,

  /** Still frame behind the preview loop, so there is never an empty box. */
  heroPreviewPoster: `${BASE}/video/upload/so_auto/c_fill,g_auto,w_1280/f_auto/q_auto/${HERO_PUBLIC_ID}.jpg`,

  transcript: (lang) =>
    `${BASE}/raw/upload/${HERO_PUBLIC_ID}${lang ? `.${lang}` : ''}.transcript`,

  /**
   * Audio description track.
   *
   * NOT PRESENT on the cloud this file points at — it 404s on dxuiuruim, and
   * cannot be produced there: the analysis endpoint has no MCP tool, so an
   * agent working through the MCP has no API secret to sign the call with. It
   * works on a self-provisioned cloud, where CLOUDINARY_URL carries the secret
   * (verified: HTTP 201, completed in ~45s). See the README.
   *
   * This is the visual transcription from Cloudinary's AI Video Analysis:
   * timestamped descriptions of what is on screen, as opposed to the
   * spoken-word transcript. It is offered as a `textTracks.subtitles` entry
   * labelled "AD" because the player has no native audio-description track
   * kind — so it is described *text*, not described audio.
   *
   * To produce it: POST /v2/video/<cloud>/ai_video_analysis with the asset id
   * (async, beta, needs an API secret), poll the returned job until
   * `completed`, then store the result at the public ID below. The output is
   * JSON in the same cue shape as .transcript, so the player reads it the
   * same way. Then uncomment the AD track.
   */
  audioDescription: `${BASE}/raw/upload/${HERO_PUBLIC_ID}.visual.transcript`,

  /** Room tiles: cropped to the tile, with automatic format and quality. */
  roomImage: (sku) =>
    `${BASE}/image/upload/c_fill,g_auto,h_600,w_800/f_auto/q_auto/costera/tiles/${sku}.jpg`,

  railThumb: (sku) =>
    `${BASE}/image/upload/c_fill,g_auto,h_72,w_96/f_auto/q_auto/costera/tiles/${sku}.jpg`,

  /**
   * Short muted loop cut from the master at the timestamp where that room
   * appears. Rooms not in the tour get no preview — there is no footage to loop.
   */
  roomPreview: (sku) => {
    // Cut from the chapter that features this room, so hovering a tile and
    // clicking its chapter show the same moment. Rooms with no chapter get no
    // preview — there is no footage of them to loop.
    const chapter = chapters.find((c) => c.sku === sku);
    if (!chapter) return undefined;
    // Trim and crop are separate actions, so they need separate components.
    // Putting du_/so_ in the same component as c_fill returns HTTP 400.
    return `${BASE}/video/upload/du_4,so_${chapter.start}/c_fill,g_auto,h_400,w_400/f_auto/q_auto/${HERO_PUBLIC_ID}.mp4`;
  },
};

/**
 * Responsive breakpoints, pinned explicitly rather than left open. Every variant
 * the player can request at these widths must be derived and warm before a demo —
 * an un-derived variant requested for the first time live is a visible stall.
 */
export const BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1600, 1920];
