/**
 * Phase 2 feature toggles.
 *
 * Each flag is one beat of the sales script. The agent flips these one at a time
 * while the seller talks, so they must be independently switchable and the page
 * must render correctly with any subset enabled.
 */
export const features = {
  /** HLS with automatic profile selection, in place of one progressive MP4. */
  adaptiveStreaming: true,
  /** AI-selected keyframe instead of frame zero. */
  aiPoster: true,
  /**
   * Instead of a static poster, open with an AI-summarized preview loop
   * (`e_preview`) that plays silently; clicking it loads the real player.
   * Supersedes aiPoster as the opening frame when enabled.
   */
  previewLoopPoster: true,
  /** Short muted loops on grid tiles on hover. */
  hoverPreviews: true,
  /** Auto-generated chapters, each bound to the room shown in that segment. */
  chapters: true,
  /** Thumbnail previews on the scrub bar. */
  seekThumbnails: true,
  /** Clickable regions tracking rooms as they appear, each with book-now. */
  hotspots: true,
  /**
   * Machine-generated tags driving the facets, replacing the five typed ones.
   *
   * ADD-ON: needs Google Auto Tagging. Falls back to the typed tags when the
   * tags are not there, so this is safe to leave on — but on a cloud without
   * the add-on the facets will be the before-state ones, typo included.
   */
  machineTags: true,
  /** Player fills its container; portrait variant is a g_auto crop of the master. */
  responsivePlayer: true,
  /** English captions from auto-transcription. Free on any cloud. */
  captions: true,
  /**
   * Spanish and French subtitles.
   *
   * ADD-ON: needs Google Translation. Add-ons cannot be enabled through the
   * API — only the console, which on a claimable cloud means claiming it
   * first. Leave this off on a cloud without the add-on: requesting
   * `translate` there fails the entire transcription, not just the
   * translations.
   */
  translatedSubtitles: true,
  /** Searchable transcript panel beneath the player. */
  transcript: true,
  /** Generated title/description in the title bar, and as page structured data. */
  titleAndDescription: true,
};
