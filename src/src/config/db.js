// config/db.js
const mysql = require('mysql2/promise');

console.log("db.js loaded");

// Promise 기반 Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'music_db',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 연결 테스트
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("Successfully connected to the database.");
        conn.release();
    } catch (err) {
        console.error("Database connection failed:", err);
    }
})();

module.exports = pool;
