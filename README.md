# 競程策略手冊（CP Handbook）

一個以繁體中文撰寫的競程演算法手冊，整合 [cp-algorithms.com](https://cp-algorithms.com) 與 [OI-Wiki](https://oi-wiki.org) 的精華內容，並提供分級題單與進度追蹤功能。

## 功能特色

- 📚 **17 個主題** + 子主題系統，涵蓋二分搜尋至計算幾何
- 🔤 **字串算法** 完整覆蓋 KMP、Z 函數、字串哈希、Trie、後綴陣列
- 🧭 **可折疊 Sidebar**，階層式主題導覽，支援頁內錨點
- 🔐 **GitHub OAuth 登入**，進度同步至私有 GitHub Gist
- 📊 **本地進度追蹤**（localStorage），無需登入亦可使用

---

## 本地開發

### 前置需求

- Node.js 18+
- npm 9+

### 安裝

```bash
git clone https://github.com/youyun8/cp-handbook.git
cd cp-handbook
npm install
```

### 環境變數

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入以下值（詳見「GitHub OAuth 設定」章節）：

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
AUTH_SECRET=...         # openssl rand -hex 32
GITHUB_GIST_TOKEN=...
```

### 啟動開發伺服器

```bash
npm run dev
# 開啟 http://localhost:3000
```

---

## GitHub OAuth 設定

### 建立 OAuth App

1. 進入 [GitHub Developer Settings](https://github.com/settings/developers)
2. 點擊 **New OAuth App**
3. 填入：
   - **Application name**：CP Handbook（或任意名稱）
   - **Homepage URL**：`http://localhost:3000`（開發）或你的部署 URL
   - **Authorization callback URL**：`http://localhost:3000/api/auth/callback/github`
4. 建立後取得 **Client ID** 與 **Client Secret**

### 建立 Personal Access Token（Gist 儲存用）

1. 進入 [GitHub Token Settings](https://github.com/settings/tokens)
2. 點擊 **Generate new token (classic)**
3. 勾選 `gist` 權限
4. 複製 Token 填入 `GITHUB_GIST_TOKEN`

### 生成 AUTH_SECRET

```bash
openssl rand -hex 32
```

---

## 部署

> **重點**：GitHub 登入與雲端同步需要伺服器端執行，**只能在伺服器模式（Vercel）下運作**。
> GitHub Pages 為靜態託管，登入功能會自動停用。因此本專案以 **Vercel 為主要部署**。

### Vercel（推薦，支援 GitHub 登入 + 雲端同步）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youyun8/cp-handbook)

1. Fork 此 Repo 到你的 GitHub 帳號
2. 在 [Vercel](https://vercel.com/new) 匯入此 Repo（Vercel 會自動偵測 Next.js，使用預設 `npm run build`）
3. 在 Vercel 的 **Settings → Environment Variables** 填入 `.env.example` 中的所有變數：
   - `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`AUTH_SECRET`、`GITHUB_GIST_TOKEN`
   - **請勿**設定 `NEXT_PUBLIC_BASE_PATH` 或 `STATIC_EXPORT`（那些只給 GitHub Pages 用）
4. 更新 GitHub OAuth App 的 **Authorization callback URL** 為：
   ```
   https://your-vercel-domain.vercel.app/api/auth/callback/github
   ```
5. 推送到 `main`，Vercel 會自動部署。完成後：
   - 右上角會出現「GitHub 登入」按鈕
   - **進度頁（/progress）** 會出現「雲端同步」區塊，可登入後 ⬆ 同步 / ⬇ 載入私有 Gist

> next-auth v5 已設定 `trustHost: true`，Vercel 上通常不需手動設定 `AUTH_URL`。
> 若使用自訂網域且遇到 callback 問題，可在環境變數補上 `AUTH_URL=https://你的網域`。

### GitHub Pages（靜態，**不支援** 登入／同步）

GitHub Pages 不支援 Server-Side Rendering，OAuth 與雲端同步在此模式停用，進度僅存在 localStorage。
對應的工作流程 `.github/workflows/deploy.yml` 已改為**手動觸發（workflow_dispatch）**，
不會在每次 push 時覆蓋 Vercel 部署。若仍想產生靜態版，可於 Actions 分頁手動執行，或本機跑：

```bash
npm run deploy
# 等同於 npm run build:static + gh-pages 推送
```

`npm run build:static`（由 `scripts/build-static.mjs` 驅動）會：

1. 設定 `STATIC_EXPORT=true`，讓 `next.config.mjs` 切換為 `output: 'export'`。
2. 在建置期間暫時移出 `app/api`（OAuth API 路由無法靜態匯出），完成後自動還原。
3. 將 GitHub 登入與雲端同步 UI 以 `lib/runtime.ts` 的旗標停用。

如需自訂 base path，可在執行前設定 `NEXT_PUBLIC_BASE_PATH`。

---

## 資料結構

```
data/
├── topics.json      # 主題資料（17 個主題）
├── subtopics.json   # 子主題資料（字串算法子主題等）
└── problems.json    # 題目資料（100+ 題）
```

### 新增主題

在 `data/topics.json` 新增符合 `Topic` 型別的物件，並在 `lib/utils.ts` 的 `topicIcon` 函式新增對應 emoji。

### 新增子主題

在 `data/subtopics.json` 新增符合 `Subtopic` 型別的物件，`parent_id` 對應父主題的 `id`，並在父主題的 `children` 陣列新增此子主題的 `id`。

子主題路由自動生成為 `/handbook/[parent-slug]/[subtopic-slug]`。

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 樣式 | Tailwind CSS |
| 認證 | next-auth v5 (GitHub OAuth) |
| 狀態 | Zustand + localStorage |
| 雲端同步 | GitHub Gist API |
| 程式碼高亮 | Shiki |
| 動畫 | Framer Motion |
| 部署 | Vercel / GitHub Pages |
