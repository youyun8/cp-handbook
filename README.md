# 競程策略手冊

以 Next.js App Router、TypeScript 與 Tailwind CSS 建立的靜態競程學習網站，內容結構參考靈茶山艾府模板庫的訓練思路：每個主題都包含核心想法、參考連結、註解模板、補充套路與分級題單。

## 功能

- 首頁：快速開始、精選主題與本機進度摘要。
- 手冊：十個演算法主題、側邊主題樹、五層內容結構、可複製 C++ 註解模板、補充套路摺疊區與三段式題單。
- 題目策略頁：題目資訊、解題思路、模式辨識、常見錯誤、思維轉換筆記與相似題。
- 練習場：分數帶、標籤、題型與完成狀態篩選，支援虛擬競賽與手動提交紀錄。
- 進度儀表板：複習數、主題覆蓋、競賽場次、弱區偵測、題型比例與熱力圖。

## 本機開發

需要 Node.js 18.17 以上版本。

```bash
npm install
npm run dev
```

開發伺服器啟動後，開啟 `http://localhost:3000`。

## 靜態建置

```bash
npm run build
```

專案已在 `next.config.mjs` 設定 `output: 'export'`，建置結果會輸出到 `out/`，可直接部署為靜態網站。

## GitHub Pages 部署

專案已提供 `deploy` 指令，可將 `next build` 產生的靜態輸出發佈到 GitHub Pages。第一次部署前請先確認：

1. 已安裝 Node.js 18.17 以上版本。
2. 已在 GitHub 儲存庫的 **Settings > Pages** 將來源設為 **Deploy from a branch**，分支選擇 `gh-pages`，目錄選擇 `/ (root)`。
3. 本機 Git 遠端儲存庫已有寫入權限，因為 `gh-pages` 套件會把 `out/` 的內容推送到 `gh-pages` 分支。

安裝依賴：

```bash
npm install
```

接著執行部署：

```bash
npm run deploy
```

`deploy` 指令會先執行 `npm run build`，再透過 `gh-pages -d out` 發佈靜態輸出。部署完成後，GitHub Pages 會從 `gh-pages` 分支讀取檔案並更新網站。

若網站部署在儲存庫子路徑，例如 `https://使用者名稱.github.io/儲存庫名稱/`，建置時需設定 `NEXT_PUBLIC_BASE_PATH`，讓 Next.js 產生正確的連結與靜態資源路徑：

```bash
NEXT_PUBLIC_BASE_PATH=/儲存庫名稱 npm run deploy
```

若是部署到使用者或組織首頁，例如 `https://使用者名稱.github.io/`，通常不需要設定 `NEXT_PUBLIC_BASE_PATH`。

在 GitHub Actions 環境中，`next.config.mjs` 會依 `GITHUB_REPOSITORY` 自動推導 base path，因此部署到儲存庫子路徑時不需要手動指定 `NEXT_PUBLIC_BASE_PATH`。

## 資料來源

所有內容都放在靜態 JSON：

- `data/topics.json`：演算法主題、核心想法、參考連結、模板與補充套路。
- `data/problems.json`：題目、來源、分數、標籤、題型、分層、策略提示與相似題。

使用者進度透過 Zustand persist 儲存在瀏覽器 localStorage，沒有後端與登入需求。
