# FilmCompass

Find your next film through your favourites, tonight’s mood, an actor or language, or a natural-language conversation.

**Live demo:** https://thefilmcompass.vercel.app/

**Source:** https://github.com/TurnerCrypt/filmcompass

Built for the Qloo Agentic Hackathon. The live application connects Gemini, Qloo, OMDb, Wikidata and an optional Upstash Redis cache. No account is needed to try it.

## Four discovery paths

- **Your Taste:** choose up to five films. Qloo resolves titles and recommends related films from its taste graph.
- **Your Mood:** request a genre or mood without supplying a favourite. Genre discovery uses Qloo; a named reference film can provide a clearly disclosed fallback.
- **Actor & Language:** verified Wikidata cast or original-language records produce a film shortlist, enriched with OMDb details. These paths are labelled separately from Qloo taste recommendations.
- **Ask FilmCompass:** Gemini interprets preferences into a validated structured plan. Follow-ups preserve or change genre, runtime, actor, language and favourite-film preferences. Film titles and ratings are retrieved from providers rather than generated as final results.

Movie cards show available posters, year, genres, runtime, IMDb rating and match explanations. Live search covers provider-listed movies across release years 1888–2026, with up to 30 returned candidates; twelve per search receive OMDb detail lookups. Save for later and Already watched persist in browser storage, with remove/undo controls. Watched films are hidden from displayed recommendation sets.

## Run locally

Requires Node.js 24.x. There are no third-party npm dependencies.

```powershell
Copy-Item .env.example .env
node build-pages.mjs
npm start
```

Keep an existing .env file rather than overwriting saved keys. Open http://127.0.0.1:4173/ or the port configured with PORT.

Configure these privately in .env or the hosting provider:

```env
QLOO_API_KEY=
OMDB_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
KV_REST_API_URL=
KV_REST_API_TOKEN=
PORT=4173
```

UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are also accepted. The full read/write token is required. Never expose keys in browser code or commits; .env is ignored. Restart/redeploy after changing environment variables.

Qloo hackathon access uses https://hackathon.api.qloo.com. Favourite-based discovery requires Qloo; free-text interpretation additionally requires Gemini. OMDb supplies available ratings and metadata. Actor/language records use public Wikidata APIs.

## Deploy on Vercel

Import this repository, choose the Other framework preset, keep the repository root, and set private environment variables for Production and Preview. vercel.json runs build-pages.mjs, publishes dist and supplies API function limits. Connect Upstash Redis for shared caching, then deploy. The public production domain must be accessible without a Vercel login.

GET /api/config returns availability flags and sharedCache status. A ready cache status confirms a temporary Redis value was written and read, without exposing credentials. Static-only hosting cannot run the API routes. Netlify adapters remain in the repository for compatibility; Vercel is the current production host.

## Quota protection

The browser caches scores for seven days and requests ratings only as labels enter view. Server lookups share successful OMDb responses for seven days, cache not-found responses for an hour, and deduplicate calls within an instance. Redis shares these records across instances when configured. Quota errors pause uncached lookups for an hour. Searches and recommendation sets cap detail lookups at twelve candidates. Concurrent cold starts may still repeat a request; the free provider quota is not unlimited.

## Architecture

- dist/: landing page, four discovery pages, styles, browser logic and local watchlist storage.
- build-pages.mjs: generates discovery pages from the shared HTML template.
- api/ and api-handler.mjs: Vercel adapters and validated request routing.
- qloo.mjs: title resolution, release-year choices and taste recommendations.
- conversation.mjs: Gemini preference extraction and workflow orchestration.
- preferences.mjs and explanations.mjs: verified filtering and transparent reasons.
- actor-movies.mjs and language-movies.mjs: Wikidata record discovery.
- movie-search.mjs: all-year search and provider orchestration.
- ratings.mjs, movie-ratings.mjs, omdb-cache.mjs: verified metadata and quota protection.
- server.mjs: local HTTP server.
- test/: Node tests with invented provider fixtures, never real credentials or saved Qloo responses.

## Verification and limits

Run npm test. See QA.md for the latest production checks and remaining manual checks. Tests cover input validation, provider errors, title ambiguity, filters, metadata handling, cache behaviour and watchlist persistence.

Provider coverage is incomplete. IMDb scores may be unavailable or cached. Genres guide mood matching but cannot guarantee tone. Rankings apply to the returned shortlist, not all films worldwide. Cast/voice credits and language coverage vary by source; dubbed streaming availability is not verified. Sample results are fixed examples and remain explicitly labelled. Movie discovery is supported; live TV recommendations are not.

Rate limits are per instance. Preferences and watchlists stay in browser memory/storage, while requests go to Google, Qloo, OMDb and/or Wikidata as required. Browser data does not sync between devices. Real-device visual checks and broader provider coverage tests remain part of pre-submission review.

## License and credits

Original code: MIT (see LICENSE). Movie artwork, metadata, trademarks and provider outputs retain their own rights and terms. See THIRD_PARTY_NOTICES.md. Wikidata statements are CC0. An open-source code license does not grant rights to third-party posters or data.

