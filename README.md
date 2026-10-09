# FilmCompass

A film-club-inspired movie discovery app built for the Qloo Agentic Hackathon. Pick favourite films from a poster catalog, explore curated sample recommendations, and see IMDb ratings supplied by OMDb.

**Status:** working local prototype. IMDb ratings are connected when an OMDb key is configured. The Qloo integration is implemented but awaiting live verification. The Projection Room conversation is a scripted demo, not a completed AI agent.

## Run locally

Requires **Node.js 24 or newer**. No third-party packages need installing.

```powershell
Copy-Item .env.example .env
npm start
```

Open **http://127.0.0.1:4173/**. To use another port, set `PORT` in `.env`. The active development preview currently uses 4174.

If you already have a `.env` file, keep it; do not overwrite your saved keys.

## API keys

Edit `.env` privately:

```env
QLOO_API_KEY=
OMDB_API_KEY=
PORT=4173
```

Both keys are optional for trying the sample experience. Restart the server after changing them.

- Request hackathon Qloo access through the [developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide). Hackathon keys work only at `https://hackathon.api.qloo.com`.
- Request an [OMDb key](https://www.omdbapi.com/apikey.aspx) and activate it as instructed by the provider.
- Never put keys in browser code, screenshots, chat, or commits. `.env` is ignored by Git.

## Features

- Movie poster shelf with animated selections.
- Searchable sample catalog of movies and shows with year and type filters.
- Up to five favourites, removable individually.
- IMDb rating labels on the shelf, picker, selected favourites, and results. Scores are fetched through the server; loading and unavailable states are explicit.
- Curated sample picks by mood, with an under-two-hours filter.
- Projection Room guided conversation for testing the intended interaction.
- Responsive layout and reduced-motion support.

### Live Qloo path

`POST /api/recommendations` looks up movie titles through `/search`, requires an exact and unambiguous movie match, and uses entity IDs with `GET /v2/insights`. It excludes input movies and duplicates. Request validation, timeouts, upstream errors, and empty results are handled separately. A failed live request never silently becomes a sample recommendation.

**Limitations:** real search/insights schemas and optional metadata remain unverified pending Qloo access. Live recommendations currently support movies only. Mood matching, TV recommendations, free-form AI conversation, and title disambiguation UI remain future work. Unknown runtimes are not guessed.

## Project structure

```text
 dist/                 Browser interface, styling, logo and client code
 server.mjs            Local HTTP server and API routes
 qloo.mjs              Qloo request validation and recommendation pipeline
 ratings.mjs           OMDb rating lookup, caching and response filtering
 catalog.json          Public-source movie/show metadata and artwork URLs
 test/                 Automated tests using invented API fixtures
 .env.example          Empty configuration template
 THIRD_PARTY_NOTICES.md Data and artwork credits
 LICENSE               MIT license for original project code
```

## Checks

```powershell
npm test
node --check server.mjs
node --check dist/app.js
```

The test runner uses Node 24's no-isolation mode for compatibility with the development environment. API tests use mocks, not saved Qloo output or real keys. Live Qloo validation must still be completed. Mobile emulation has been reviewed by the project owner; real-device testing is pending.

## Deployment

`server.mjs` binds to loopback and is intended for local development. The `.openai/hosting.json` file belongs to the existing private Sites project and currently describes only static assets. Production deployment must include the backend and server-side secrets; publishing static files alone will not enable live API routes. Rate limiting and rating caching are in-memory and require review for production use.

## GitHub preparation

The folder is a local Git repository. Review `git status --short` before committing, and confirm `.env` stays ignored. No GitHub repository has been created or pushed yet. Never upload Qloo response data. Review third-party usage terms before publishing or commercial use.

## License and credits

Original project code is available under the [MIT license](LICENSE). This does not grant rights to third-party movie posters, data, trademarks, or logos. See [third-party notices](THIRD_PARTY_NOTICES.md) and the artwork source links inside the app.
