# FilmCompass verification — 14 October 2026

Production: https://thefilmcompass.vercel.app/

## Verified

- All four discovery page URLs respond successfully.
- Favourite-based request: Superbad, comedy, under two hours — 10 live results.
- Genre-only request: horror — 10 live results.
- Actor request: Denzel Washington thriller — 6 verified cast results.
- Language request: Korean horror — 9 results after narrowing the language query.
- Redis credentials work on production: a temporary cache value was written and read successfully. No credentials are exposed by the health response.
- Automated coverage includes saved-list reload persistence, watched exclusion state, undo, storage failure, title variants, genre/runtime constraints, provider errors and source verification.

## Still to verify before submission

- Real desktop and mobile visual/interactions review on all four pages; HTTP checks do not verify layout or clicks.
- Current watchlist controls, menu navigation, moving poster shelf pause, and reduced-motion behaviour on an actual phone.
- Broader actor/language coverage. A small successful request set is not universal coverage.
- Shared cache behaviour under simultaneous cold starts and quota usage over a full day. Redis read/write health confirms connectivity, not a complete traffic audit.
- Devpost description, screenshots, README cleanup and license visibility in repository About section.

Language and actor discovery use recorded Wikidata credits; favourite-based recommendations and genre discovery use Qloo. Available ratings and movie details come from OMDb. Source labels distinguish these paths.

