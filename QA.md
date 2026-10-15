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


## Regression pass — 15 October 2026

- Fixed cross-page favourites leaking into Ask FilmCompass, Your Mood and Actor & Language. Selection persistence is now scoped to landing/taste pages.
- Fresh standalone requests reset prior search context; follow-ups can preserve it.
- Inclusive minYear/maxYear validation and filtering apply to taste, genre, actor and language candidates.
- Live stale-state test: Frozen + “i need thriller movies from 2021-2026” returned 10 results, all within bounds, with no Frozen favourite.
- Live follow-up: “Under two hours, keep everything else” retained dates and returned five results.
- Live fresh comedy search cleared the previous date/genre constraints and returned ten results.
- Live Denzel thriller range 2021–2026 returned two verified matches from 2023 and 2021.
- Reversed 2026–2021 bounds returned an explicit validation error.
- 53 automated tests passed, including new stale-state and year-boundary regressions.
- New-conversation UI clears previous results; failed requests explicitly distinguish any previous successful lineup.
- Not a claim of exhaustive correctness: browser interaction/mobile visual review and broader language/actor coverage remain manual review items.
