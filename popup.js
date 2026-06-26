// ─── Language data ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { group: 'Popular' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Spanish (Español)' },
  { code: 'fr', label: '🇫🇷 French (Français)' },
  { code: 'de', label: '🇩🇪 German (Deutsch)' },
  { code: 'zh', label: '🇨🇳 Chinese (中文)' },
  { code: 'ja', label: '🇯🇵 Japanese (日本語)' },
  { code: 'ko', label: '🇰🇷 Korean (한국어)' },
  { code: 'ar', label: '🇸🇦 Arabic (العربية)' },
  { code: 'pt', label: '🇧🇷 Portuguese (Português)' },
  { code: 'ru', label: '🇷🇺 Russian (Русский)' },
  { group: 'Indian Languages' },
  { code: 'hi', label: '🇮🇳 Hindi (हिन्दी)' },
  { code: 'te', label: '🇮🇳 Telugu (తెలుగు)' },
  { code: 'ta', label: '🇮🇳 Tamil (தமிழ்)' },
  { code: 'kn', label: '🇮🇳 Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: '🇮🇳 Malayalam (മലയാളം)' },
  { code: 'mr', label: '🇮🇳 Marathi (मराठी)' },
  { code: 'bn', label: '🇧🇩 Bengali (বাংলা)' },
  { code: 'gu', label: '🇮🇳 Gujarati (ગુજરાતી)' },
  { code: 'pa', label: '🇮🇳 Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', label: '🇵🇰 Urdu (اردو)' },
  { group: 'European' },
  { code: 'it', label: '🇮🇹 Italian (Italiano)' },
  { code: 'nl', label: '🇳🇱 Dutch (Nederlands)' },
  { code: 'pl', label: '🇵🇱 Polish (Polski)' },
  { code: 'sv', label: '🇸🇪 Swedish (Svenska)' },
  { code: 'tr', label: '🇹🇷 Turkish (Türkçe)' },
  { code: 'el', label: '🇬🇷 Greek (Ελληνικά)' },
  { code: 'cs', label: '🇨🇿 Czech (Čeština)' },
  { code: 'ro', label: '🇷🇴 Romanian (Română)' },
  { code: 'hu', label: '🇭🇺 Hungarian (Magyar)' },
  { code: 'uk', label: '🇺🇦 Ukrainian (Українська)' },
  { group: 'Asian & Others' },
  { code: 'id', label: '🇮🇩 Indonesian (Bahasa)' },
  { code: 'ms', label: '🇲🇾 Malay (Bahasa Melayu)' },
  { code: 'th', label: '🇹🇭 Thai (ภาษาไทย)' },
  { code: 'vi', label: '🇻🇳 Vietnamese (Tiếng Việt)' },
  { code: 'fa', label: '🇮🇷 Persian (فارسی)' },
  { code: 'he', label: '🇮🇱 Hebrew (עברית)' },
  { code: 'sw', label: '🇰🇪 Swahili (Kiswahili)' },
  { code: 'af', label: '🇿🇦 Afrikaans' },
];

const LANG_NAMES = Object.fromEntries(
  LANGUAGES.filter(l => l.code).map(l => [l.code, l.label.replace(/^.+?\s/, '').replace(/\s*\(.*\)/, '')])
);

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const statusEl       = document.getElementById('status');
const btnEl          = document.getElementById('translateBtn');
const langEl         = document.getElementById('langSelect');        // hidden real select
const progressWrap   = document.getElementById('progressWrap');
const progressBar    = document.getElementById('progressBar');
const picker         = document.getElementById('langPicker');
const selectedText   = document.getElementById('langSelectedText');
const dropdown       = document.getElementById('langDropdown');
const searchInput    = document.getElementById('langSearch');
const langList       = document.getElementById('langList');
const noResults      = document.getElementById('langNoResults');

// ─── Build language list ──────────────────────────────────────────────────────
let currentCode = 'en';

function buildList(filter = '') {
  langList.innerHTML = '';
  const q = filter.trim().toLowerCase();
  let anyVisible = false;
  let lastGroup = null;

  for (const item of LANGUAGES) {
    if (item.group) {
      lastGroup = item.group;
      continue; // inject group label lazily when we have matching children
    }
    if (q && !item.label.toLowerCase().includes(q)) continue;

    // Insert group header if not yet added
    if (lastGroup) {
      const gh = document.createElement('div');
      gh.className = 'lang-group-label';
      gh.textContent = lastGroup;
      langList.appendChild(gh);
      lastGroup = null;
    }

    const div = document.createElement('div');
    div.className = 'lang-option' + (item.code === currentCode ? ' selected' : '');
    div.dataset.code = item.code;
    div.textContent = item.label;
    div.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep focus from blurring search
      selectLang(item.code, item.label);
    });
    langList.appendChild(div);
    anyVisible = true;
  }

  noResults.style.display = anyVisible ? 'none' : 'block';
}

function selectLang(code, label) {
  currentCode = code;
  langEl.value = code;
  selectedText.textContent = label;
  chrome.storage.local.set({ preferredLang: code });
  closePicker();
}

function openPicker() {
  picker.classList.add('open');
  searchInput.value = '';
  buildList();
  searchInput.focus();
  // Scroll selected item into view
  const sel = langList.querySelector('.selected');
  if (sel) sel.scrollIntoView({ block: 'nearest' });
}

function closePicker() {
  picker.classList.remove('open');
  searchInput.value = '';
}

// Toggle on click of the display row
document.getElementById('langSelectedDisplay').addEventListener('click', () => {
  picker.classList.contains('open') ? closePicker() : openPicker();
});

// Close when clicking outside
document.addEventListener('mousedown', (e) => {
  if (!picker.contains(e.target)) closePicker();
});

// Live search filter
searchInput.addEventListener('input', () => buildList(searchInput.value));

// Keyboard nav inside search
searchInput.addEventListener('keydown', (e) => {
  const options = [...langList.querySelectorAll('.lang-option')];
  const hi = langList.querySelector('.highlighted');
  let idx = options.indexOf(hi);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (hi) hi.classList.remove('highlighted');
    idx = Math.min(idx + 1, options.length - 1);
    if (idx < 0) idx = 0;
    options[idx]?.classList.add('highlighted');
    options[idx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (hi) hi.classList.remove('highlighted');
    idx = Math.max(idx - 1, 0);
    options[idx]?.classList.add('highlighted');
    options[idx]?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const target = hi || options[0];
    if (target) selectLang(target.dataset.code, target.textContent);
  } else if (e.key === 'Escape') {
    closePicker();
  }
});

// ─── Restore saved language ───────────────────────────────────────────────────
chrome.storage.local.get(['preferredLang'], (res) => {
  const saved = res.preferredLang;
  const found = LANGUAGES.find(l => l.code === saved);
  if (found) {
    currentCode = found.code;
    langEl.value = found.code;
    selectedText.textContent = found.label;
  }
});

// ─── Status / progress helpers ────────────────────────────────────────────────
function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = type;
}
function setProgress(pct) {
  progressWrap.classList.toggle('visible', pct > 0 && pct < 100);
  progressBar.style.width = pct + '%';
}
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// ─── Translate button ─────────────────────────────────────────────────────────
btnEl.addEventListener('click', async () => {
  const targetLang = currentCode;

  btnEl.disabled = true;
  setProgress(5);
  setStatus('Starting translation...');

  try {
    const tab = await getActiveTab();
    if (!tab || !tab.id) throw new Error('No active tab found.');

    if (!/^https?:\/\//.test(tab.url || '')) {
      throw new Error("Can't translate this page. Try a regular http/https page.");
    }

    if (targetLang === 'en') {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.location.reload()
      });
      setStatus('Page reloaded in English.', 'success');
      setProgress(100);
      setTimeout(() => { setProgress(0); btnEl.disabled = false; }, 1500);
      return;
    }

    setProgress(15);
    setStatus('Scanning page text...');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });

    setProgress(30);
    setStatus(`Translating to ${LANG_NAMES[targetLang]}...`);

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: inPageTranslate,
      args: [targetLang]
    });

    const outcome = result?.[0]?.result;
    if (outcome?.error) throw new Error(outcome.error);

    setProgress(100);
    setStatus(`✓ Page translated to ${LANG_NAMES[targetLang]}! (${outcome?.count ?? '?'} chunks)`, 'success');
    setTimeout(() => { setProgress(0); btnEl.disabled = false; }, 2000);

  } catch (err) {
    setProgress(0);
    setStatus(`Error: ${err.message}`, 'error');
    btnEl.disabled = false;
  }
});

// ─── In-page translation (injected into the active tab) ──────────────────────
async function inPageTranslate(targetLang) {
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'NAV', 'SVG',
    'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'CANVAS', 'CODE', 'PRE'
  ]);

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }

  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-sumly-skip]')) return NodeFilter.FILTER_REJECT;
      if (!isVisible(parent)) return NodeFilter.FILTER_REJECT;
      const val = node.nodeValue?.trim();
      if (!val || val.length < 2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) textNodes.push(walker.currentNode);
  if (textNodes.length === 0) return { error: 'No translatable text found on this page.' };

  const CHUNK_SIZE = 450;
  const SEP = '\u2063';
  const chunks = [];
  let current = { text: '', nodes: [], originals: [] };

  for (const node of textNodes) {
    const val = node.nodeValue.trim();
    if (!val) continue;
    if (current.text.length + val.length + SEP.length > CHUNK_SIZE && current.nodes.length > 0) {
      chunks.push(current);
      current = { text: '', nodes: [], originals: [] };
    }
    if (current.text.length > 0) current.text += SEP;
    current.text += val;
    current.nodes.push(node);
    current.originals.push(node.nodeValue);
  }
  if (current.nodes.length > 0) chunks.push(current);

  async function translateChunk(text) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (!translated) throw new Error('Empty translation response');
    return translated;
  }

  let successCount = 0;
  for (const chunk of chunks) {
    try {
      const translated = await translateChunk(chunk.text);
      const parts = translated.split(SEP);
      for (let i = 0; i < chunk.nodes.length; i++) {
        const newText = parts[i] !== undefined ? parts[i].trim() : (parts[parts.length - 1] || chunk.originals[i]);
        if (newText) chunk.nodes[i].nodeValue = newText;
      }
      successCount++;
    } catch { /* leave original on failure */ }
    await new Promise(r => setTimeout(r, 120));
  }

  return { count: successCount };
}
