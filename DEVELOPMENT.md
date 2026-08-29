# DEVELOPMENT.md — Developer Reference

Internal architecture notes for anyone amending this fork. For user-facing docs see [README.md](README.md).

> **Line numbers below are approximate** (v1.4.0) and will drift as the file is edited — search for the symbol name instead of trusting the number.

## Repository layout

| File | Purpose |
|---|---|
| `index.js` | All extension logic: settings, i18n, floating panel, state parsing, prompt interceptor (~710 lines) |
| `style.css` | Panel / toggle-button styling, view-vs-edit mode rules, mobile media query |
| `index.html` | Settings drawer markup injected into SillyTavern's Extensions panel |
| `manifest.json` | Extension metadata; `generate_interceptor` registers the prompt hook; **bump `version` on every release** |
| `README.md` | User-facing documentation (English) |

### Git remotes

| Remote | Repo | Use |
|---|---|---|
| `owlket` | `owlket/SillyTavern-state-Character-Status-Bar-` | **Our fork — push releases here** |
| `origin` | `ThirteenthMonth/SillyTavern-state` (upstream) | `git pull origin main` to absorb upstream changes |

Release workflow: `node --check index.js` → bump `manifest.json` version → commit → `git push owlket main` → deploy (see below).

## Core concepts

### 1. Settings (`index.js` top, ~lines 3–160)

- `STATE_EXT_DEFAULT_SETTINGS` — defaults: `enabled`, `autoInjectPrompt`, `stripTagsFromChat`, `customInstruction`, `language` (`auto`/`zh`/`en`), `panelOpacity` (0.1–1), `panelGlow` (0–1).
- `stateExtEnsureSettings()` — merges stored settings with defaults. Uses SillyTavern's `extension_settings` API when available, falls back to an in-memory copy.
- `stateExtPersistSettings()` — writes via `context.extensionSettings[KEY] = settings` + `context.saveSettingsDebounced()`.
- `applyRuntimeSettings(settings)` (on `globalThis.stateExt`) — re-applies language + panel appearance (`applyAppearance()`) + updates toggle button label live. Called by `stateExtApplyAndPersist()` after every settings change and by the settings panel init.
- **To add a new setting:** add a default → add a control in `index.html` → wire it in `initExtensionSettingsPanel()` (~line 540) → read it via `getCurrentSettings()`.

### 2. Bilingual i18n (~lines 16–160)

- `STATE_EXT_STRINGS` — `{ zh: {...}, en: {...} }` flat key→text tables. **Every user-facing string must exist in both languages.**
- `stateExtGetUILanguage()` — resolves `auto` → SillyTavern UI language → browser language → `en` fallback.
- `stateExtT(key, ...args)` — lookup + `{0}`-style substitution.
- DOM auto-translation: elements tagged `data-stateext-i18n="key"` (textContent) or `data-stateext-i18n-ph="key"` (placeholder) are re-translated by `applyRuntimeSettings()` whenever the language changes. Prefer these attributes over hard-coded text.
- **To add a string:** add to both `zh` and `en` tables, then use `stateExtT()` in JS or a `data-stateext-i18n` attribute in HTML.

### 3. State storage (per chat)

- States live in `chatMetadata['sillyTavernState']` — an array of `{ name, value }`.
- `getStateList()` / `saveMetadata()` read/write it; each chat is fully isolated.
- `CHAT_CHANGED` event → reload `stateList` + `refreshListUI()`.
- States are **not** written to character cards or World Info automatically (Export/Import buttons do that manually via clipboard).

### 4. Floating panel DOM (~lines 258–360)

Created imperatively in `index.js` (no HTML file for the panel):

```
#stateExtToggleBtn              floating pill button (bottom-right; vertical edge tab on mobile)
#stateExtPanel                  the panel (display:none until toggled; .editing class = edit mode)
├── .header                     title bar — drag handle (mouse + touch)
├── #stateExtList <ul>          state items rendered by refreshListUI()
│     └── li                    .state-name + .state-value spans, .edit-btn/.delete-btn,
│                               hidden inline-edit inputs (.name-input/.value-input/.save-btn/.cancel-btn)
├── #stateExtEditArea           batch textarea + Add / Export / Import buttons (edit mode only)
│     └── #stateExtInput, #stateExtAddBtn, #stateExtGenBtn, #stateExtImpBtn
└── #stateExtFooter             mode toggle: #stateExtEditModeBtn (view) / #stateExtDoneBtn (edit)
```

### 5. View / Edit mode (v1.3.0+)

- Panel defaults to **view mode**: compact single-line items, only the footer **Edit** button visible.
- `#stateExtEditModeBtn` adds `.editing` to the panel; `#stateExtDoneBtn` removes it.
- All show/hide logic is pure CSS in `style.css` (rules keyed on `#stateExtPanel:not(.editing)` / `.editing`) — JS never toggles individual controls.
- Edit mode also gets deepened background + dark shadow (`#stateExtPanel.editing` in `style.css`).
- Panel opacity / glow are **live-adjustable** via two sliders inside `#stateExtEditArea` (edit mode only): slider `input` events → `stateExtUpdateSettings({ panelOpacity / panelGlow })` → `applyAppearance()` writes the CSS vars `--stateext-opacity`, `--stateext-glow`, `--stateext-shadow` on the panel element; `style.css` consumes them with `var(...)` fallbacks. Persisted like any other setting; "Restore defaults" resets them.
- **To hide/show something per mode, write a CSS rule — don't touch JS.**

### 6. Dragging (mouse + touch, ~lines 400–440)

- Shared `startDrag(x, y)` / `moveDrag(x, y)` / `endDrag()` wired to both mouse and `touchstart`/`touchmove`/`touchend`/`touchcancel` on the `.header` handle.
- `touchmove` listener uses `{ passive: false }` + `preventDefault()` to stop page scroll while dragging.
- Position is set via inline `left/top` (overrides CSS `right/bottom`). **Not persisted across refresh** (known limitation).

### 7. AI reply parsing (~lines 650–690)

- `MESSAGE_RECEIVED` handler: regex `/<([^/>]+)>([^<]+)<\/\1>/g` matches `<Name>value</Name>` tags in the last AI message.
- Matched names update existing states; unknown names append new states; then `saveMetadata()` + `refreshListUI()`.
- If `stripTagsFromChat` is on, all tag pairs are stripped from the displayed message.

### 8. Prompt injection (bottom of `index.js`)

- `globalThis.statePromptInterceptor` — registered via `manifest.json` → `generate_interceptor`. Runs before every generation.
- Removes stale injected notes first (matched by `STATE_EXT_NOTE_PREFIXES`, ~line 98), then splices a `System Note` containing the current states + `promptInstruction` + `customInstruction` before the last user message.
- If you change the note format, **update `STATE_EXT_NOTE_PREFIXES` too** or old notes will accumulate.

### 9. Settings drawer (`index.html` + ~lines 525–625)

- `index.html` is fetched from the extension folder and appended to `#extensions_settings` (with `#extensions_settings2` / `#extensions_settings_button` fallbacks for older ST versions).
- `initExtensionSettingsPanel()` runs on `EXTENSION_SETTINGS_LOADED` and re-runs until the DOM sticks (guarded by `settingsPanelLoading`).
- Every control follows the pattern: read current value → set control → `on('change'/input)` → mutate settings → `stateExtApplyAndPersist()`.

## Deploy to the Docker server

```powershell
scp index.js style.css manifest.json root@10.10.10.124:/opt/sillytavern/public/extensions/third-party/SillyTavern-state/
```

Then hard-refresh the browser tab (**Ctrl+F5**) — SillyTavern caches extension files aggressively.

## Version history (this fork)

| Version | Commit | Changes |
|---|---|---|
| 1.2.0 | `4963501` | Bilingual zh/en UI, prompts & settings drawer; language setting (`auto`/zh/en) |
| — | `ac9949a` | English README |
| 1.3.0 | `545912a` | Compact view mode + Edit/Done mode toggle |
| 1.4.0 | `0ad0354` | Edit-mode opaque bg + shadow; mobile: touch drag, vertical edge toggle button |
| 1.4.0 | `00cf85d` | Live panel opacity + glow/shadow sliders in edit mode (CSS vars `--stateext-*`) |

## Known limitations / future ideas

- Panel position & edit-mode state reset on page refresh.
- No direct write to character-card fields; World Info transfer is clipboard-based.
- Upstream (`origin`) is Chinese-only — when pulling upstream changes, re-check `STATE_EXT_STRINGS` and `data-stateext-i18n` coverage for any new hard-coded Chinese strings.
