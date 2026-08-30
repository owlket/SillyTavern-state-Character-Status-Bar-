// SillyTavern-state 扩展脚本

const STATE_EXT_SETTINGS_KEY = 'SillyTavern-state';
const STATE_EXT_DEFAULT_SETTINGS = {
    enabled: true,
    autoInjectPrompt: true,
    stripTagsFromChat: true,
    customInstruction: '',
    // 'auto' follows the SillyTavern UI language; 'zh' / 'en' force a language
    language: 'auto',
    // Panel appearance, live-adjustable via sliders in editing mode
    panelOpacity: 0.95,
    panelGlow: 1,
    // Color theme: one of STATE_EXT_THEMES
    panelTheme: 'default',
};

// Available panel color themes (value = the panel's data-theme attribute)
const STATE_EXT_THEMES = ['default', 'rpg', 'cyber', 'matrix', 'amber', 'sakura'];

// ---------------------------------------------------------------------------
// Bilingual (中文 / English) string table
// ---------------------------------------------------------------------------
const STATE_EXT_STRINGS = {
    zh: {
        toggleButton: '状态栏',
        panelTitle: '角色状态栏',
        batchPlaceholder: '每行输入 状态名 和 值',
        addButton: '添加',
        genButton: '生成世界书条目',
        impButton: '从世界书提取',
        saveButton: '保存',
        cancelButton: '取消',
        editButton: '编辑',
        doneButton: '完成',
        deleteButton: '删除',
        alertNameEmpty: '名称不能为空！',
        alertNameConflict: '已有相同名称的状态项存在！',
        alertNoStates: '当前没有任何状态项可生成。',
        worldInfoHeader: '角色状态：',
        alertCopied: '世界书条目内容已复制到剪贴板！\n请在世界信息中创建新条目并粘贴内容。',
        promptManualCopy: '请手动复制以下内容:',
        alertClipboardEmpty: '剪贴板没有内容，请先复制世界书条目文本。',
        alertImported: '已从剪贴板导入 {0} 个状态项。',
        alertNothingImported: '未从剪贴板内容提取到任何状态项！',
        alertClipboardFail: '无法读取剪贴板。请将世界书条目内容粘贴到上方文本框，然后点击“添加”。',
        alertReset: '设置已恢复为默认值。',
        promptHeader: '当前状态：',
        promptInstruction: '请参考以上状态。在回答时，如有任何状态数值因剧情发生变化，请仅输出发生变化的状态项，并使用 XML 标签格式表示，例如：<生命值>8/10</生命值>。如果没有状态变化，请不要输出任何状态标签。',
        drawerTitle: '角色状态栏',
        settingEnable: '启用角色状态栏',
        settingEnableDesc: '控制扩展的全部功能，包括悬浮面板、提示注入与状态解析。',
        settingLanguage: '界面语言',
        settingLanguageDesc: '选择扩展界面与注入提示使用的语言；“自动”跟随 SillyTavern 界面语言。',
        settingInject: '发送前注入系统提示',
        settingInjectDesc: '为最后一条用户消息补充“当前状态”说明，提示 AI 使用 XML 标签更新数值。',
        settingStrip: '隐藏消息中的状态标签',
        settingStripDesc: '解析 AI 回复的 <状态> 标签后，仅保留纯剧情文本，不在聊天记录中显示标签。',
        settingInstruction: '附加提示说明',
        settingInstructionDesc: '追加到系统提示末尾的自定义说明，可用于约束输出或描述特殊规则。',
        settingInstructionPh: '例如：当状态变化时请附带一句剧情描述。',
        settingRestore: '恢复默认设置',
        appearanceOpacity: '面板不透明度',
        appearanceGlow: '发光 / 阴影强度',
        appearanceTheme: '主题配色',
        themeDefault: '默认 · 霓虹夜',
        themeRpg: 'RPG · 羊皮卷',
        themeCyber: '赛博 · 银铬',
        themeMatrix: '矩阵 · 终端绿',
        themeAmber: '复古 · 琥珀屏',
        themeSakura: '樱花 · 柔粉',
    },
    en: {
        toggleButton: 'States',
        panelTitle: 'Character Status',
        batchPlaceholder: 'One per line: Name Value',
        addButton: 'Add',
        genButton: 'Export to World Info',
        impButton: 'Import from World Info',
        saveButton: 'Save',
        cancelButton: 'Cancel',
        editButton: 'Edit',
        doneButton: 'Done',
        deleteButton: 'Delete',
        alertNameEmpty: 'Name cannot be empty!',
        alertNameConflict: 'A state item with the same name already exists!',
        alertNoStates: 'There are no state items to export.',
        worldInfoHeader: 'Character state:',
        alertCopied: 'World Info entry content copied to clipboard!\nCreate a new entry in World Info and paste it.',
        promptManualCopy: 'Copy the following manually:',
        alertClipboardEmpty: 'The clipboard is empty. Copy a World Info entry text first.',
        alertImported: 'Imported {0} state item(s) from the clipboard.',
        alertNothingImported: 'No state items found in the clipboard content!',
        alertClipboardFail: 'Cannot read the clipboard. Paste the World Info entry into the text box above and click "Add".',
        alertReset: 'Settings have been restored to defaults.',
        promptHeader: 'Current state:',
        promptInstruction: 'Refer to the state values above. When answering, if any state value changes as a result of the story, output only the changed state items using XML tag format, e.g.: <Health>8/10</Health>. If nothing has changed, do not output any state tags.',
        drawerTitle: 'Character Status Bar',
        settingEnable: 'Enable Character Status Bar',
        settingEnableDesc: 'Master switch for all extension features: floating panel, prompt injection and state parsing.',
        settingLanguage: 'Language',
        settingLanguageDesc: 'Language for the extension UI and the injected prompt. "Auto" follows the SillyTavern UI language.',
        settingInject: 'Inject system prompt before sending',
        settingInjectDesc: 'Adds a "Current state" note before the last user message, instructing the AI to update values with XML tags.',
        settingStrip: 'Hide state tags in messages',
        settingStripDesc: 'After parsing <state> tags from AI replies, keep only the story text in the chat log.',
        settingInstruction: 'Extra instruction',
        settingInstructionDesc: 'Custom text appended to the end of the system prompt, e.g. output constraints or special rules.',
        settingInstructionPh: 'E.g.: When a state changes, add one sentence of story description.',
        settingRestore: 'Restore defaults',
        appearanceOpacity: 'Panel opacity',
        appearanceGlow: 'Glow / shadow',
        appearanceTheme: 'Color theme',
        themeDefault: 'Default · Neon',
        themeRpg: 'RPG · Parchment',
        themeCyber: 'Cyber · Silver',
        themeMatrix: 'Matrix · Terminal',
        themeAmber: 'Amber · CRT',
        themeSakura: 'Sakura · Pink',
    },
};

// Prefixes used by injected state system notes, in every supported language,
// so old notes are cleaned up even after switching languages.
const STATE_EXT_NOTE_PREFIXES = Object.values(STATE_EXT_STRINGS).map(pack => pack.promptHeader);

function stateExtResolveLanguage(settings) {
    const pref = settings && settings.language;
    if (pref === 'zh' || pref === 'en') {
        return pref;
    }
    // 'auto': follow the SillyTavern UI language (localStorage 'language'),
    // then fall back to the browser language.
    let locale = '';
    try {
        locale = String(localStorage.getItem('language') || '').toLowerCase();
    } catch (error) { /* ignore */ }
    if (!locale) {
        try {
            locale = String(navigator.language || '').toLowerCase();
        } catch (error) { /* ignore */ }
    }
    return locale.startsWith('zh') ? 'zh' : 'en';
}

function stateExtT(key, ...args) {
    const lang = stateExtResolveLanguage(stateExtEnsureSettings());
    const pack = STATE_EXT_STRINGS[lang] || STATE_EXT_STRINGS.en;
    const template = pack[key] ?? STATE_EXT_STRINGS.en[key] ?? key;
    return template.replace(/\{(\d+)\}/g, (match, index) => (args[index] !== undefined ? String(args[index]) : match));
}

function stateExtCloneDefaultSettings() {
    return JSON.parse(JSON.stringify(STATE_EXT_DEFAULT_SETTINGS));
}

// 解析设置存储容器：优先 SillyTavern 官方 context API（始终可用），
// 其次旧版全局变量，最后退回内存副本（仅本次会话有效，但实时调整仍然生效）。
// Resolve the settings container: official context API first (always available),
// then the legacy global, then an in-memory fallback (session-only, but live updates still work).
function stateExtGetSettingsContainer() {
    try {
        const ctx = SillyTavern.getContext();
        if (ctx && ctx.extensionSettings) {
            return ctx.extensionSettings;
        }
    } catch (error) { /* SillyTavern context not ready yet */ }
    if (globalThis.extension_settings) {
        return globalThis.extension_settings;
    }
    if (!globalThis.stateExtMemorySettings) {
        globalThis.stateExtMemorySettings = {};
    }
    return globalThis.stateExtMemorySettings;
}

// 保存设置：优先 context.saveSettingsDebounced（官方 API），其次全局函数
// Persist settings: prefer context.saveSettingsDebounced (official API), then globals
function stateExtSaveSettings() {
    try {
        const ctx = SillyTavern.getContext();
        if (ctx && typeof ctx.saveSettingsDebounced === 'function') {
            ctx.saveSettingsDebounced();
            return;
        }
    } catch (error) { /* SillyTavern context not ready yet */ }
    if (typeof globalThis.saveSettingsDebounced === 'function') {
        globalThis.saveSettingsDebounced();
    } else if (typeof globalThis.saveSettings === 'function') {
        globalThis.saveSettings();
    }
}


function stateExtEnsureSettings() {
    const container = stateExtGetSettingsContainer();

    const stored = container[STATE_EXT_SETTINGS_KEY];
    if (!stored) {
        const defaults = stateExtCloneDefaultSettings();
        container[STATE_EXT_SETTINGS_KEY] = defaults;
        if (globalThis.stateExt) {
            globalThis.stateExt.settings = defaults;
        }
        stateExtSaveSettings();
        return defaults;
    }

    const merged = Object.assign({}, STATE_EXT_DEFAULT_SETTINGS, stored);
    container[STATE_EXT_SETTINGS_KEY] = merged;
    if (globalThis.stateExt) {
        globalThis.stateExt.settings = merged;
    }
    return merged;
}

function stateExtUpdateSettings(partial) {
    const container = stateExtGetSettingsContainer();

    const current = stateExtEnsureSettings();
    Object.assign(current, partial);
    container[STATE_EXT_SETTINGS_KEY] = current;

    if (globalThis.stateExt) {
        globalThis.stateExt.settings = current;
        if (typeof globalThis.stateExt.applyRuntimeSettings === 'function') {
            globalThis.stateExt.applyRuntimeSettings(current);
        }
    }

    stateExtSaveSettings();

    return current;
}

function stateExtResetSettings() {
    const container = stateExtGetSettingsContainer();
    const defaults = stateExtCloneDefaultSettings();
    container[STATE_EXT_SETTINGS_KEY] = defaults;

    if (globalThis.stateExt) {
        globalThis.stateExt.settings = defaults;
        if (typeof globalThis.stateExt.applyRuntimeSettings === 'function') {
            globalThis.stateExt.applyRuntimeSettings(defaults);
        }
    }

    stateExtSaveSettings();

    return defaults;
}

(function() {
    function init() {
        const context = SillyTavern.getContext();
        const { eventSource, event_types, saveMetadata } = context;

        // 安全保存聊天元数据：失败只记录日志，不中断状态解析与界面刷新
        // Safe chat-metadata persistence: failures are logged, never break parsing or UI refresh
        function saveMeta() {
            try {
                if (typeof saveMetadata === 'function') {
                    saveMetadata();
                    return;
                }
            } catch (error) {
                console.error('[Character Status] saveMetadata failed:', error);
                return;
            }
            try {
                SillyTavern.getContext().saveMetadataDebounced?.();
            } catch (error) {
                console.error('[Character Status] saveMetadataDebounced failed:', error);
            }
        }

        const META_KEY = 'sillyTavernState';

        const previousInstance = globalThis.stateExt;
        if (previousInstance?.initialized) {
            if (previousInstance.msgHandler) {
                eventSource.off(event_types.MESSAGE_RECEIVED, previousInstance.msgHandler);
            }
            if (previousInstance.chatHandler) {
                eventSource.off(event_types.CHAT_CHANGED, previousInstance.chatHandler);
            }
            if (previousInstance.settingsPanelListener) {
                eventSource.off(event_types.EXTENSION_SETTINGS_LOADED, previousInstance.settingsPanelListener);
            }
            document.getElementById('stateExtPanel')?.remove();
            document.getElementById('stateExtToggleBtn')?.remove();
            document.getElementById('stateExtSettingsRoot')?.remove();
        }

        const initialSettings = stateExtEnsureSettings();

        globalThis.stateExt = {
            initialized: true,
            settings: initialSettings,
        };

        let settingsPanelLoading = false;

        function getCurrentSettings() {
            return globalThis.stateExt?.settings || stateExtEnsureSettings();
        }

    // 获取当前聊天的状态列表（如无则初始化为空数组）
    function getStateList() {
        const meta = SillyTavern.getContext().chatMetadata;
        if (!meta[META_KEY]) {
            meta[META_KEY] = [];
        }
        return meta[META_KEY];
    }
    let stateList = getStateList();

    // 创建悬浮按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'stateExtToggleBtn';
    toggleBtn.textContent = stateExtT('toggleButton');
    document.body.appendChild(toggleBtn);

    // 创建悬浮窗口面板
    const panel = document.createElement('div');
    panel.id = 'stateExtPanel';
    panel.innerHTML = `
        <div class="header" data-stateext-i18n="panelTitle"></div>
        <ul id="stateExtList"></ul>
        <div id="stateExtEditArea">
            <textarea id="stateExtInput" rows="3" data-stateext-i18n-ph="batchPlaceholder"></textarea>
            <button id="stateExtAddBtn" data-stateext-i18n="addButton"></button>
            <button id="stateExtGenBtn" data-stateext-i18n="genButton"></button>
            <button id="stateExtImpBtn" data-stateext-i18n="impButton"></button>
            <div id="stateExtAppearance">
                <div class="appearance-row">
                    <span class="appearance-label" data-stateext-i18n="appearanceTheme"></span>
                    <select id="stateExtThemeSelect">
                        <option value="default" data-stateext-i18n="themeDefault"></option>
                        <option value="rpg" data-stateext-i18n="themeRpg"></option>
                        <option value="cyber" data-stateext-i18n="themeCyber"></option>
                        <option value="matrix" data-stateext-i18n="themeMatrix"></option>
                        <option value="amber" data-stateext-i18n="themeAmber"></option>
                        <option value="sakura" data-stateext-i18n="themeSakura"></option>
                    </select>
                </div>
                <div class="appearance-row">
                    <span class="appearance-label" data-stateext-i18n="appearanceOpacity"></span>
                    <input type="range" id="stateExtOpacityRange" min="10" max="100" step="1" />
                    <span class="appearance-value" id="stateExtOpacityVal"></span>
                </div>
                <div class="appearance-row">
                    <span class="appearance-label" data-stateext-i18n="appearanceGlow"></span>
                    <input type="range" id="stateExtGlowRange" min="0" max="100" step="1" />
                    <span class="appearance-value" id="stateExtGlowVal"></span>
                </div>
            </div>
        </div>
        <div id="stateExtFooter">
            <button id="stateExtEditModeBtn" data-stateext-i18n="editButton"></button>
            <button id="stateExtDoneBtn" data-stateext-i18n="doneButton"></button>
        </div>
    `;
    document.body.appendChild(panel);

    globalThis.stateExt.toggleBtn = toggleBtn;
    globalThis.stateExt.panel = panel;

    // 查看 / 编辑模式切换：默认为紧凑查看模式（仅状态列表 + “编辑”按钮），
    // 点击“编辑”进入编辑模式（显示每项的编辑/删除按钮与批量操作区），点击“完成”返回。
    // View/edit mode toggle: compact view mode by default (list + a single Edit button);
    // Edit enters editing mode (per-item buttons + batch area), Done returns to view mode.
    panel.querySelector('#stateExtEditModeBtn').onclick = () => panel.classList.add('editing');
    panel.querySelector('#stateExtDoneBtn').onclick = () => panel.classList.remove('editing');

    // 外观滑杆：实时调整面板不透明度与发光/阴影强度（仅编辑模式可见）
    // Appearance sliders (edit mode only): live panel opacity + glow/shadow intensity.
    // stateExtUpdateSettings() re-applies runtime settings instantly and persists via saveSettingsDebounced.
    const opacityRange = panel.querySelector('#stateExtOpacityRange');
    const glowRange = panel.querySelector('#stateExtGlowRange');
    if (opacityRange) {
        opacityRange.addEventListener('input', () => {
            stateExtUpdateSettings({ panelOpacity: Number(opacityRange.value) / 100 });
        });
    }
    if (glowRange) {
        glowRange.addEventListener('input', () => {
            stateExtUpdateSettings({ panelGlow: Number(glowRange.value) / 100 });
        });
    }

    // 主题下拉：切换面板配色方案（随其他设置一并保存）
    // Theme dropdown: switch panel color scheme (persisted like any other setting)
    const themeSelect = panel.querySelector('#stateExtThemeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', () => {
            stateExtUpdateSettings({ panelTheme: themeSelect.value });
        });
    }

    // 根据当前语言设置刷新所有界面文本 / Re-apply all UI texts for the current language
    function applyLanguageToUI() {
        toggleBtn.textContent = stateExtT('toggleButton');
        const applyTo = (root) => {
            if (!root) return;
            root.querySelectorAll('[data-stateext-i18n]').forEach(el => {
                el.textContent = stateExtT(el.getAttribute('data-stateext-i18n'));
            });
            root.querySelectorAll('[data-stateext-i18n-ph]').forEach(el => {
                el.setAttribute('placeholder', stateExtT(el.getAttribute('data-stateext-i18n-ph')));
            });
        };
        applyTo(panel);
        applyTo(document.getElementById('stateExtSettingsRoot'));
        refreshListUI();
    }

    // 将外观设置（不透明度 / 发光强度）写入面板的 CSS 变量，并同步滑杆位置与百分比显示
    // Apply appearance settings to the panel's CSS variables and sync the sliders + % labels
    function applyAppearance(config) {
        // 主题：写入 data-theme 属性，style.css 按主题覆盖配色变量；同时同步下拉框选中项
        // Theme: set data-theme (style.css overrides the palette vars per theme) + sync the dropdown
        const theme = STATE_EXT_THEMES.includes(config.panelTheme) ? config.panelTheme : 'default';
        panel.dataset.theme = theme;
        const themeSelectEl = panel.querySelector('#stateExtThemeSelect');
        if (themeSelectEl) themeSelectEl.value = theme;

        const opacity = Math.min(1, Math.max(0.1, Number(config.panelOpacity ?? 0.95)));
        const glow = Math.min(1, Math.max(0, Number(config.panelGlow ?? 1)));
        panel.style.setProperty('--stateext-opacity', opacity.toFixed(2));
        panel.style.setProperty('--stateext-glow', glow.toFixed(2));
        // 编辑模式的深色阴影强度跟随发光强度 / Edit-mode dark shadow follows glow intensity
        panel.style.setProperty('--stateext-shadow', (glow * 0.85).toFixed(2));
        const opacityRangeEl = panel.querySelector('#stateExtOpacityRange');
        const glowRangeEl = panel.querySelector('#stateExtGlowRange');
        const opacityValEl = panel.querySelector('#stateExtOpacityVal');
        const glowValEl = panel.querySelector('#stateExtGlowVal');
        if (opacityRangeEl) opacityRangeEl.value = Math.round(opacity * 100);
        if (glowRangeEl) glowRangeEl.value = Math.round(glow * 100);
        if (opacityValEl) opacityValEl.textContent = Math.round(opacity * 100) + '%';
        if (glowValEl) glowValEl.textContent = Math.round(glow * 100) + '%';
    }

    function applyRuntimeSettings(currentSettings) {
        const config = currentSettings || getCurrentSettings();
        const isEnabled = config.enabled !== false;
        if (toggleBtn) {
            toggleBtn.style.display = isEnabled ? 'flex' : 'none';
        }
        if (panel && !isEnabled) {
            panel.style.display = 'none';
        }
        // 单项失败不应拖垮整个初始化 / A failure here must not break the rest of init
        try { applyAppearance(config); } catch (error) { console.error('[Character Status] Failed to apply appearance:', error); }
        try { applyLanguageToUI(); } catch (error) { console.error('[Character Status] Failed to apply language:', error); }
        return config;
    }

    globalThis.stateExt.applyRuntimeSettings = applyRuntimeSettings;
    applyRuntimeSettings(initialSettings);

    // 刷新状态列表 UI 显示
    function refreshListUI() {
        const listEl = document.getElementById('stateExtList');
        listEl.innerHTML = '';  // 清空列表
        stateList = getStateList();
        stateList.forEach((item, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="state-name">${item.name}</span>
                <span class="state-value">${item.value}</span>
                <input class="edit-name" type="text" style="display:none;" />
                <input class="edit-value" type="text" style="display:none;" />
                <button class="save-btn" style="display:none;">${stateExtT('saveButton')}</button>
                <button class="cancel-btn" style="display:none;">${stateExtT('cancelButton')}</button>
                <button class="edit-btn">${stateExtT('editButton')}</button>
                <button class="delete-btn">${stateExtT('deleteButton')}</button>
            `;
            // 填充隐藏输入框的初始值
            li.querySelector('.edit-name').value = item.name;
            li.querySelector('.edit-value').value = item.value;
            // 编辑按钮事件
            li.querySelector('.edit-btn').onclick = () => {
                li.querySelector('.state-name').style.display = 'none';
                li.querySelector('.state-value').style.display = 'none';
                li.querySelector('.edit-btn').style.display = 'none';
                li.querySelector('.delete-btn').style.display = 'none';
                li.querySelector('.edit-name').style.display = 'inline-block';
                li.querySelector('.edit-value').style.display = 'inline-block';
                li.querySelector('.save-btn').style.display = 'inline-block';
                li.querySelector('.cancel-btn').style.display = 'inline-block';
            };
            // 保存按钮事件
            li.querySelector('.save-btn').onclick = () => {
                const newName = li.querySelector('.edit-name').value.trim();
                const newValue = li.querySelector('.edit-value').value.trim();
                if (!newName) {
                    alert(stateExtT('alertNameEmpty'));
                    return;
                }
                // 检查重名冲突
                const conflict = stateList.find((it, i) => i !== idx && it.name === newName);
                if (conflict) {
                    alert(stateExtT('alertNameConflict'));
                    return;
                }
                // 更新状态项并保存
                item.name = newName;
                item.value = newValue;
                saveMeta();
                // 更新列表显示
                refreshListUI();
            };
            // 取消按钮事件
            li.querySelector('.cancel-btn').onclick = () => {
                // 还原编辑前的显示
                refreshListUI();
            };
            // 删除按钮事件
            li.querySelector('.delete-btn').onclick = () => {
                stateList.splice(idx, 1);
                saveMeta();
                refreshListUI();
            };
            listEl.appendChild(li);
        });
    }
    refreshListUI();

    // 悬浮按钮：点击切换面板显隐
    toggleBtn.addEventListener('click', () => {
        if (!getCurrentSettings().enabled) {
            return;
        }
        panel.style.display = (panel.style.display === 'none' ? 'block' : 'none');
    });

    // 悬浮窗拖动功能（鼠标 + 触屏）/ Draggable panel (mouse + touch)
    let dragging = false, dragOffsetX = 0, dragOffsetY = 0;
    const headerEl = panel.querySelector('.header');
    function startDrag(clientX, clientY) {
        dragging = true;
        // 计算点击处与面板左上角的偏移
        dragOffsetX = clientX - panel.offsetLeft;
        dragOffsetY = clientY - panel.offsetTop;
    }
    function moveDrag(clientX, clientY) {
        if (!dragging) return;
        panel.style.left = (clientX - dragOffsetX) + 'px';
        panel.style.top = (clientY - dragOffsetY) + 'px';
        panel.style.bottom = 'auto';
        panel.style.right = 'auto';
    }
    function endDrag() { dragging = false; }
    headerEl.addEventListener('mousedown', (e) => {
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', endDrag);
    // 触屏拖动支持（移动端）/ Touch drag support (mobile)
    headerEl.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        e.preventDefault();  // 拖动时阻止页面滚动 / prevent page scroll while dragging
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);

    // “添加”按钮：批量添加状态项
    panel.querySelector('#stateExtAddBtn').onclick = () => {
        const text = panel.querySelector('#stateExtInput').value;
        if (!text.trim()) return;
        const lines = text.split(/\r?\n/);
        let modified = false;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const parts = trimmed.split(' ');
            if (parts.length < 2) continue;
            const name = parts[0];
            const value = parts.slice(1).join(' ');
            const existing = stateList.find(it => it.name === name);
            if (existing) {
                existing.value = value;
            } else {
                stateList.push({ name, value });
            }
            modified = true;
        }
        if (modified) {
            saveMeta();
            refreshListUI();
            panel.querySelector('#stateExtInput').value = '';
        }
    };

    // “生成世界书条目”按钮：复制当前状态列表的世界书格式文本
    panel.querySelector('#stateExtGenBtn').onclick = () => {
        if (stateList.length === 0) {
            alert(stateExtT('alertNoStates'));
            return;
        }
        let content = stateExtT('worldInfoHeader') + '\n';
        stateList.forEach(item => {
            content += `${item.name} ${item.value}\n`;
        });
        // 尝试写入剪贴板
        navigator.clipboard.writeText(content).then(() => {
            alert(stateExtT('alertCopied'));
        }).catch(() => {
            // 如果剪贴板不可用，则弹出可选择文本的对话框
            prompt(stateExtT('promptManualCopy'), content);
        });
    };

    // “从世界书提取”按钮：从剪贴板内容批量导入状态项
    panel.querySelector('#stateExtImpBtn').onclick = async () => {
        try {
            const clipText = await navigator.clipboard.readText();
            if (!clipText) {
                alert(stateExtT('alertClipboardEmpty'));
                return;
            }
            const lines = clipText.split(/\r?\n/);
            let imported = 0;
            for (let line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.endsWith('：') || trimmed.endsWith(':')) {
                    // 跳过空行和类似“角色状态：”的标题行
                    continue;
                }
                const parts = trimmed.split(' ');
                if (parts.length < 2) continue;
                const name = parts[0];
                const value = parts.slice(1).join(' ');
                const existing = stateList.find(it => it.name === name);
                if (existing) {
                    existing.value = value;
                } else {
                    stateList.push({ name, value });
                }
                imported++;
            }
            if (imported > 0) {
                saveMeta();
                refreshListUI();
                alert(stateExtT('alertImported', imported));
            } else {
                alert(stateExtT('alertNothingImported'));
            }
        } catch (err) {
            alert(stateExtT('alertClipboardFail'));
        }
    };

    async function initExtensionSettingsPanel(attempt = 0) {
        if (settingsPanelLoading) {
            return;
        }

        const renderTemplate = globalThis.renderExtensionTemplateAsync;
        if (typeof renderTemplate !== 'function') {
            return;
        }

        const container = document.getElementById('extensions_settings');
        if (!container) {
            if (attempt < 5) {
                setTimeout(() => initExtensionSettingsPanel(attempt + 1), 500);
            }
            return;
        }

        settingsPanelLoading = true;
        try {
            container.querySelector('#stateExtSettingsRoot')?.remove();

            const templateBases = ['third-party/SillyTavern-state', 'SillyTavern-state'];
            let templateHtml = '';
            for (const basePath of templateBases) {
                try {
                    const html = await renderTemplate(basePath, 'index');
                    if (html) {
                        templateHtml = html;
                        break;
                    }
                } catch (error) {
                    console.warn(`[Character Status] Failed to load settings template from ${basePath}:`, error);
                }
            }

            if (!templateHtml) {
                console.warn('[Character Status] Could not load the extension settings template.');
                return;
            }

            container.insertAdjacentHTML('beforeend', templateHtml);
            const root = container.querySelector('#stateExtSettingsRoot');
            if (!root) {
                return;
            }

            const enableToggle = root.querySelector('#stateExt-setting-enable');
            const languageSelect = root.querySelector('#stateExt-setting-language');
            const injectToggle = root.querySelector('#stateExt-setting-inject');
            const stripToggle = root.querySelector('#stateExt-setting-strip');
            const instructionTextarea = root.querySelector('#stateExt-setting-instruction');
            const restoreButton = root.querySelector('#stateExt-setting-restore');

            function syncControls(config) {
                if (enableToggle) enableToggle.checked = !!config.enabled;
                if (languageSelect) languageSelect.value = config.language || 'auto';
                if (injectToggle) injectToggle.checked = config.autoInjectPrompt !== false;
                if (stripToggle) stripToggle.checked = config.stripTagsFromChat !== false;
                if (instructionTextarea) instructionTextarea.value = config.customInstruction || '';
            }

            syncControls(getCurrentSettings());

            if (enableToggle) {
                enableToggle.addEventListener('change', () => {
                    stateExtUpdateSettings({ enabled: enableToggle.checked });
                });
            }

            if (languageSelect) {
                languageSelect.addEventListener('change', () => {
                    stateExtUpdateSettings({ language: languageSelect.value });
                    applyLanguageToUI();
                });
            }

            if (injectToggle) {
                injectToggle.addEventListener('change', () => {
                    stateExtUpdateSettings({ autoInjectPrompt: injectToggle.checked });
                });
            }

            if (stripToggle) {
                stripToggle.addEventListener('change', () => {
                    stateExtUpdateSettings({ stripTagsFromChat: stripToggle.checked });
                });
            }

            if (instructionTextarea) {
                let debounceTimer;
                const saveValue = () => {
                    stateExtUpdateSettings({ customInstruction: instructionTextarea.value });
                };
                instructionTextarea.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(saveValue, 400);
                });
                instructionTextarea.addEventListener('change', saveValue);
                instructionTextarea.addEventListener('blur', saveValue);
            }

            if (restoreButton) {
                restoreButton.addEventListener('click', () => {
                    const defaults = stateExtResetSettings();
                    syncControls(defaults);
                    window.alert(stateExtT('alertReset'));
                });
            }
        } finally {
            settingsPanelLoading = false;
            globalThis.stateExt.applyRuntimeSettings?.(getCurrentSettings());
        }
    }

    const settingsPanelListener = () => initExtensionSettingsPanel();
    globalThis.stateExt.settingsPanelListener = settingsPanelListener;
    eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, settingsPanelListener);
    initExtensionSettingsPanel();

    // 解析单条消息中的状态标签：更新状态列表，并按设置剥离标签，返回是否有更新
    // Process state tags in one message: update the state list, strip tags per settings.
    function processStateTagsInMessage(msg) {
        if (!msg || msg.is_user || !msg.mes) {
            return false;
        }
        const settings = getCurrentSettings();
        const content = msg.mes;
        const tagRegex = /<([^\/>]+)>([^<]+)<\/\1>/g;
        let match, updated = false;
        while ((match = tagRegex.exec(content)) !== null) {
            const [, name, newValue] = match;
            const item = stateList.find(it => it.name === name);
            if (item) {
                item.value = newValue;
            } else {
                stateList.push({ name, value: newValue });
            }
            updated = true;
        }
        // 移除消息中的所有状态标签，留下纯剧情文本
        // Strip all state tags from the message, leaving pure story text
        if (updated && settings.stripTagsFromChat !== false) {
            msg.mes = content.replace(/<[^>]+>[^<]*<\/[^>]+>/g, '').trim();
        }
        return updated;
    }

    // 监听聊天切换事件：切换对话时更新状态列表显示，
    // 并补扫历史消息中遗漏的状态标签（例如扩展不可用时接收的、或导入的聊天），
    // 确保状态栏能从已有聊天记录中恢复。
    // On chat switch: refresh the list, and retro-scan history for unprocessed state tags
    // (messages received while the extension was broken/disabled, or imported chats),
    // so the panel recovers stats from the existing chat log.
    globalThis.stateExt.chatHandler = () => {
        stateList = getStateList();
        try {
            const settings = getCurrentSettings();
            if (settings.enabled !== false) {
                const chatArr = SillyTavern.getContext().chat || [];
                let updated = false;
                for (const msg of chatArr) {
                    if (processStateTagsInMessage(msg)) {
                        updated = true;
                    }
                }
                if (updated) {
                    saveMeta();
                }
            }
        } catch (error) {
            console.error('[Character Status] Failed to scan chat history for state tags:', error);
        }
        refreshListUI();
    };
    eventSource.on(event_types.CHAT_CHANGED, globalThis.stateExt.chatHandler);
    // 页面加载时若已有打开的聊天，立即补扫一次 / Scan immediately if a chat is already open
    globalThis.stateExt.chatHandler();

    // 监听 AI 消息接收事件：解析并应用状态更新标签
    globalThis.stateExt.msgHandler = () => {
        try {
            const settings = getCurrentSettings();
            if (!settings.enabled) {
                return;
            }
            const chatArr = SillyTavern.getContext().chat;
            if (!chatArr.length) return;
            const lastMsg = chatArr[chatArr.length - 1];
            if (processStateTagsInMessage(lastMsg)) {
                saveMeta();
                refreshListUI();
            }
        } catch (error) {
            console.error('[Character Status] Failed to process state tags:', error);
        }
    };
    eventSource.on(event_types.MESSAGE_RECEIVED, globalThis.stateExt.msgHandler);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// 提示拦截器：在生成请求前插入当前状态（系统提示）
globalThis.statePromptInterceptor = async function(chat, contextSize, abort, type) {
    const settings = stateExtEnsureSettings();
    if (!settings.enabled || !settings.autoInjectPrompt) {
        return;
    }
    // 移除旧的状态系统提示，避免堆积
    for (let i = 0; i < chat.length; i++) {
        const msg = chat[i];
        if (!msg.is_user && msg.name === 'System Note' && msg.mes && STATE_EXT_NOTE_PREFIXES.some(prefix => msg.mes.startsWith(prefix))) {
            chat.splice(i, 1);
            i--;
        }
    }
    // 获取状态列表并构造提示文本
    const meta = SillyTavern.getContext().chatMetadata;
    const stateData = meta['sillyTavernState'];
    if (stateData && stateData.length > 0) {
        let stateText = stateExtT('promptHeader');
        stateData.forEach(item => {
            stateText += `\n${item.name} ${item.value}`;
        });
        stateText += '\n' + stateExtT('promptInstruction');
        const extraInstruction = (settings.customInstruction || '').trim();
        if (extraInstruction) {
            stateText += `\n${extraInstruction}`;
        }
        const systemNote = {
            is_user: false,
            name: 'System Note',
            send_date: Date.now(),
            mes: stateText
        };
        // 插入系统提示到最后一个用户消息之前
        chat.splice(chat.length - 1, 0, systemNote);
    }
};
