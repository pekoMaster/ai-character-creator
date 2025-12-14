/**
 * 日本語言語ファイル
 */
const LANG_JA = {
  // 言語情報
  _code: 'ja',
  _name: '日本語',
  _flag: '🇯🇵',

  // 共通
  common: {
    save: '保存',
    cancel: 'キャンセル',
    confirm: '確認',
    close: '閉じる',
    delete: '削除',
    edit: '編集',
    download: 'ダウンロード',
    upload: 'アップロード',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    warning: '警告',
    info: '情報',
    back: '戻る',
    refresh: '更新',
    search: '検索',
    all: 'すべて',
    author: '作者',
    version: 'バージョン',
    type: 'タイプ',
    tags: 'タグ',
    uploadDate: 'アップロード日',
    anonymous: '匿名',
    untitled: '名前未設定キャラクター'
  },

  // メインページ（キャラクターカードエディター）
  editor: {
    title: 'AIキャラクターカード作成ツール',
    subtitle: 'オリジナルのAIキャラクターを簡単に作成',
    // モード切替
    simpleMode: 'シンプルモード',
    fullMode: 'フルモード',
    // セクションタイトル
    basicInfo: '基本情報',
    personality: '性格設定',
    background: 'バックストーリー',
    skills: '戦闘・生活スキル',
    customAttrs: 'カスタム属性',
    dialogStyle: '対話スタイル',
    // フィールドラベル
    name: 'キャラクター名',
    namePlaceholder: 'キャラクター名を入力',
    gender: '性別',
    age: '年齢',
    occupation: '職業',
    description: 'キャラクター説明',
    descriptionPlaceholder: 'キャラクターの外見、服装、雰囲気などを説明',
    personalityTraits: '性格特性',
    personalityPlaceholder: 'キャラクターの性格、行動パターンなどを説明',
    speakingStyle: '話し方',
    speakingStylePlaceholder: 'キャラクターの話し方、口癖などを説明',
    // ボタン
    newCard: '新規作成',
    importCard: 'インポート',
    exportCard: 'エクスポート',
    aiGenerate: 'AI生成',
    uploadToPlatform: 'プラットフォームにアップロード',
    openPlatform: '共有プラットフォーム',
    preview: 'プレビュー',
    settings: '設定'
  },

  // 共有プラットフォーム
  platform: {
    title: 'キャラクターカード共有プラットフォーム',
    backToEditor: 'エディターに戻る',
    searchPlaceholder: '名前、作者、タグで検索...',
    totalCards: '合計',
    cards: '枚のキャラクターカード',
    createdBy: '',
    authors: '人の作者が作成',
    noResults: '条件に一致するキャラクターカードが見つかりません',
    tryAdjust: 'フィルターや検索キーワードを調整してください',
    fullVersion: 'フルバージョン',
    simpleVersion: 'シンプルバージョン',
    // 詳細モーダル
    basicInfo: '基本情報',
    characterDesc: 'キャラクター説明',
    personalitySection: '性格',
    tagsSection: 'タグ',
    downloadAndImport: 'ダウンロード＆インポート',
    // 編集/削除
    editCard: '編集',
    deleteCard: '削除',
    verifyPassword: 'パスワード確認',
    enterPassword: 'このキャラクターカードの編集パスワードを入力してください',
    deleteWarning: 'この操作は取り消せません！パスワードを入力して削除を確認してください',
    passwordError: 'パスワードが間違っています。もう一度お試しください',
    noPasswordSet: 'このキャラクターカードにはパスワードが設定されていないため、編集・削除できません'
  },

  // アップロードダイアログ
  upload: {
    title: '共有プラットフォームにアップロード',
    subtitle: '以下の情報を入力して、キャラクターカードを他のユーザーと共有しましょう！',
    authorName: '作者名',
    authorPlaceholder: '名前またはニックネームを入力',
    tagsLabel: 'タグ（任意）',
    tagsPlaceholder: '例：冒険者, 狐耳, ヒーラー（カンマ区切り）',
    thumbnailLabel: 'サムネイルURL（任意）',
    thumbnailPlaceholder: '画像のURL（Imgur、Gyazoなど）',
    passwordLabel: '編集パスワード',
    passwordPlaceholder: '4〜32文字',
    confirmPasswordLabel: 'パスワード確認',
    confirmPasswordPlaceholder: 'パスワードを再入力',
    passwordHint: '将来の変更や削除のために編集パスワードを設定してください',
    startUpload: 'アップロード開始',
    // バリデーションメッセージ
    authorRequired: '作者名を入力してください！',
    passwordRequired: '編集パスワードを設定してください！',
    passwordTooShort: 'パスワードは4文字以上必要です！',
    passwordMismatch: 'パスワードが一致しません！',
    uploadSuccess: 'キャラクターカードが正常にアップロードされました！',
    uploadFailed: 'アップロード失敗：',
    viewPlatform: 'アップロード成功！共有プラットフォームを見ますか？'
  },

  // 言語セレクター
  language: {
    title: 'Language',
    select: '言語を選択'
  },

  // Toastメッセージ
  toast: {
    saveSuccess: '保存しました',
    saveFailed: '保存に失敗しました',
    downloadSuccess: 'ダウンロード成功！エディターでインポートしてください',
    downloadFailed: 'ダウンロードに失敗しました',
    loadingData: 'キャラクターデータを読み込み中...',
    redirecting: 'エディターにリダイレクト中...',
    deleting: 'キャラクターカードを削除中...',
    deleteSuccess: 'キャラクターカードを削除しました',
    deleteFailed: '削除に失敗しました：',
    refreshing: '更新中...',
    uploading: 'プラットフォームにアップロード中...'
  }
};

// エクスポート
if (typeof window !== 'undefined') {
  window.LANG_JA = LANG_JA;
}
