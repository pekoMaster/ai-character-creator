// 禁詞過濾工具
// 用於過濾不當內容，保持平台健康環境

// 禁詞列表（多語言）
const BANNED_WORDS = [
  // 約炮/交友相關
  '約炮', '約砲', '一夜情', '援交', '性服務', '陪睡',
  'hookup', 'one night stand', 'escort',
  '出会い系', 'セフレ', 'ワンナイト',

  // 詐騙相關
  '轉帳', '匯款', '先付款', '押金', '定金',
  'wire transfer', 'deposit first', 'pay first',
  '振込', '前払い', '手付金',

  // 票券倒賣
  '黃牛', '轉售', '轉賣', '高價出售', '加價',
  'scalper', 'resell', 'markup',
  '転売', 'ダフ屋', '高額販売',

  // 不當言論
  '臭', '醜', '肥', '死', '滾',

  // 敏感政治詞彙（避免爭議）
  // 可根據需要擴充
];

// 正則表達式特殊字符轉義
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 建立禁詞正則表達式
function createBannedWordsRegex(): RegExp {
  const patterns = BANNED_WORDS.map(word => escapeRegExp(word));
  return new RegExp(patterns.join('|'), 'gi');
}

const bannedWordsRegex = createBannedWordsRegex();

/**
 * 檢查文字是否包含禁詞
 * @param text 要檢查的文字
 * @returns 是否包含禁詞
 */
export function containsBannedWords(text: string): boolean {
  if (!text) return false;
  return bannedWordsRegex.test(text);
}

/**
 * 找出文字中的禁詞
 * @param text 要檢查的文字
 * @returns 找到的禁詞列表
 */
export function findBannedWords(text: string): string[] {
  if (!text) return [];
  const matches = text.match(bannedWordsRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * 替換禁詞為星號
 * @param text 原始文字
 * @returns 替換後的文字
 */
export function censorBannedWords(text: string): string {
  if (!text) return text;
  return text.replace(bannedWordsRegex, (match) => '*'.repeat(match.length));
}

/**
 * 驗證內容是否安全
 * @param content 要驗證的內容
 * @returns 驗證結果
 */
export function validateContent(content: string): {
  isValid: boolean;
  bannedWords: string[];
  message?: string;
} {
  const bannedWords = findBannedWords(content);

  if (bannedWords.length > 0) {
    return {
      isValid: false,
      bannedWords,
      message: `內容包含不當詞彙，請修改後重新提交`,
    };
  }

  return {
    isValid: true,
    bannedWords: [],
  };
}

// 導出禁詞列表（供管理後台使用）
export function getBannedWordsList(): string[] {
  return [...BANNED_WORDS];
}

// 新增禁詞（動態新增，僅限當前 session）
export function addBannedWord(word: string): void {
  if (!BANNED_WORDS.includes(word)) {
    BANNED_WORDS.push(word);
  }
}
