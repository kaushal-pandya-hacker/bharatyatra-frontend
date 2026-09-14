# Data Quality Rules — Chalo Farva

## Validation Rules
1. **Coordinates Bounds**: All Gujarat entities must fall within Latitude `[20.0, 25.0]` and Longitude `[68.0, 75.0]`.
2. **Slug Uniqueness**: Slugs must be lowercased kebab-case and unique across destinations.
3. **Source Requirement**: Every record must map to a valid `sourceId` in `sources.json`.
4. **No Guesses**: Unknown opening hours or ticket prices must be recorded as `null` / `UNKNOWN`.
