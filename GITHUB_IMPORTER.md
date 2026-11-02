# Hair & Makeup source delivery

The current prepared prompt is `AIPPY_UPDATE_PROMPT.txt`; release identities are in `docs/import-release.json`.

- Source snapshot: `bac15dcf2e7422dce80ff6e26bb6e4217f72de67`
- Manifest snapshot: `8084bbec1c9a84cf16a7ef34aae0f214c8253162`
- Game files: 113
- Asset keys: 10

The Node-only Vite importer verifies immutable URLs, SHA-256 and file sizes, stages downloads before promotion and rolls back failures. It preserves the host entry, developer utilities and unrelated assets. Ordinary repository builds keep `github-import.config.json` disabled.

The source and manifest use different commits intentionally: game URLs pin the verified source snapshot, and the separate manifest commit makes the manifest itself immutable. A completed request is idempotent and preserves later Aippy source edits.

After Aippy runs the prompt, its actual build and receipt must still be inspected. Publishing this repository does not update a separate Aippy project automatically.
