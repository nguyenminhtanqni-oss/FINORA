const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Finora đang chạy!");
});

app.get("/giao-dich", (req, res) => {
    db.query("SELECT * FROM giao_dich", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Lỗi lấy dữ liệu" });
        }

        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server Finora chạy tại http://localhost:3000");
});