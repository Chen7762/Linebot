const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('database.db');

// 解析 JSON 和表單資料
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供靜態檔案（例如 HTML、CSS）
app.use(express.static(path.join(__dirname, 'public')));

// POST：接收留言並存進資料庫
app.post('/add-post', (req, res) => {
    const { category, username, content } = req.body;
    const created_at = new Date().toISOString();

    if (!category || !username || !content) {
        return res.status(400).send('請填寫所有欄位');
    }

    db.run(`
        INSERT INTO posts (category, username, content, created_at)
        VALUES (?, ?, ?, ?)
    `, [category, username, content, created_at], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('寫入資料庫失敗');
        }

        res.send('留言成功');
    });
});

app.get('/posts/:category', (req, res) => {
    const category = req.params.category;
    db.all(`SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC`, [category], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('讀取資料庫失敗');
        }
        res.json(rows);
    });
});


// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`伺服器啟動：http://localhost:${PORT}`);
});