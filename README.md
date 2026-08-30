# SillyTavern-state · Character Status Bar

> **This fork keeps the exact same state-tracking engine as [ThirteenthMonth/SillyTavern-state](https://github.com/ThirteenthMonth/SillyTavern-state) — prompt injection, tag parsing and per-chat storage work identically. On top of that it adds a fully bilingual UI (English / 中文) and a cleaner, mobile-friendly status panel with dedicated view and editing modes.** All credit for the original extension goes to **ThirteenthMonth**.

A SillyTavern extension that adds a draggable floating status bar for tracking character states (HP, MP, gold, …). Before each generation it injects the current states as a system note, so the AI replies with only the changed values as `<name>value</name>` XML tags; the extension parses them back into the status bar and hides the tags from the chat. States are stored per chat, and one-click buttons convert them to/from World Info entries.

## What's new in this fork

### v1.4.0 — polished panel & mobile support
- **Editing-mode emphasis**: while editing, the panel background deepens with a **dark drop shadow**, so it clearly stands out from the page underneath.
- **Live appearance sliders**: editing mode now includes **panel opacity** and **glow / shadow intensity** sliders right inside the panel — drag them and watch the panel change in real time; your choice is saved automatically and restored on reload.
- **Mobile touch drag**: the panel can now be dragged by its title bar on touch screens — no longer mouse-only.
- **Subtle mobile toggle button**: on small screens the `States` button becomes a slim **vertical tab** hugging the right edge, staying out of the way during roleplay.
- **Self-healing stats**: on chat load the extension retro-scans the chat history for unprocessed state tags (messages received while the extension was disabled/broken, or imported chats), restores them into the panel, and strips the tags — no more empty status bars or leaked `<tag>` text.
- **Hardened settings layer**: settings now go through SillyTavern's official `getContext().extensionSettings` / `saveSettingsDebounced` APIs with graceful fallbacks, so the sliders and settings toggles keep working even on builds where the legacy globals are unavailable.

### v1.3.0 — compact view mode & editing mode
- **Normal (view) mode**: the status window now opens as a clean, compact read-only list — just the state names/values and a single **Edit** button at the bottom. No buttons cluttering every row.
- **Editing mode**: clicking **Edit** reveals the full management UI — per-item Edit/Delete buttons, the batch-add box, and the World Info export/import tools. Click **Done** to return to the compact view.

### v1.2.0 — bilingual English / 中文
- **Full English UI** — floating panel, buttons, dialogs, settings drawer, alerts.
- **English prompt injection** — the "Current state" system note and its instructions are sent in English too (previously Chinese only), so models that struggle with Chinese instructions now behave properly.
- **Language setting** — `Auto` follows the SillyTavern interface language (falling back to your browser language), or pin it to `中文` / `English` in the extension settings.
- Chinese remains fully supported — nothing was taken away.

**SillyTavern-state** adds a floating status bar to SillyTavern for managing character states (Health, Mana, Gold, and so on). Before every message you send, the extension injects the current states as a system note, steering the AI to reference them and **output only the states that changed**, as XML tags. When an AI reply contains state tags, the extension automatically parses them, updates the status bar, and strips the tags from the chat message — leaving only clean story text.

## Features

- **Floating status bar UI**: a draggable floating window, toggled via a floating button. View and manage the current character's states at any time.
- **Compact view mode + one-button editing**: the status bar shows a clean read-only list by default; a single **Edit** button switches to editing mode (shadowed panel with **live opacity & glow sliders**) for add/edit/delete and World Info tools, and **Done** switches back.
- **Mobile friendly**: touch-drag the panel anywhere on the screen; on small screens the toggle button collapses into a subtle vertical edge tab.
- **Batch state management**: add multiple states at once (one `Name Value` pair per line), plus edit and delete for existing states. Changes are saved instantly and kept separate per chat.
- **Prompt injection & state sync**: before each generation, the extension injects the current states into the prompt as a system note, guiding the model to update them. The AI only needs to reply with the changed items as `<Name>NewValue</Name>` XML tags.
- **Automatic parsing**: the extension watches AI replies, parses the XML state tags, updates the matching values in the status bar, and strips the tags from the message so they never disturb your reading.
- **World Info integration**: one-click **Export to World Info** (copies the states as a World Info entry) and **Import from World Info** (reads states back from clipboard text), making it easy to move state data between the extension and SillyTavern's World Info system.
- **Per-chat isolation**: state data is bound to each chat session's metadata (`chatMetadata`), so different chats/characters have fully independent status bars. Switching chats automatically loads that session's state list.
- **Bilingual UI & prompts**: English and 中文 throughout — the UI, the injected system note, and all alerts. Follows the SillyTavern UI language by default; a fixed language can be picked in the extension settings.

## Installation

**Requirement**: SillyTavern client version **1.13.2** or newer.

**Option 1 — install from URL (recommended):**
1. Open SillyTavern → **Extensions** (puzzle icon) → **Install Extension**.
2. Paste this repo's Git URL: `https://github.com/owlket/SillyTavern-state-Character-Status-Bar-`
3. Click install, then enable **角色状态栏 · Character Status Bar** in the extension list.

**Option 2 — manual install:**
1. Download the full repo (via Git or the ZIP archive).
2. Name the folder `SillyTavern-state` (it must contain `manifest.json`) and place it in SillyTavern's extensions directory: `data/<your-username>/extensions/` for a single user, or the server's shared `public/scripts/extensions/third-party/` directory to enable it for all users.
3. Start or refresh SillyTavern, open the **Extensions** panel, find **角色状态栏 · Character Status Bar** and enable it. If it doesn't appear, rescan/refresh the extension list and double-check the folder placement.

After installation the client loads the extension automatically. If it doesn't, restart SillyTavern or refresh the page.

## Usage

**1. Open the status bar window**: once the extension is enabled, a floating **`States`** button appears in the bottom-right corner of the page (on mobile it's a slim vertical tab on the right edge). Click it to open or hide the floating **Character Status** window. Drag the window by its title bar — touch dragging works on mobile too.

**2. View and manage states**: the window opens in **view mode** — a compact, read-only list of the current session's states, one `Name Value` pair per line, with a single **Edit** button at the bottom. Click **Edit** to switch to **editing mode** (the panel turns opaque with a dark shadow):
- **Add states**: in the multi-line text box, enter one or more states in `Name Value` format (one per line), then click **Add**. Each line is parsed in batch; if a name matches an existing item, its value is updated instead.
- **Edit a state**: click **Edit** next to an item to make it editable. Change the name or value, then click **Save** to apply or **Cancel** to discard. If you rename an item, make sure it doesn't clash with another existing name.
- **Delete a state**: click **Delete** next to an item to remove it.

Click **Done** at the bottom to return to the compact view mode.

All add/edit/delete operations take effect immediately and are saved automatically into the current chat's metadata. States never leak between chats — every chat has its own independent state list.

**3. Prompt injection**: every time you send a user message (continuing the story, asking a question, etc.), the extension silently inserts the current state list into the prompt as a system note. The note contains the "Current state" list plus instructions guiding the AI to output changed states. For example:

```
Current state:
Health 10/10
Mana 5/5
Gold 100
Refer to the state values above. When answering, if any state value changes as a result of the story, output only the changed state items using XML tag format, e.g.: <Health>8/10</Health>. If nothing has changed, do not output any state tags.
```

This system note is invisible to you, but it shapes the AI's next reply so it knows the current states. Guided by the note, **the AI outputs a `<Name>NewValue</Name>` tag only when a state actually changes**, instead of dumping the full state list or unrelated info into the narrative. State changes are captured explicitly without polluting the story text.

**4. Reply parsing**: after the AI generates a reply, the extension checks its content:
- If it **contains state tags** (e.g. `<Health>8/10</Health>`), the extension extracts the name and new value and updates the matching item in the status bar (e.g. Health → 8/10). New state names that don't exist in the list yet are added automatically.
- The extension then **strips these XML tags from the message**, keeping only the normal dialogue text. For example, the raw AI reply might be:
  `You take a hit and feel a little weak. <Health>8/10</Health>`
  After processing, all you see in the chat window is:
  `You take a hit and feel a little weak.`
  (while the status bar's Health has been updated to 8/10)

This all happens automatically, no manual intervention needed. The tags never disturb your reading, but the extension keeps precise track of every change behind the scenes.

**5. Export to World Info**: click **Export to World Info** in the status bar window and the extension formats all current states as World Info entry content and copies it to the clipboard. Go to SillyTavern's **World Info** panel, create a new entry, and paste it in. It's a good idea to set sensible **trigger keywords** for the entry — e.g. the character's name or a keyword like "state" — so it fires in relevant scenes. You can also bind the entry to a character so the state info is provided in every chat with them.

- Example of the generated entry content:

```
Character state:
Health 10/10
Mana 5/5
Gold 100
```

Feel free to add or remove items before using it in World Info.

**6. Import from World Info**: if you maintain a state list inside a World Info entry (same format as above, one state per line), copy that entry's text, then click **Import from World Info** in the status bar window. The extension reads the clipboard and batch-imports the states: existing names get updated, new names get added. The status bar updates in real time to match the World Info data.

> **Note**: importing requires clipboard-read permission from the browser. If clicking the button does nothing, paste the World Info content into the **Add** text box manually and click **Add** — same result.

**7. Extension settings**: open the Extensions panel from SillyTavern's top menu and find **Character Status Bar** to adjust its behavior:

- **Enable Character Status Bar**: master switch. Turning it off hides the floating button and stops prompt injection and message parsing.
- **Language**: language for the extension UI and the injected prompt. `Auto` follows the SillyTavern UI language; you can also pin it to 中文 or English.
- **Inject system prompt before sending**: controls whether the "Current state" note is inserted before the last user message.
- **Hide state tags in messages**: when off, `<state>` tags in AI replies are still parsed for updates but are not stripped from the chat log.
- **Extra instruction**: custom text appended to the end of the system prompt — useful for extra rules or notes.
- **Restore defaults**: resets all settings.

## Local development & hot reload

This extension supports **hot reload**. When you edit and save an extension file during development, SillyTavern detects the change and reloads the extension automatically — no manual page refresh needed. The extension script already guards against the duplicate event bindings and UI leftovers that repeated loading could cause, so every reload is a fresh single instance.

For development, place the extension folder under SillyTavern's `public/scripts/extensions/third-party/` directory (a global extension), start SillyTavern, and edit the files in place. Saving applies the update in the front end. If a change doesn't take effect, check the browser console for errors, or manually disable and re-enable the extension in the Extensions panel.

## Notes & caveats

- **Model cooperation**: the extension relies on the AI model following the system-note format. Most models will output the required `<tags>` when explicitly instructed, but it's not 100% guaranteed. If the model frequently fails to emit state changes, reinforce the instruction in the character definition or chat. Make sure state names match the model's replies exactly (including capitalization), or the extension won't recognize them.
- **Output discipline**: the AI should output a tag **only when a state changes**, and only the changed item. For example, if Health drops, the model should output `<Health>new value</Health>` — not the unchanged Mana or Gold. The injected note already stresses this to keep replies clean.
- **Tag format**: state tags are XML-style pairs, e.g. `<Health>8/10</Health>`. Avoid extra descriptions or whitespace inside tags; keep them minimal, containing only the new value. The extension extracts content with a `<...>...</...>` regex, so tags with spaces or units technically work (e.g. `<Stamina>5 points</Stamina>` is still recognized) — but consistent formatting keeps the model from getting confused.
- **State sync limits**: the extension only stores data tied to the AI conversation — states live in the current chat's metadata and are **not** written back to character cards or global settings. If you want to carry states into a new chat, import them manually via World Info, or record the initial states in the character card's description/extension fields (this extension does not currently write to card fields directly).
- **Duplicate information**: if you use a **World Info entry** to inject states *and* keep this extension's prompt injection on, the model may receive the state list twice, wasting context. Generally **pick one**: rely on the extension for live, dynamic states (best for rapidly changing values), or maintain static/initial states in World Info (better as long-term background). A hybrid works too: store the initial states in World Info, use **Import from World Info** to load them into the extension, and let the extension take over from there.
- **Permissions & safety**: the extension runs purely on the front end and needs no server plugin. It never talks to AI models or APIs directly — it only uses the events and interfaces SillyTavern provides. Safe to use in offline/local setups.

## Example scenario

1. The character card defines no states; you decide to track them in the extension. After enabling it, click the **States** button and add three states:

```
Health 10/10
Mana 5/5
Gold 100
```

These appear in the status bar window and are provided to the AI in the injected prompt.

2. The conversation begins. You type: "**I swing my sword at the monster.**" Before sending, the extension attaches a system note telling the AI the current Health and other values.
The AI might reply: "**You land a solid hit, but the monster swipes back and grazes you. <Health>8/10</Health>**"
The extension parses `<Health>8/10</Health>`, updates Health to 8/10 in the status bar, and hides the tag from the actual chat log — leaving only the narrative text.

3. As the story continues, the extension keeps maintaining these values. Whenever Health or another state changes, the AI marks the new value with a tag and the extension updates the display — so you can **track character states at a glance** without repeatedly asking or taking notes.

4. If you want to save the current states into your world setup — as a backup or to share — click **Export to World Info**, then create a World Info entry and paste the content in.

Through this flow, SillyTavern-state makes character-state management effortless and dynamically constrains AI responses, greatly improving the immersive roleplay experience.

## Credits

- Original extension: **[ThirteenthMonth/SillyTavern-state](https://github.com/ThirteenthMonth/SillyTavern-state)** — all features and design are theirs.
- This fork: adds the bilingual English/中文 UI and prompt injection (v1.2.0), the compact view/editing panel modes (v1.3.0), and editing-mode styling with live opacity/glow sliders, mobile touch-drag and the vertical toggle button (v1.4.0). If you prefer the original Chinese-only release, use the upstream repo — the core state-tracking behavior is the same.