# The demo prompt

Paste this into Claude Code at the root of this repo — the demo lives in
`docs/`. It provisions a fresh Cloudinary cloud, migrates the media onto it, and
rewires the storefront to use it, in one pass.

The migration takes a few minutes: uploads, then waiting on transcription and
chaptering, then warming derivations. Talk over it.

Before a demo, check `git status` is clean so you can reset afterwards.

---

```
I run Costera Playa Azul, a coastal resort, and our room-booking page isn't
working for us.

Guests watch the property tour, but it opens on a black frame so most never
press play. They can't skip to the room they care about, there are no captions,
and international guests can't follow the narration. When someone likes a room
in the video there's no way to book it. On phones the player has black bars.

It's also slow. We serve one big video file to everyone, one encode at one
resolution, whether you're on fibre or a phone with two bars — and if it stalls
there's nothing lighter to fall back to. We pay to push all those bytes even to
guests who watch ten seconds.

And it's all manual. Our five room tags are hand-typed and one is a typo of
another; nobody noticed for months. Every new video means someone making
thumbnails and writing chapter lists by hand.

We're not on Cloudinary yet — set us up from scratch and move our media across,
then fix the storefront to use it. Our files are in docs/media/. Improve the page in
place; don't send me to a different page or build me a new one.

Things only we know, so you don't have to guess. Three rooms appear in the tour,
and these are the timestamps:

  0:10  Oceanfront Suite    CR-OCS-001
  0:26  Beach Pavilion      CR-PVL-002
  0:32  Penthouse Terrace   CR-PNT-004

Put the book-now hotspot in the lower left of the frame — roughly 8% from the
left, 62% down, about a third of the width. That's where the water is calmest
and it won't cover anything.

- Don't quote me a performance number — nothing here is measured yet.
- If something I've assumed doesn't work that way, tell me instead of
  approximating it.
- Keep the page working after each step.
- Tell me at the end how I keep the account.
```

---

## What it should do

**Migrate**

- provision a cloud with `npx @cloudinary/cloud` — no signup, writes
  `CLOUDINARY_URL` to `./.env`, prints a claim URL
- upload the master video with transcription (+ Spanish and French), chaptering
  and tagging requested on the upload call
- upload the twelve room images with auto-tagging
- poll until the async analysis completes — it can fail, not just wait
- warm the derivations, `e_preview` especially

**Rewire**

- adaptive streaming (`sp_auto`) instead of one progressive file
- `e_preview` loop as the opening frame, click to load the player
- generated chapters, bound to a room rail
- captions from auto-transcription, plus Spanish and French
- searchable transcript, click to seek
- hotspots over the rooms, each adding to cart
- fluid player
- machine-generated tags replacing the five typed ones
- seek thumbnails, generated title and description

**Close**

- hand back the claim URL. The cloud expires in 24 hours unless claimed — that
  link is what turns the demo into the prospect's own account.

## Reset

```sh
git checkout -- . && rm -f .env
```

## Notes

The `cloudinary-video` skill in `skills/` carries the
provisioning steps, player option shapes, and the failure modes worth knowing —
async features that fail rather than degrade, HTTP 423 on un-derived variants,
upload presets that rewrite assets on ingest. The prompt stays short because
that knowledge is loaded rather than pasted.

`docs/after.html` is the finished reference if you want to see where a run should end
up. It points at the pre-provisioned cloud, so it keeps working regardless.
