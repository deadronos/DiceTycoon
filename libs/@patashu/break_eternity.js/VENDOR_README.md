Vendorized break_eternity.js
===========================

This folder contains a vendored build of Patashu's `break_eternity.js` library used by DiceTycoon for high-precision Decimal arithmetic.

Why vendorize?
- The upstream repository (https://github.com/Patashu/break_eternity.js) does not always publish a prebuilt `dist/` bundle when installing via GitHub; vendoring a built ESM artifact ensures deterministic builds and test runs.
- Having the compiled ESM file committed avoids transient failures during CI or when contributors install dependencies without a build step.

Files included
- `dist/break_eternity.esm.js` - ESM build (imported via Vite alias)
- `dist/break_eternity.cjs.js` - CommonJS build
- `dist/break_eternity.js` / `break_eternity.min.js` - UMD builds
- `dist/LICENSE.txt` - Upstream license (copy)
- `dist/README.md` - Original upstream readme (if provided)
- `dist/break_eternity.d.ts` - Minimal TypeScript declaration to satisfy the compiler

Upstream source
- Repo: https://github.com/Patashu/break_eternity.js
- If you created this vendor copy from a release or commit, record the source here:

Source commit / tag: (please fill)

How to update the vendored build
1. Clone or fetch the upstream repository at the desired tag/commit.
2. Run the upstream build instructions (usually `npm install` + `npm run build`) to produce the `dist/` artifacts.
3. Copy the resulting `dist/` files into `libs/@patashu/break_eternity.js/dist/` and commit.
4. Update `dist/LICENSE.txt` with the upstream license and add a note here with the commit/tag used.

Project config
- A Vite alias is configured in `vite.config.ts` to map the import specifier `@patashu/break_eternity.js` to the vendored ESM file. This keeps import lines in code unchanged while using the local vendor file.

Notes
- We also added a small TypeScript declaration `break_eternity.d.ts` to narrow the TypeScript surface for the repo; it's intentionally minimal. If you need richer typings, consider upstreaming types or creating a fuller declaration file.

License
- Respect the upstream license in `dist/LICENSE.txt` when redistributing.

If you want, I can also add the specific commit/hash used to create this vendor copy — tell me the upstream commit or I can fetch the upstream repo and determine a matching commit.
