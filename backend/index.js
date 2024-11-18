const express = require("express");
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const PORT = 4000;

const {encrypt, decrypt} = require("./EncryptionHandler");

app.use(cors());
app.use(express.json());

// MySQL
const db = mysql.createPool({
    user: 'root',
    host: 'localhost',
    password: 'Sy5gGg3UJomPeF',
    database: 'passwordmanager',
});

// Check Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        process.exit(1);
    }
    console.log("Connected to the database.");
    connection.release();
});

// Main Router
app.get("/", (req, res) => {
    res.send("Express App is running");
});

// Add Password API
app.post("/addpassword", async (req, res) => {
    const { title, password } = req.body;
    const hashedPassword = encrypt(password);

    if (!title || !password) {
        return res.status(400).send("Title and Password are required.");
    }

    try {
        const [result] = await db.promise().query("INSERT INTO passwords (title, password, iv) VALUES (?,?,?)", [title, password, hashedPassword.iv]);
        res.json({ message: "Password added successfully", data: result });
    } catch (err) {
        console.error("Error inserting password:", err);
        res.status(500).send("Error inserting password. Please try again.");
    }
});

// Decrypt Password API
app.post("/decryptpassword", (req, res) => {
    res.send(decrypt(req.body));
});

// Show Password API
    app.get("/showpasswords", (req, res) => {
        db.query("SELECT * FROM passwords;", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
        });
    });

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
