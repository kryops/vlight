# vLight

If the dev server is reachable on http://localhost:8001, you are free to access it; prefer the Playwright MCP server.
Do not hesitate to change state (try to revert any changes as good as possible), usually there are no actual lights connected during development.

Don't be alarmed when state changed between turns, I like to verify any changes manually.

After changes, add VERY BRIEF changelog entries. Multi-turn refinements in one session still only create one entry for each feature.

If styles don't recompute correctly after changes, touch the file again; the Linaria cache is not perfect.

Format code via `vp fmt`, NOT Prettier.