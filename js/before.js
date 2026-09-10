import { TYPED_TAGS } from './data.js';
import { before } from './media.js';
import { renderChrome, renderGrid, renderReviews } from './shared.js';

renderChrome('before');

/*
 * The before-state player is a plain <video> tag. Its deficiencies are
 * structural, not cosmetic:
 *  - one progressive MP4 from origin, no adaptive streaming
 *  - poster is frame zero
 *  - fixed 16:9 box, so it letterboxes in a portrait viewport
 *  - no captions, no transcript, no chapters, no title bar
 *  - the browser's default scrub bar: no thumbnail previews
 */
document.querySelector('[data-player]').innerHTML = `
  <video controls preload="metadata" poster="${before.heroPoster}" src="${before.heroVideo}"></video>
`;

/*
 * Note: the five rooms that appear in the tour are not linked from this page.
 * A guest who sees a room in the video has no way to reach it.
 */

renderGrid(document.querySelector('[data-grid-section]'), {
  facets: TYPED_TAGS,
  imageUrl: before.roomImage,
});

renderReviews(document.querySelector('[data-reviews]'));
