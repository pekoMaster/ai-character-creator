# 設定兩個 OAuth 客戶端 ID

## 🎯 策略

為了讓共享平台可以對外公開，同時保護編輯器的 Drive 功能，我們創建兩個 OAuth 客戶端 ID：

1. **客戶端 A**（現有的）：給 index.html 使用
   - 包含 Drive API 權限
   - 保持 Testing 狀態
   - 只有測試使用者能登入編輯器

2. **客戶端 B**（新建的）：給 platform.html 使用
   - 只需要基本資訊（email, name, picture）
   - 直接發布
   - 任何人都能登入平台查看/下載角色卡

---

## 📋 步驟 1: 創建新的 OAuth 客戶端 ID

### 1.1 前往 Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 1.2 點擊「+ 建立憑證」
在頁面頂部，點擊「+ CREATE CREDENTIALS」

### 1.3 選擇「OAuth 2.0 用戶端 ID」
從下拉選單中選擇

### 1.4 設定應用程式類型
```
應用程式類型: 網頁應用程式
名稱: AI Character Creator - Platform (Public)
```

### 1.5 設定已授權的 JavaScript 來源
```
https://pekomaster.github.io
```

### 1.6 建立
點擊「CREATE」

### 1.7 複製新的 Client ID
會看到類似這樣的 ID：
```
123456789012-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

📋 **請複製這個 ID，等等會用到！**

---

## 📋 步驟 2: 修改 config.js

在 config.js 中添加新的 Client ID：

```javascript
const CONFIG = {
  // 編輯器用（需要 Drive 權限）
  GOOGLE_CLIENT_ID: '692507778051-t4mpeu79rbfcel1ds2hoi0n0qhg32224.apps.googleusercontent.com',

  // 平台用（只需基本資訊，可公開）
  GOOGLE_CLIENT_ID_PLATFORM: '您剛才複製的新 Client ID',

  GOOGLE_DRIVE_FOLDER_ID: '1s6pPlJic8s1Iv3cMtPJxbn4bsbgdR4aj',
  PLATFORM_API_URL: 'https://script.google.com/macros/s/AKfycbxdE7VDz43Zy8Nak2Y-wEhXFvX73XHDH1OZn6pNrIDh3iKyMXYYGfs0ORySJrQ6NYEN/exec'
};
```

---

## 📋 步驟 3: 修改 platform.html

### 找到這行（大約在 line 638）：
```javascript
google.accounts.id.initialize({
  client_id: CONFIG.GOOGLE_CLIENT_ID,
  callback: this.handleCredentialResponse.bind(this)
});
```

### 改成：
```javascript
google.accounts.id.initialize({
  client_id: CONFIG.GOOGLE_CLIENT_ID_PLATFORM,  // ← 改用平台專用的 Client ID
  callback: this.handleCredentialResponse.bind(this)
});
```

---

## 📋 步驟 4: 發布新的 OAuth 客戶端

### 4.1 前往 OAuth 同意畫面
https://console.cloud.google.com/apis/credentials/consent

### 4.2 確認狀態是 Testing
應該會看到「Publishing status: Testing」

### 4.3 點擊「PUBLISH APP」
在頁面頂部

### 4.4 確認發布
由於新的客戶端 B 只使用基本範圍，應該會看到：

```
┌─────────────────────────────────────────┐
│ 發布應用程式？                          │
├─────────────────────────────────────────┤
│ 您的應用程式將可供所有 Google 使用者     │
│ 使用。                                  │
│                                         │
│ 由於您只使用非敏感範圍，無需驗證。       │
│                                         │
│ [取消]  [確認]                          │
└─────────────────────────────────────────┘
```

✅ 點擊「確認」

---

## 📋 步驟 5: 設定客戶端 A（編輯器）的測試使用者

### 5.1 回到 OAuth 同意畫面
確保還是在 Testing 狀態（不要發布客戶端 A）

### 5.2 添加測試使用者
在「Test users」區域：
- 添加您自己的 Email
- 添加其他可以使用編輯器（含 Drive 功能）的人

---

## 📋 步驟 6: 測試

### 測試編輯器（只有測試使用者能用）
1. 訪問：https://pekomaster.github.io/ai-character-creator/index.html
2. 使用測試使用者帳號登入
3. ✅ 應該能登入並使用 Drive 功能

### 測試平台（任何人都能用）
1. 訪問：https://pekomaster.github.io/ai-character-creator/platform.html
2. 使用**任何** Google 帳號登入
3. ✅ 應該能登入並查看/下載角色卡

---

## 🎉 完成！

現在您的設定：

### 編輯器（index.html）
- ✅ 使用客戶端 A
- ✅ 有 Drive API 權限
- ✅ Testing 狀態
- ✅ 只有測試使用者能用
- ✅ 可以上傳圖片到 Drive

### 平台（platform.html）
- ✅ 使用客戶端 B
- ✅ 只需要基本資訊
- ✅ Production 狀態
- ✅ 任何人都能用
- ✅ 可以查看/下載/編輯自己的角色卡

---

## 📊 權限對照表

| 功能 | 客戶端 A（編輯器） | 客戶端 B（平台） |
|------|-------------------|------------------|
| Google 登入 | ✅ | ✅ |
| Drive 上傳 | ✅ | ❌ |
| 查看角色卡 | ✅ | ✅ |
| 上傳角色卡到平台 | ✅ | ❌ |
| 編輯自己的角色卡 | ✅ | ✅ |
| 公開訪問 | ❌ (只有測試使用者) | ✅ (任何人) |

---

## ⚠️ 重要注意事項

### 1. index.html 的上傳功能
編輯器中「上傳到共享平台」功能使用的是客戶端 A：
- ✅ 測試使用者可以上傳
- ❌ 非測試使用者無法上傳

### 2. 如果要讓所有人都能上傳
需要將客戶端 A 也發布，但這需要：
- 提供隱私政策
- 提供使用條款
- 通過 Google 驗證（可能需要數週）

### 3. 替代方案：移除 Drive 功能
如果您不需要 Drive 上傳功能，可以：
1. 移除 index.html 中的 Drive API 範圍
2. 只使用一個客戶端 ID
3. 直接發布，無需驗證

---

## 🔧 故障排除

### 問題：平台還是無法登入
- 確認使用的是 `CONFIG.GOOGLE_CLIENT_ID_PLATFORM`
- 確認新客戶端已發布
- 清除瀏覽器快取

### 問題：編輯器無法登入
- 確認您的帳號在測試使用者清單中
- 確認使用的是 `CONFIG.GOOGLE_CLIENT_ID`

### 問題：上傳功能失敗
- 這是正常的，因為使用客戶端 A（編輯器）
- 只有測試使用者能上傳
