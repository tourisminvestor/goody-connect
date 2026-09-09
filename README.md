# Goody Connect 好遇・NFC 電子名片

香港繁體中文 NFC 電子名片示範系統，採用原版 Goody 貓素材。包含訪客名片、名片主人後台、統計看板及獨立任務公告發布系統。

## 已包含的修復

「管理我的名片」與站內連結使用原生 `<a href>` 直接導頁，不依賴前端路由。登入表單直接包含於伺服器輸出的 HTML，讀取登入狀態不再阻擋顯示，API 請求有 15 秒逾時處理。

## Cloudflare 連接 GitHub 部署

本專案需要 **Cloudflare Workers + D1**，請使用 Workers 的 Git 整合，不是純靜態 Pages。

1. 在 Cloudflare 建立 D1 資料庫 `goody-connect-db`，複製 Database ID。
2. 編輯本倉庫根目錄 `wrangler.jsonc`，把 `database_id` 的全零佔位值換成你的真實 ID。保留綁定名稱 `DB`。
3. 在 Workers 建立應用並連接此 GitHub 倉庫，選 `main` 分支，Worker 名稱使用 `goody-connect`。
4. 建置設定：

| 設定 | 值 |
|---|---|
| 根目錄 | `/` |
| 建置命令 | `npm ci && npm run build` |
| 部署命令 | `npm run cf:deploy` |
| Node.js 版本 | 22.13 或以上 |

5. 在 Worker 的 **Variables and Secrets** 加入以下三個加密 Secret（不要寫入 GitHub）：

| Secret | 用途 |
|---|---|
| `OWNER_PASSWORD` | 名片主人密碼，帳戶固定為 `charlotte` |
| `PUBLISHER_PASSWORD` | 公告發布者密碼，帳戶固定為 `publisher` |
| `VISITOR_SALT` | 隨機長字串，用於訪客資料雜湊 |

6. 部署命令會先套用 `drizzle/` 的 D1 migration，再發布 Worker。Cloudflare 建置所用 API token 必須有 Workers 編輯及 D1 編輯權限。
7. 部署後打開 `https://你的Worker網址/u/charlotte`；把這個完整網址寫入 NFC 卡片。日後修改名片無須重寫 NFC 卡。

**注意：** D1 ID 仍是佔位值時，部署檢查會明確停止，避免誤部署。新部署使用新資料庫，不會自動搬移原示範網站的名片修改與統計。既有已套用 migration 不會重複執行。

官方參考：[Workers Git 建置設定](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) · [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)

## 路徑及功能

- `/` → `/u/charlotte`：服務端渲染姓名、職位、公司、頭像及簡介。
- `/u/charlotte`：下載 vCard、WhatsApp、電話、電郵、複製資料、微信二維碼、分享、YouTube 示範影片和 ESG 商城。
- `/admin`：登入、修改名片文字與圖片、最新公告彈窗、數據看板。
- `/tasks`：獨立角色登入、編寫及預覽公告、發布紀錄。
- 統計：PV、IP+UA 去重 UV、各聯絡按鈕和外鏈點擊、YouTube 實際播放事件及香港時間近七日趨勢。

拼團預設公告：「本週拼團任務火熱進行中」。拼團及 ESG 商城均保留使用者指定的完整第三方連結。

## 本地開發

```
npm ci
cp .dev.vars.example .dev.vars
# 編輯 .dev.vars 的三個 Secret
npm run db:migrate:local
npm run dev
```

```
npm run check
npm run build
# 已使用 wrangler login 登入自己的 Cloudflare 帳戶後：
npm run cf:deploy
```

## 安全及統計

工作階段 token 在資料庫中以 SHA-256 保存，Cookie 使用 HttpOnly、Secure、SameSite，有效 24 小時。寫入 API 檢查同源及角色，登入按 IP+UA 限制為每十分鐘 15 次。UV 只保存加鹽雜湊，不保存原始 IP。YouTube 播放次數以 IFrame API 進入 PLAYING 狀態計算，每次打開播放視窗最多記錄一次。廣告攔截或網絡限制可能影響統計。

## 示範內容

這是單一名片、單一主人和單一發布者的完整示範，未包含自助註冊或多租戶管理。人物及聯絡資料為示例；微信 QR 只包含示範文字，主人需上傳真實微信二維碼後才能加好友。YouTube 使用 Big Buck Bunny 示範動畫。

主要素材位於 `public/goody.webp`，為使用者上傳的 Goody IP 之網頁優化版本。
