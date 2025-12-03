# Google OAuth 應用程式完整發布流程

## 🎯 目標
將您的應用程式發布為 Production 狀態，通過 Google 驗證，讓任何人都能使用。

## ⏰ 預估時間
- 準備文件：2-4 小時
- Google 審核：2-6 週

---

# 第一階段：準備必要文件

## 📄 1. 隱私政策（Privacy Policy）

### 必須包含的內容：

#### 1.1 資料收集說明
```markdown
# 隱私政策

最後更新：[日期]

## 我們收集哪些資料

AI 互動聊天角色卡工具（以下簡稱「本服務」）會收集以下資料：

### 1. Google 帳號資訊
- 電子郵件地址
- 姓名
- 個人資料圖片

### 2. Google Drive 資料
- 您上傳到本服務的角色卡圖片
- 存放在您的 Google Drive 指定資料夾中

### 3. 角色卡資料
- 您創建的角色卡內容
- 上傳到共享平台的角色卡資訊
```

#### 1.2 資料使用說明
```markdown
## 我們如何使用您的資料

### Google 帳號資訊
- 用於識別您的身份
- 顯示您的名稱和頭像
- 驗證角色卡的作者身份

### Google Drive 資料
- 僅儲存您主動上傳的角色卡圖片
- 存放在您自己的 Google Drive 中
- 我們不會存取您 Drive 中的其他檔案

### 角色卡資料
- 顯示在共享平台上
- 供其他使用者瀏覽和下載
```

#### 1.3 資料分享說明
```markdown
## 資料分享

我們不會將您的個人資料出售或分享給第三方。

您上傳到共享平台的角色卡資料將公開展示，包括：
- 角色卡內容
- 作者名稱（您提供的暱稱）
- 上傳日期
```

#### 1.4 資料安全
```markdown
## 資料安全

- 使用 Google OAuth 2.0 進行安全認證
- 圖片儲存在您自己的 Google Drive 中
- 傳輸過程使用 HTTPS 加密
```

#### 1.5 使用者權利
```markdown
## 您的權利

您有權：
- 隨時刪除您上傳的角色卡
- 取消 Google 帳號授權
- 要求我們刪除您的資料（請聯繫：您的Email）
```

#### 1.6 聯絡資訊
```markdown
## 聯絡我們

如有隱私相關問題，請聯繫：
- Email: 您的Email地址
- GitHub: https://github.com/pekoMaster/ai-character-creator
```

### 🌐 隱私政策託管位置

您需要將隱私政策放在可公開訪問的網址上，例如：
- `https://pekomaster.github.io/ai-character-creator/privacy.html`
- 或使用 GitHub Pages 的 `/privacy.md`

---

## 📄 2. 服務條款（Terms of Service）

### 必須包含的內容：

```markdown
# 服務條款

最後更新：[日期]

## 1. 接受條款
使用 AI 互動聊天角色卡工具即表示您同意這些條款。

## 2. 服務說明
本服務提供：
- AI 輔助角色卡創建工具
- 角色卡共享平台
- Google Drive 圖片儲存整合

## 3. 使用者責任
您同意：
- 不上傳違法、侵權或不當內容
- 尊重他人的智慧財產權
- 不濫用服務或進行惡意行為

## 4. 內容所有權
- 您保留角色卡內容的所有權
- 上傳到共享平台即授予我們展示該內容的權利

## 5. 免責聲明
- 服務按「現況」提供
- 不保證服務不中斷或無錯誤
- 我們不對使用者生成的內容負責

## 6. 服務變更
我們保留隨時修改或終止服務的權利。

## 7. 聯絡資訊
Email: 您的Email地址
GitHub: https://github.com/pekoMaster/ai-character-creator
```

### 🌐 服務條款託管位置
- `https://pekomaster.github.io/ai-character-creator/terms.html`

---

## 🎥 3. 應用程式示範影片（YouTube）

### 影片要求：
- **時長**：1-3 分鐘
- **解析度**：720p 或以上
- **語言**：可以是中文，但建議加英文字幕

### 影片內容：
1. **開場（10 秒）**
   - 顯示應用程式名稱和網址
   - 簡短介紹用途

2. **登入流程（20 秒）**
   - 點擊「登入 Google」
   - 展示 OAuth 授權畫面
   - 說明需要哪些權限及原因

3. **主要功能示範（60 秒）**
   - 創建角色卡
   - 上傳圖片到 Google Drive
   - 匯出角色卡
   - 上傳到共享平台

4. **Google Drive 使用說明（30 秒）**
   - **重點**：清楚展示為什麼需要 Drive 權限
   - 展示圖片上傳到 Drive
   - 說明只會存取您授權的資料夾
   - 不會存取其他檔案

5. **結尾（10 秒）**
   - 感謝使用
   - 顯示聯絡方式

### 📹 影片上傳：
- 上傳到 YouTube（可設為「未列出」）
- 複製影片連結，待會需要填入 Google 表單

---

## 🖼️ 4. 應用程式標誌

### 要求：
- **尺寸**：120x120 像素
- **格式**：PNG（透明背景佳）
- **內容**：代表您的應用程式

### 建議：
可以使用簡單的設計，例如：
- 🎭 圖示 + 文字
- AI + Character 的組合圖案

---

# 第二階段：設定 OAuth 同意畫面

## 🔧 1. 前往 OAuth 同意畫面

https://console.cloud.google.com/apis/credentials/consent

---

## 🔧 2. 填寫應用程式資訊

### 2.1 應用程式名稱
```
AI Interactive Character Card Tool
或
AI 互動聊天角色卡工具
```

### 2.2 使用者支援電子郵件
```
您的 Email 地址
```

### 2.3 應用程式標誌
上傳您準備的 120x120 圖片

### 2.4 應用程式首頁
```
https://pekomaster.github.io/ai-character-creator/
```

### 2.5 應用程式隱私權政策連結
```
https://pekomaster.github.io/ai-character-creator/privacy.html
```

### 2.6 應用程式服務條款連結
```
https://pekomaster.github.io/ai-character-creator/terms.html
```

### 2.7 已授權網域
```
pekomaster.github.io
```

### 2.8 開發人員聯絡資訊
```
您的 Email 地址
```

---

## 🔧 3. 設定範圍（Scopes）

點擊「ADD OR REMOVE SCOPES」

### 必須添加的範圍：

#### 3.1 基本範圍（自動包含）
```
openid
email
profile
```

#### 3.2 Google Drive 範圍（需要說明）
```
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/drive.readonly
```

**說明理由**（重要！）：
```
本應用程式需要存取 Google Drive 以：
1. 儲存使用者上傳的角色卡圖片
2. 讀取使用者選擇的圖片進行匯入
3. 所有檔案存放在使用者自己的 Drive 中
4. 僅存取使用者明確授權的檔案
```

---

## 🔧 4. 測試使用者（暫時保留）

在驗證通過前，先添加幾個測試使用者：
- 您自己的 Email
- 信任的朋友（協助測試）

---

# 第三階段：提交驗證申請

## 📤 1. 準備驗證申請

前往：https://console.cloud.google.com/apis/credentials/consent

點擊「PREPARE FOR VERIFICATION」或「SUBMIT FOR VERIFICATION」

---

## 📤 2. 填寫驗證表單

### 2.1 基本資訊
- 應用程式名稱
- 應用程式類型：Web Application
- 應用程式網址：`https://pekomaster.github.io/ai-character-creator/`

### 2.2 OAuth 範圍說明

**為什麼需要 drive.file？**
```
我們的應用程式是一個角色卡創建工具，需要：
1. 讓使用者上傳角色卡的封面圖片到他們的 Google Drive
2. 圖片儲存在使用者自己的 Drive 中，不存放在我們的伺服器
3. 僅存取使用者透過我們應用程式上傳的檔案
4. 不會存取使用者 Drive 中的其他任何檔案

範圍 drive.file 確保我們只能存取由本應用程式創建的檔案。
```

**為什麼需要 drive.readonly？**
```
讓使用者可以從他們的 Google Drive 選擇現有圖片來作為角色卡封面。
使用者可以完全控制要分享哪些檔案。
```

### 2.3 示範影片
貼上您的 YouTube 影片連結

### 2.4 隱私政策
確認連結：`https://pekomaster.github.io/ai-character-creator/privacy.html`

### 2.5 服務條款
確認連結：`https://pekomaster.github.io/ai-character-creator/terms.html`

---

## 📤 3. 提交申請

審查所有資訊後，點擊「SUBMIT」

---

# 第四階段：等待審核

## ⏰ 審核時間
- 通常：2-4 週
- 最長：6 週

## 📧 審核過程中可能收到的郵件

### 1. 確認收到申請
```
Subject: Google API Services: User Data Policy Compliance Review

您的申請已收到，我們將在幾週內審核。
```

### 2. 要求補充資料
Google 可能會要求：
- 更詳細的權限使用說明
- 更新隱私政策
- 補充示範影片
- 提供測試帳號

**回應時效**：通常需要在 7 天內回覆

### 3. 審核結果

#### ✅ 通過
```
Subject: Google API Services: User Data Policy Compliance Review - Approved

恭喜！您的應用程式已通過驗證。
```

#### ❌ 未通過
會說明原因，您可以修正後重新提交。

---

# 第五階段：發布應用程式

## 🚀 審核通過後

### 1. 回到 OAuth 同意畫面
https://console.cloud.google.com/apis/credentials/consent

### 2. 點擊「PUBLISH APP」

### 3. 確認發布

狀態會從「Testing」變成「In production」

### 4. 測試

現在任何人都可以：
- 訪問 `https://pekomaster.github.io/ai-character-creator/`
- 使用 Google 登入
- 使用所有功能

---

# 常見問題 FAQ

## Q1: 審核一定會通過嗎？
A: 只要：
- 隱私政策完整
- 影片清楚展示權限使用
- 確實需要這些權限
- 不違反 Google 政策
通過率很高。

## Q2: 可以加速審核嗎？
A: 無法。但可以確保第一次就準備充分，避免補件延遲。

## Q3: 審核期間可以使用嗎？
A: 可以，但只有測試使用者能用。

## Q4: 如果被拒絕怎麼辦？
A:
1. 查看拒絕原因
2. 修正問題
3. 重新提交
通常第二次會通過。

## Q5: 需要付費嗎？
A: 不需要。Google OAuth 驗證免費。

## Q6: 需要公司或組織嗎？
A: 不需要。個人開發者也可以申請。

---

# 檢查清單

在提交前，確認：

- [ ] 隱私政策已上線（可公開訪問）
- [ ] 服務條款已上線（可公開訪問）
- [ ] YouTube 影片已上傳並設為公開/未列出
- [ ] 應用程式標誌已準備（120x120 PNG）
- [ ] OAuth 同意畫面資訊完整
- [ ] 範圍說明清楚且合理
- [ ] 示範影片清楚展示權限使用
- [ ] 所有連結都正常運作
- [ ] 已添加測試使用者進行測試

---

# 參考資源

- [Google OAuth 驗證指南](https://support.google.com/cloud/answer/9110914)
- [OAuth 政策](https://developers.google.com/terms/api-services-user-data-policy)
- [Drive API 範圍說明](https://developers.google.com/drive/api/guides/api-specific-auth)

---

**準備好了嗎？讓我們開始！** 🚀
