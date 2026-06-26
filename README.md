# 競程策略手冊（CP Handbook）

一個以繁體中文撰寫的競程演算法手冊，整合 [cp-algorithms.com](https://cp-algorithms.com) 與 [OI-Wiki](https://oi-wiki.org) 的精華內容，並提供分級題單與進度追蹤功能。

## 功能特色

- 📚 **17 個主題 × 64 個子主題**，每個子主題含核心想法、過程剖析、OI-Wiki 參考、pitfalls
- 🔤 **字串算法** 完整覆蓋 KMP、Z 函數、字串哈希、Trie、後綴陣列
- 🧭 **可折疊 Sidebar**，階層式主題導覽，支援頁內錨點
- 🔐 **GitHub OAuth 登入**，進度同步至私有 GitHub Gist（需 Vercel 部署）
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

編輯 `.env.local`，填入以下值（取得方式參見「Vercel 部署」的步驟 2–4）：

```env
GITHUB_CLIENT_ID=...       # 開發用 OAuth App 的 Client ID
GITHUB_CLIENT_SECRET=...   # 開發用 OAuth App 的 Client Secret
AUTH_SECRET=...             # openssl rand -hex 32
GITHUB_GIST_TOKEN=...      # 含 gist 範圍的 Personal Access Token
```

> 本地開發需要建立一個獨立的 GitHub OAuth App，Callback URL 填
> `http://localhost:3000/api/auth/callback/github`（與 Vercel 生產環境的 App 分開）。

### 啟動開發伺服器

```bash
npm run dev
# 開啟 http://localhost:3000
```

---

## 部署

> **重點**：GitHub 登入與雲端同步需要伺服器端執行，**只能在伺服器模式（Vercel）下運作**。
> GitHub Pages 為靜態託管，登入功能會自動停用。因此本專案以 **Vercel 為主要部署**。

---

### Vercel 部署（推薦，支援 GitHub 登入 + 雲端同步）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/youyun8/cp-handbook)

#### 步驟 1：Fork 並匯入 Repo

1. 點擊右上角 **Fork** 把此 Repo 複製到你的 GitHub 帳號。
2. 到 [vercel.com/new](https://vercel.com/new)，選擇 **Import Git Repository**。
3. 搜尋你 Fork 後的 Repo，點擊 **Import**。
4. Vercel 會自動偵測 Next.js 框架，**Framework Preset** 選 `Next.js`，**Build Command** 維持預設 `npm run build`（**勿**改成 `build:static`）。

#### 步驟 2：建立 GitHub OAuth App

1. 前往 [github.com/settings/developers](https://github.com/settings/developers)，點擊 **New OAuth App**。
2. 填入以下欄位：

   | 欄位                       | 值                                                         |
   | -------------------------- | ---------------------------------------------------------- |
   | Application name           | `CP Handbook`（或任意名稱）                                |
   | Homepage URL               | `https://your-project.vercel.app`（部署後的域名）          |
   | Authorization callback URL | `https://your-project.vercel.app/api/auth/callback/github` |

3. 點擊 **Register application**，取得 **Client ID**。
4. 點擊 **Generate a new client secret**，取得 **Client Secret**（只顯示一次，立刻複製）。

> **本地開發**：另建一個 OAuth App，Homepage URL 填 `http://localhost:3000`，
> Callback URL 填 `http://localhost:3000/api/auth/callback/github`。

#### 步驟 3：建立 GitHub Personal Access Token（Gist 儲存用）

1. 前往 [github.com/settings/tokens](https://github.com/settings/tokens)，點擊 **Generate new token (classic)**。
2. 填入 Note（如 `cp-handbook-gist`），Expiration 依需求設定。
3. 在 **Select scopes** 僅勾選 `gist`。
4. 點擊 **Generate token**，複製 Token（只顯示一次）。

#### 步驟 4：生成 AUTH_SECRET

```bash
openssl rand -hex 32
```

複製輸出的 64 字元十六進制字串，用於 next-auth v5 的 session 加密。

#### 步驟 5：在 Vercel 設定環境變數

進入 Vercel 專案 → **Settings** → **Environment Variables**，新增以下四個變數（全選 Production / Preview / Development）：

| 變數名稱               | 說明                       | 範例值                        |
| ---------------------- | -------------------------- | ----------------------------- |
| `GITHUB_CLIENT_ID`     | OAuth App 的 Client ID     | `Ov23liXXXXXXXXXXXXXX`        |
| `GITHUB_CLIENT_SECRET` | OAuth App 的 Client Secret | `abc123...`（40 字元）        |
| `AUTH_SECRET`          | next-auth 加密金鑰         | `openssl rand -hex 32` 的輸出 |
| `GITHUB_GIST_TOKEN`    | 含 `gist` 範圍的 PAT       | `ghp_xxxxxxxxxxxx`            |

> **請勿**設定 `STATIC_EXPORT` 或 `NEXT_PUBLIC_STATIC_EXPORT`（那是 GitHub Pages 靜態模式的開關）。
> `AUTH_URL` 通常**不需要**設定——next-auth v5 已設定 `trustHost: true`，Vercel 會自動推斷。
> 若使用自訂網域且 callback 失敗，再補上 `AUTH_URL=https://你的網域`。

#### 步驟 6：觸發部署

推送任何 commit 到 `main` 分支，Vercel 會自動重新部署。
若初次設定環境變數後需要立即生效，在 Vercel Dashboard → **Deployments** → 點最新部署右側的 ⋯ → **Redeploy**。

#### 部署完成後

- 網站右上角出現 **GitHub 登入** 按鈕。
- 前往 **進度（/progress）** 頁面，出現「**雲端同步**」區塊：
  - 未登入：顯示 GitHub 登入按鈕。
  - 登入後：顯示 **⬆ 同步至雲端** 和 **⬇ 從雲端載入** 按鈕，進度儲存至你帳號下的私有 Gist（名稱 `cp-handbook-progress-<userId>`）。
- 進度總覽會分流到 **手冊進度（/progress/handbook）** 與 **實戰提交分析（/progress/performance）**，避免把手冊完成度和競賽提交統計混在一起。

---

### GitHub Pages（靜態，**不支援** 登入／同步）

GitHub Pages 不支援 Server-Side Rendering，OAuth 與雲端同步在此模式自動停用，進度僅存在 localStorage。
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
├── subtopics.json   # 子主題資料（64 個子主題，每主題 3–5 個）
└── problems.json    # 題目資料（263 題，含靈茶山艾府精選題單）
```

### 新增主題

在 `data/topics.json` 新增符合 `Topic` 型別的物件，並在 `lib/utils.ts` 的 `topicIcon` 函式新增對應 emoji。

### 新增子主題

在 `data/subtopics.json` 新增符合 `Subtopic` 型別的物件，`parent_id` 對應父主題的 `id`。

子主題路由自動生成為 `/handbook/[parent-slug]/[subtopic-slug]`。

### 匯入靈茶山艾府題單

`npm run import:0x3f` 會從靈茶山艾府（0x3F）公開資料匯入分類題單：

- 題單：`EndlessCheng/codeforces-go` 的 `leetcode/SOLUTIONS.md`（依知識點分類、按難度分排序）
- 難度分：`zerotrac.github.io/leetcode_problem_rating`（0x3F 排序所依據的數值難度）

標題以 opencc-js 做簡轉繁（twp），與 `reconcile:titles` 一致；匯入的題目帶有 `靈茶山艾府` 標籤可在練習場篩選，並把官方「如何科學刷題」題單連結加入對應主題。預設為 dry run，加 `-- --write` 才會寫入 `data/problems.json` 與 `data/topics.json`（依 LeetCode slug 去重，不覆寫既有題目，可重複執行）。

---

## 技術棧

| 類別       | 技術                        |
| ---------- | --------------------------- |
| 框架       | Next.js 16 (App Router)     |
| 樣式       | Tailwind CSS                |
| 認證       | next-auth v5 (GitHub OAuth) |
| 狀態       | Zustand + localStorage      |
| 雲端同步   | GitHub Gist API             |
| 程式碼高亮 | Shiki                       |
| 動畫       | Framer Motion               |
| 部署       | Vercel / GitHub Pages       |
