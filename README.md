# 高靖婷生日大挑戰（karen-bd）

靜態前端小遊戲：開啟 `index.html` 即可遊玩。題目與圖片網址定義在 `assets/js/questions.js`。

## 環境需求

- 現代瀏覽器（Chrome / Safari / Firefox 等）
- 本機預覽建議用**靜態伺服器**（避免部分瀏覽器對 `file://` 的限制與快取行為）。未來若有需要，也可改用 [Node 的 `serve`](https://www.npmjs.com/package/serve) 等工具。

## 如何在本機跑起專案

1. 在專案根目錄開啟終端機：

   ```bash
   cd /path/to/karen-bd
   ```

2. 啟動 Python 內建的靜態伺服器（埠號可依需求修改，下面以 `3000` 為例）：

   ```bash
   python3 -m http.server 3000
   ```

3. 在瀏覽器開啟：

   ```text
   http://localhost:3000
   ```

若出現 **Address already in use**，代表埠號已被占用，可改用其他埠，例如：

```bash
python3 -m http.server 8080
```

然後改開 `http://localhost:8080`。

## 專案主要檔案

| 路徑 | 說明 |
|------|------|
| `index.html` | 頁面結構 |
| `assets/css/style.css` | 樣式 |
| `assets/js/game.js` | 遊戲流程、計時、得分 |
| `assets/js/questions.js` | 題目、選項、獎品門檻 |
| `assets/images/birthday-star.jpg` | 起始頁壽星照片（可自備，缺檔時會顯示占位提示） |

## 備註

- 題目圖片若使用外部連結，載入速度與連線品質會影響體驗；程式已處理載入中與載入完成後再開始計時。
- 修改 `questions.js` 或 `game.js` 後，重新整理瀏覽器即可；若 CSS/JS 更新後看起來沒變，可試 **強制重新整理**（例如 Chrome：`Cmd + Shift + R`）。
