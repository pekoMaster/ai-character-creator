/**
 * English Language File
 */
const LANG_EN = {
  // Language Info
  _code: 'en',
  _name: 'English',
  _flag: '🇺🇸',

  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    download: 'Download',
    upload: 'Upload',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',
    back: 'Back',
    refresh: 'Refresh',
    search: 'Search',
    all: 'All',
    author: 'Author',
    version: 'Version',
    type: 'Type',
    tags: 'Tags',
    uploadDate: 'Upload Date',
    anonymous: 'Anonymous',
    untitled: 'Untitled Character'
  },

  // Main Page (Character Card Editor)
  editor: {
    title: 'AI Character Card Creator',
    subtitle: 'Easily create your own AI character',
    // Mode Switch
    simpleMode: 'Simple Mode',
    fullMode: 'Full Mode',
    // Section Titles
    basicInfo: 'Basic Info',
    personality: 'Personality',
    background: 'Background Story',
    skills: 'Combat & Life Skills',
    customAttrs: 'Custom Attributes',
    dialogStyle: 'Dialog Style',
    // Field Labels
    name: 'Character Name',
    namePlaceholder: 'Enter character name',
    gender: 'Gender',
    age: 'Age',
    occupation: 'Occupation',
    description: 'Description',
    descriptionPlaceholder: 'Describe the character\'s appearance, clothing, aura, etc.',
    personalityTraits: 'Personality Traits',
    personalityPlaceholder: 'Describe the character\'s personality, behavior patterns, etc.',
    speakingStyle: 'Speaking Style',
    speakingStylePlaceholder: 'Describe how the character speaks, catchphrases, etc.',
    // Buttons
    newCard: 'New Card',
    importCard: 'Import',
    exportCard: 'Export',
    aiGenerate: 'AI Generate',
    uploadToPlatform: 'Upload to Platform',
    openPlatform: 'Sharing Platform',
    preview: 'Preview',
    settings: 'Settings'
  },

  // Sharing Platform
  platform: {
    title: 'Character Card Sharing Platform',
    backToEditor: 'Back to Editor',
    searchPlaceholder: 'Search by name, author, or tags...',
    totalCards: 'Total',
    cards: 'character cards',
    createdBy: 'Created by',
    authors: 'authors',
    noResults: 'No matching character cards found',
    tryAdjust: 'Try adjusting the filters or search keywords',
    fullVersion: 'Full Version',
    simpleVersion: 'Simple Version',
    // Detail Modal
    basicInfo: 'Basic Info',
    characterDesc: 'Character Description',
    personalitySection: 'Personality',
    tagsSection: 'Tags',
    downloadAndImport: 'Download & Import',
    // Edit/Delete
    editCard: 'Edit',
    deleteCard: 'Delete',
    verifyPassword: 'Verify Password',
    enterPassword: 'Enter the edit password for this character card',
    deleteWarning: 'This action cannot be undone! Enter password to confirm deletion',
    passwordError: 'Incorrect password, please try again',
    noPasswordSet: 'This character card has no password set and cannot be edited or deleted'
  },

  // Upload Dialog
  upload: {
    title: 'Upload to Sharing Platform',
    subtitle: 'Fill in the information below to share your character card with others!',
    authorName: 'Author Name',
    authorPlaceholder: 'Enter your name or nickname',
    tagsLabel: 'Tags (Optional)',
    tagsPlaceholder: 'e.g., Adventurer, Fox Ears, Healer (comma separated)',
    thumbnailLabel: 'Thumbnail URL (Optional)',
    thumbnailPlaceholder: 'Image URL (e.g., Imgur, Gyazo)',
    passwordLabel: 'Edit Password',
    passwordPlaceholder: '4-32 characters',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Enter password again',
    passwordHint: 'Set an edit password for future modifications or deletion',
    startUpload: 'Start Upload',
    // Validation Messages
    authorRequired: 'Please enter author name!',
    passwordRequired: 'Please set an edit password!',
    passwordTooShort: 'Password must be at least 4 characters!',
    passwordMismatch: 'Passwords do not match!',
    uploadSuccess: 'Character card uploaded successfully!',
    uploadFailed: 'Upload failed: ',
    viewPlatform: 'Upload successful! Would you like to view the sharing platform?'
  },

  // Language Selector
  language: {
    title: 'Language',
    select: 'Select Language'
  },

  // Toast Messages
  toast: {
    saveSuccess: 'Saved successfully',
    saveFailed: 'Save failed',
    downloadSuccess: 'Download successful! Please import in the editor',
    downloadFailed: 'Download failed',
    loadingData: 'Loading character data...',
    redirecting: 'Redirecting to editor...',
    deleting: 'Deleting character card...',
    deleteSuccess: 'Character card deleted',
    deleteFailed: 'Delete failed: ',
    refreshing: 'Refreshing...',
    uploading: 'Uploading to platform...'
  }
};

// Export
if (typeof window !== 'undefined') {
  window.LANG_EN = LANG_EN;
}
