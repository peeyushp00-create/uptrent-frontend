// Shape of a single Instagram Reel as the SocialRum backend already returns
// it (see backend/src/lib/instagramProviders.js mapScraperReel() and
// backend/src/routes/hikerReels.js normalizeReel()). The backend maps the
// scraper's raw `thumbnail_url` field to `thumbnail` before it ever reaches
// the frontend — this type follows that existing convention rather than
// introducing a separate `thumbnail_url` field.
export interface Reel {
  id?: string | number | null;
  permalink?: string | null;
  thumbnail?: string | null;
  caption?: string | null;
  username?: string | null;
  full_name?: string | null;
  is_verified?: boolean | null;
  profile_pic_url?: string | null;
  followers?: number | null;
  audio_title?: string | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  views?: number | null;
  posted_at?: string | null;
  virality?: { score: number; label: string } | null;
}
