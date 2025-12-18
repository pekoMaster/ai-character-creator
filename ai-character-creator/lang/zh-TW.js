/**
 * 繁體中文語言檔案
 */
const LANG_ZH_TW = {
  // 語言資訊
  _code: 'zh-TW',
  _name: '繁體中文',
  _flag: '🇹🇼',

  // 通用
  common: {
    save: '儲存',
    cancel: '取消',
    confirm: '確認',
    close: '關閉',
    delete: '刪除',
    edit: '編輯',
    download: '下載',
    upload: '上傳',
    loading: '載入中...',
    error: '錯誤',
    success: '成功',
    warning: '警告',
    info: '資訊',
    back: '返回',
    refresh: '重新整理',
    search: '搜尋',
    all: '全部',
    author: '作者',
    version: '版本',
    type: '類型',
    tags: '標籤',
    uploadDate: '上傳時間',
    anonymous: '匿名',
    untitled: '未命名角色'
  },

  // 主頁面（角色卡編輯器）
  editor: {
    title: 'AI 互動聊天角色卡創作工具',
    subtitle: '輕鬆創建專屬於你的 AI 角色',
    // 模式切換
    simpleMode: '精簡模式',
    fullMode: '完整模式',
    // 區塊標題
    basicInfo: '基本資訊',
    personality: '性格設定',
    background: '背景故事',
    skills: '戰鬥與生活技能',
    customAttrs: '自訂屬性',
    dialogStyle: '對話風格',
    // 欄位標籤
    name: '角色名稱',
    namePlaceholder: '請輸入角色名稱',
    gender: '性別',
    age: '年齡',
    occupation: '職業',
    description: '角色描述',
    descriptionPlaceholder: '描述角色的外貌、穿著、氣質等',
    personalityTraits: '性格特質',
    personalityPlaceholder: '描述角色的性格特點、行為模式等',
    speakingStyle: '說話風格',
    speakingStylePlaceholder: '描述角色的說話方式、口頭禪等',
    // 按鈕
    newCard: '新建角色卡',
    importCard: '匯入角色卡',
    exportCard: '匯出',
    aiGenerate: 'AI 生成',
    uploadToPlatform: '上傳到平台',
    openPlatform: '共享平台',
    preview: '預覽',
    settings: '設定'
  },

  // 共享平台
  platform: {
    title: '角色卡共享平台',
    backToEditor: '返回編輯器',
    searchPlaceholder: '搜尋角色名稱、作者或標籤...',
    totalCards: '總共',
    cards: '張角色卡',
    createdBy: '由',
    authors: '位作者創建',
    noResults: '找不到符合條件的角色卡',
    tryAdjust: '試試調整篩選條件或搜尋關鍵字',
    fullVersion: '完整版',
    simpleVersion: '精簡版',
    // 詳情彈窗
    basicInfo: '基本資訊',
    characterDesc: '角色描述',
    personalitySection: '性格',
    tagsSection: '標籤',
    downloadAndImport: '下載並匯入',
    // 編輯/刪除
    editCard: '編輯',
    deleteCard: '刪除',
    verifyPassword: '驗證密碼',
    enterPassword: '請輸入此角色卡的編輯密碼',
    deleteWarning: '此操作無法復原！請輸入密碼確認刪除',
    passwordError: '密碼錯誤，請重試',
    noPasswordSet: '此角色卡沒有設定編輯密碼，無法編輯或刪除'
  },

  // 上傳對話框
  upload: {
    title: '上傳到共享平台',
    subtitle: '請填寫以下資訊，將您的角色卡分享給其他使用者！',
    authorName: '作者名稱',
    authorPlaceholder: '請輸入您的名稱或暱稱',
    tagsLabel: '分類標籤（選填）',
    tagsPlaceholder: '例：冒險者, 狐耳, 治療師（用逗號分隔）',
    thumbnailLabel: '縮圖連結（選填）',
    thumbnailPlaceholder: '角色圖片的網址（如 Imgur、Gyazo）',
    passwordLabel: '編輯密碼',
    passwordPlaceholder: '4-32 個字元',
    confirmPasswordLabel: '確認密碼',
    confirmPasswordPlaceholder: '再次輸入密碼',
    passwordHint: '設定編輯密碼，用於日後修改或刪除此角色卡',
    startUpload: '開始上傳',
    // 驗證訊息
    authorRequired: '請填寫作者名稱！',
    passwordRequired: '請設定編輯密碼！',
    passwordTooShort: '密碼至少需要 4 個字元！',
    passwordMismatch: '兩次密碼輸入不一致！',
    uploadSuccess: '角色卡已成功上傳到平台！',
    uploadFailed: '上傳失敗：',
    viewPlatform: '上傳成功！是否要前往共享平台查看？'
  },

  // 語言選擇器
  language: {
    title: 'Language',
    select: '選擇語言'
  },

  // Toast 訊息
  toast: {
    saveSuccess: '儲存成功',
    saveFailed: '儲存失敗',
    downloadSuccess: '下載成功！請在編輯器中匯入此檔案',
    downloadFailed: '下載失敗',
    loadingData: '正在載入角色資料...',
    redirecting: '正在跳轉到編輯器...',
    deleting: '正在刪除角色卡...',
    deleteSuccess: '角色卡已刪除',
    deleteFailed: '刪除失敗：',
    refreshing: '正在重新整理...',
    uploading: '正在上傳到平台...'
  }
};

// 導出
if (typeof window !== 'undefined') {
  window.LANG_ZH_TW = LANG_ZH_TW;
}
