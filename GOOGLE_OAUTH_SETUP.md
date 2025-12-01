# Google OAuth 設定指南

## 📋 需要在 Google Cloud Console 設定的內容

### 1. 前往憑證頁面
https://console.cloud.google.com/apis/credentials

### 2. 編輯 OAuth 2.0 客戶端 ID

找到您的客戶端 ID：
```
692507778051-t4mpeu79rbfcel1ds2hoi0n0qhg32224.apps.googleusercontent.com
```

### 3. 已授權的 JavaScript 來源

請確保包含以下來源：

```
http://localhost:8080
```

如果您要部署到其他位置，也需要添加：
```
https://您的網域.com
http://127.0.0.1:5500  (如果使用 VS Code Live Server)
```

### 4. 已授權的重新導向 URI

通常不需要設定，因為我們使用的是 Google Identity Services (One Tap)。

### 5. 儲存變更

點擊「儲存」按鈕。

⏰ **注意**：變更可能需要幾分鐘才會生效。

---

## 🧪 測試步驟

### 1. 啟動本地伺服器

```bash
cd H:\OneDrive\RB\TRPG
python -m http.server 8080
```

### 2. 訪問應用程式

- 編輯器：http://localhost:8080/index.html
- 共享平台：http://localhost:8080/platform.html

### 3. 測試登入

1. 打開瀏覽器開發者工具 (F12)
2. 點擊「登入 Google」按鈕
3. 檢查 Console 是否有錯誤

### 4. 如果仍然失敗

檢查開發者工具的 Console 錯誤訊息：

- `origin_mismatch` → 授權來源設定錯誤
- `popup_closed_by_user` → 正常（使用者關閉彈窗）
- `access_denied` → 使用者拒絕授權

---

## 📸 設定截圖說明

### 編輯 OAuth 客戶端 ID 頁面應該長這樣：

```
┌─────────────────────────────────────────────┐
│ 編輯 OAuth 客戶端 ID                        │
├─────────────────────────────────────────────┤
│                                             │
│ 名稱：                                      │
│ [您的應用程式名稱]                          │
│                                             │
│ 已授權的 JavaScript 來源：                  │
│ ┌─────────────────────────────────────┐    │
│ │ http://localhost:8080                │ ➕  │
│ └─────────────────────────────────────┘    │
│                                             │
│ 已授權的重新導向 URI：                      │
│ (可留空)                                    │
│                                             │
│ [取消]  [儲存] ← 記得按儲存！               │
└─────────────────────────────────────────────┘
```

---

## 🔍 常見問題

### Q: 我找不到我的 OAuth 客戶端 ID
A:
1. 確認您登入的是正確的 Google 帳號
2. 檢查專案是否切換正確（頁面頂部）
3. 如果沒有，可能需要建立新的 OAuth 客戶端 ID

### Q: 儲存後還是錯誤
A:
1. 等待 5-10 分鐘（Google 需要時間同步）
2. 清除瀏覽器快取
3. 重新啟動瀏覽器
4. 檢查拼寫是否正確（注意 http vs https）

### Q: 我想用其他 port（如 3000）
A:
```bash
python -m http.server 3000
```
然後在 Google Console 添加 `http://localhost:3000`

---

## ✅ 確認設定成功

當設定正確時：

1. **index.html (編輯器)**
   - 右上角應該顯示 Google 登入按鈕
   - 點擊後會彈出 Google 登入視窗
   - 登入成功後顯示頭像和名稱

2. **platform.html (平台)**
   - 右上角也有 Google 登入按鈕
   - 登入後可以看到「編輯」按鈕（在自己的角色卡上）

3. **上傳功能**
   - 在編輯器登入後可以上傳角色卡
   - 上傳資料會包含 authorEmail

4. **編輯功能**
   - 在平台上只能編輯自己上傳的角色卡
   - 點擊編輯會跳轉到編輯器並載入資料
