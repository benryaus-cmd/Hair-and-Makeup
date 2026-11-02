# Hair & Makeup source delivery

The current prepared prompt is `AIPPY_UPDATE_PROMPT.txt`; release identities are in `docs/import-release.json`.

- Source snapshot: `c92d40cc285e2f54d549932358443f7dcf329ced`
- Manifest snapshot: `10677e4d1648bf0b4f696da6da2ac5b8bc0dd739`
- Game files: 110
- Asset keys: 10

The Node-only Vite importer verifies immutable URLs, SHA-256 and file sizes, stages downloads before promotion and rolls back failures. It preserves the host entry, developer utilities and unrelated assets. Ordinary repository builds keep `github-import.config.json` disabled.

The source and manifest use different commits intentionally: game URLs pin the verified source snapshot, and the separate manifest commit makes the manifest itself immutable. A completed request is idempotent and preserves later Aippy source edits.

After Aippy runs the prompt, its actual build and receipt must still be inspected. Publishing this repository does not update a separate Aippy project automatically.
