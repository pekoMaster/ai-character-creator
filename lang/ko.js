/**
 * 한국어 언어 파일
 */
const LANG_KO = {
  // 언어 정보
  _code: 'ko',
  _name: '한국어',
  _flag: '🇰🇷',

  // 공통
  common: {
    save: '저장',
    cancel: '취소',
    confirm: '확인',
    close: '닫기',
    delete: '삭제',
    edit: '편집',
    download: '다운로드',
    upload: '업로드',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    warning: '경고',
    info: '정보',
    back: '뒤로',
    refresh: '새로고침',
    search: '검색',
    all: '전체',
    author: '작성자',
    version: '버전',
    type: '유형',
    tags: '태그',
    uploadDate: '업로드 날짜',
    anonymous: '익명',
    untitled: '이름 없는 캐릭터'
  },

  // 메인 페이지 (캐릭터 카드 에디터)
  editor: {
    title: 'AI 캐릭터 카드 생성 도구',
    subtitle: '나만의 AI 캐릭터를 쉽게 만들어보세요',
    // 모드 전환
    simpleMode: '간단 모드',
    fullMode: '전체 모드',
    // 섹션 제목
    basicInfo: '기본 정보',
    personality: '성격 설정',
    background: '배경 스토리',
    skills: '전투 및 생활 스킬',
    customAttrs: '사용자 정의 속성',
    dialogStyle: '대화 스타일',
    // 필드 라벨
    name: '캐릭터 이름',
    namePlaceholder: '캐릭터 이름을 입력하세요',
    gender: '성별',
    age: '나이',
    occupation: '직업',
    description: '캐릭터 설명',
    descriptionPlaceholder: '캐릭터의 외모, 복장, 분위기 등을 설명하세요',
    personalityTraits: '성격 특성',
    personalityPlaceholder: '캐릭터의 성격, 행동 패턴 등을 설명하세요',
    speakingStyle: '말투',
    speakingStylePlaceholder: '캐릭터의 말하는 방식, 말버릇 등을 설명하세요',
    // 버튼
    newCard: '새로 만들기',
    importCard: '가져오기',
    exportCard: '내보내기',
    aiGenerate: 'AI 생성',
    uploadToPlatform: '플랫폼에 업로드',
    openPlatform: '공유 플랫폼',
    preview: '미리보기',
    settings: '설정'
  },

  // 공유 플랫폼
  platform: {
    title: '캐릭터 카드 공유 플랫폼',
    backToEditor: '에디터로 돌아가기',
    searchPlaceholder: '이름, 작성자 또는 태그로 검색...',
    totalCards: '총',
    cards: '개의 캐릭터 카드',
    createdBy: '',
    authors: '명의 작성자가 만듦',
    noResults: '조건에 맞는 캐릭터 카드를 찾을 수 없습니다',
    tryAdjust: '필터나 검색어를 조정해 보세요',
    fullVersion: '전체 버전',
    simpleVersion: '간단 버전',
    // 상세 모달
    basicInfo: '기본 정보',
    characterDesc: '캐릭터 설명',
    personalitySection: '성격',
    tagsSection: '태그',
    downloadAndImport: '다운로드 및 가져오기',
    // 편집/삭제
    editCard: '편집',
    deleteCard: '삭제',
    verifyPassword: '비밀번호 확인',
    enterPassword: '이 캐릭터 카드의 편집 비밀번호를 입력하세요',
    deleteWarning: '이 작업은 취소할 수 없습니다! 비밀번호를 입력하여 삭제를 확인하세요',
    passwordError: '비밀번호가 올바르지 않습니다. 다시 시도해 주세요',
    noPasswordSet: '이 캐릭터 카드에는 비밀번호가 설정되어 있지 않아 편집하거나 삭제할 수 없습니다'
  },

  // 업로드 다이얼로그
  upload: {
    title: '공유 플랫폼에 업로드',
    subtitle: '아래 정보를 입력하여 캐릭터 카드를 다른 사용자와 공유하세요!',
    authorName: '작성자 이름',
    authorPlaceholder: '이름 또는 닉네임을 입력하세요',
    tagsLabel: '태그 (선택사항)',
    tagsPlaceholder: '예: 모험가, 여우귀, 힐러 (쉼표로 구분)',
    thumbnailLabel: '썸네일 URL (선택사항)',
    thumbnailPlaceholder: '이미지 URL (예: Imgur, Gyazo)',
    passwordLabel: '편집 비밀번호',
    passwordPlaceholder: '4-32자',
    confirmPasswordLabel: '비밀번호 확인',
    confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
    passwordHint: '향후 수정 또는 삭제를 위한 편집 비밀번호를 설정하세요',
    startUpload: '업로드 시작',
    // 유효성 검사 메시지
    authorRequired: '작성자 이름을 입력하세요!',
    passwordRequired: '편집 비밀번호를 설정하세요!',
    passwordTooShort: '비밀번호는 최소 4자 이상이어야 합니다!',
    passwordMismatch: '비밀번호가 일치하지 않습니다!',
    uploadSuccess: '캐릭터 카드가 성공적으로 업로드되었습니다!',
    uploadFailed: '업로드 실패: ',
    viewPlatform: '업로드 성공! 공유 플랫폼을 보시겠습니까?'
  },

  // 언어 선택기
  language: {
    title: 'Language',
    select: '언어 선택'
  },

  // Toast 메시지
  toast: {
    saveSuccess: '저장되었습니다',
    saveFailed: '저장에 실패했습니다',
    downloadSuccess: '다운로드 성공! 에디터에서 가져오세요',
    downloadFailed: '다운로드에 실패했습니다',
    loadingData: '캐릭터 데이터를 불러오는 중...',
    redirecting: '에디터로 리디렉션 중...',
    deleting: '캐릭터 카드 삭제 중...',
    deleteSuccess: '캐릭터 카드가 삭제되었습니다',
    deleteFailed: '삭제 실패: ',
    refreshing: '새로고침 중...',
    uploading: '플랫폼에 업로드 중...'
  }
};

// 내보내기
if (typeof window !== 'undefined') {
  window.LANG_KO = LANG_KO;
}
