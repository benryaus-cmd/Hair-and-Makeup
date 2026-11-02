# Hair & Makeup source delivery

The current prepared prompt is `AIPPY_UPDATE_PROMPT.txt`; release identities are in `docs/import-release.json`.

- Source snapshot: `567affa0838637cd1265eeec0ee693a506d3f5b1`
- Manifest snapshot: `21dc228beb45f7a8cf5d8e5a6504816a71986463`
- Game files: 113
- Asset keys: 10

The Node-only Vite importer verifies immutable URLs, SHA-256 and file sizes, stages downloads before promotion and rolls back failures. It preserves the host entry, developer utilities and unrelated assets. Ordinary repository builds keep `github-import.config.json` disabled.

The source and manifest use different commits intentionally: game URLs pin the verified source snapshot, and the separate manifest commit makes the manifest itself immutable. A completed request is idempotent and preserves later Aippy source edits.

After Aippy runs the prompt, its actual build and receipt must still be inspected. Publishing this repository does not update a separate Aippy project automatically.
