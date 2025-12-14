/**
 * 多語言系統核心模組
 * Internationalization (i18n) Core Module
 */
const I18n = {
  // 支援的語言列表
  supportedLanguages: ['zh-TW', 'en', 'ja', 'ko'],

  // 語言資料
  languages: {
    'zh-TW': null,
    'en': null,
    'ja': null,
    'ko': null
  },

  // 當前語言
  currentLanguage: 'zh-TW',

  // 語言變更回調函數
  onLanguageChange: null,

  /**
   * 初始化多語言系統
   */
  init: function() {
    // 從 localStorage 讀取語言設定
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.supportedLanguages.includes(savedLang)) {
      this.currentLanguage = savedLang;
    } else {
      // 嘗試偵測瀏覽器語言
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang) {
        // 處理類似 'zh-TW', 'en-US', 'ja-JP' 的情況
        if (browserLang.startsWith('zh')) {
          this.currentLanguage = 'zh-TW';
        } else if (browserLang.startsWith('ja')) {
          this.currentLanguage = 'ja';
        } else if (browserLang.startsWith('ko')) {
          this.currentLanguage = 'ko';
        } else if (browserLang.startsWith('en')) {
          this.currentLanguage = 'en';
        }
      }
    }

    // 載入語言資料（假設已經通過 script 標籤載入）
    this.languages['zh-TW'] = window.LANG_ZH_TW || null;
    this.languages['en'] = window.LANG_EN || null;
    this.languages['ja'] = window.LANG_JA || null;
    this.languages['ko'] = window.LANG_KO || null;

    // 調試日誌
    const loadedLangs = Object.entries(this.languages)
      .filter(([k, v]) => v !== null)
      .map(([k]) => k);
    console.log('[I18n] Initialized. Current language:', this.currentLanguage, 'Loaded languages:', loadedLangs);

    return this;
  },

  /**
   * 取得翻譯文字
   * @param {string} key - 翻譯鍵值，支援點號分隔 (例如: 'common.save')
   * @param {object} params - 替換參數
   * @returns {string} 翻譯後的文字
   */
  t: function(key, params = {}) {
    const lang = this.languages[this.currentLanguage];
    if (!lang) {
      console.warn(`Language data not loaded for: ${this.currentLanguage}`);
      return key;
    }

    // 解析點號分隔的鍵值
    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 找不到翻譯，嘗試使用預設語言（繁體中文）
        if (this.currentLanguage !== 'zh-TW') {
          return this.getDefault(key, params);
        }
        return key;
      }
    }

    // 替換參數
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      }
    }

    return value;
  },

  /**
   * 取得預設語言（繁體中文）的翻譯
   */
  getDefault: function(key, params = {}) {
    const lang = this.languages['zh-TW'];
    if (!lang) return key;

    const keys = key.split('.');
    let value = lang;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      }
    }

    return value;
  },

  /**
   * 切換語言
   * @param {string} langCode - 語言代碼
   */
  setLanguage: function(langCode) {
    if (!this.supportedLanguages.includes(langCode)) {
      console.warn(`Unsupported language: ${langCode}`);
      return false;
    }

    this.currentLanguage = langCode;
    localStorage.setItem('preferredLanguage', langCode);

    // 觸發回調
    if (typeof this.onLanguageChange === 'function') {
      this.onLanguageChange(langCode);
    }

    // 觸發自訂事件
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));

    return true;
  },

  /**
   * 取得當前語言資訊
   */
  getCurrentLanguageInfo: function() {
    const lang = this.languages[this.currentLanguage];
    if (!lang) return null;

    return {
      code: lang._code,
      name: lang._name,
      flag: lang._flag
    };
  },

  /**
   * 取得所有支援的語言資訊
   */
  getAllLanguages: function() {
    const result = [];
    for (const code of this.supportedLanguages) {
      const lang = this.languages[code];
      if (lang) {
        result.push({
          code: lang._code,
          name: lang._name,
          flag: lang._flag
        });
      }
    }
    return result;
  },

  /**
   * 建立語言選擇器 HTML
   * @param {string} position - 位置樣式 ('top-right', 'inline')
   * @returns {string} HTML 字串
   */
  createLanguageSelectorHTML: function(position = 'top-right') {
    const currentLang = this.getCurrentLanguageInfo();
    const allLangs = this.getAllLanguages();

    const positionClass = position === 'top-right' ? 'language-selector-fixed' : 'language-selector-inline';

    let html = `
      <div class="language-selector ${positionClass}" id="languageSelector">
        <button class="language-btn" id="languageBtn" onclick="I18n.toggleDropdown()">
          <span class="lang-flag">${currentLang?.flag || ''}</span>
          <span class="lang-text">Language</span>
          <span class="lang-arrow">▼</span>
        </button>
        <div class="language-dropdown" id="languageDropdown">
    `;

    for (const lang of allLangs) {
      const isActive = lang.code === this.currentLanguage ? 'active' : '';
      html += `
          <div class="language-option ${isActive}" onclick="I18n.selectLanguage('${lang.code}')">
            <span class="lang-flag">${lang.flag}</span>
            <span class="lang-name">${lang.name}</span>
          </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  },

  /**
   * 切換下拉選單顯示狀態
   */
  toggleDropdown: function() {
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  },

  /**
   * 選擇語言
   */
  selectLanguage: function(langCode) {
    this.setLanguage(langCode);
    this.toggleDropdown();

    // 更新選擇器顯示
    this.updateSelectorDisplay();

    // 更新頁面文字
    this.updatePageTexts();
  },

  /**
   * 更新選擇器顯示
   */
  updateSelectorDisplay: function() {
    const currentLang = this.getCurrentLanguageInfo();
    const btn = document.getElementById('languageBtn');
    if (btn && currentLang) {
      const flagSpan = btn.querySelector('.lang-flag');
      if (flagSpan) {
        flagSpan.textContent = currentLang.flag;
      }
    }

    // 更新活動狀態
    const options = document.querySelectorAll('.language-option');
    options.forEach(opt => {
      const langCode = opt.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if (langCode === this.currentLanguage) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  },

  /**
   * 更新頁面上所有帶有 data-i18n 屬性的元素
   */
  updatePageTexts: function() {
    // 更新文字內容
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = this.t(key);
      }
    });

    // 更新 title 屬性
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.title = this.t(key);
      }
    });
  },

  /**
   * 注入語言選擇器的 CSS 樣式
   */
  injectStyles: function() {
    if (document.getElementById('i18n-styles')) return;

    const styles = `
      .language-selector {
        position: relative;
        z-index: 9999;
      }

      .language-selector-fixed {
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 9999;
      }

      .language-selector-inline {
        display: inline-block;
      }

      .language-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .language-btn:hover {
        background: #fff;
        border-color: #4a90d9;
        box-shadow: 0 2px 12px rgba(74, 144, 217, 0.2);
      }

      .lang-flag {
        font-size: 18px;
      }

      .lang-text {
        font-weight: 500;
      }

      .lang-arrow {
        font-size: 10px;
        color: #666;
        transition: transform 0.2s ease;
      }

      .language-dropdown.show + .language-btn .lang-arrow,
      .language-btn:focus + .language-dropdown.show ~ .lang-arrow {
        transform: rotate(180deg);
      }

      .language-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 4px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        min-width: 140px;
        overflow: hidden;
      }

      .language-dropdown.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .language-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .language-option:hover {
        background: #f5f5f5;
      }

      .language-option.active {
        background: #e8f4fc;
        color: #4a90d9;
      }

      .language-option .lang-flag {
        font-size: 20px;
      }

      .language-option .lang-name {
        font-size: 14px;
        font-weight: 500;
      }

      /* 深色主題支援 */
      @media (prefers-color-scheme: dark) {
        .language-btn {
          background: rgba(40, 40, 40, 0.95);
          border-color: #444;
          color: #eee;
        }

        .language-btn:hover {
          background: #333;
          border-color: #4a90d9;
        }

        .language-dropdown {
          background: #2a2a2a;
          border-color: #444;
        }

        .language-option:hover {
          background: #333;
        }

        .language-option.active {
          background: #1a3a5c;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'i18n-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  },

  /**
   * 在頁面上插入語言選擇器
   * @param {string} containerId - 容器元素 ID（可選，預設插入到 body）
   * @param {string} position - 位置樣式
   */
  insertSelector: function(containerId = null, position = 'top-right') {
    this.injectStyles();

    const html = this.createLanguageSelectorHTML(position);

    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
        console.log('[I18n] Language selector inserted into container:', containerId);
      } else {
        console.warn('[I18n] Container not found:', containerId, '- inserting into body');
        document.body.insertAdjacentHTML('afterbegin', html);
      }
    } else {
      // 插入到 body 開頭
      document.body.insertAdjacentHTML('afterbegin', html);
      console.log('[I18n] Language selector inserted into body');
    }

    // 點擊外部關閉下拉選單
    document.addEventListener('click', (e) => {
      const selector = document.getElementById('languageSelector');
      if (selector && !selector.contains(e.target)) {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
          dropdown.classList.remove('show');
        }
      }
    });
  }
};

// 導出
if (typeof window !== 'undefined') {
  window.I18n = I18n;
}
