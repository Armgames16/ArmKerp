const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
const PORT = 3000;

// Phase 18: small production-friendly safeguards, without changing game APIs.
app.disable('x-powered-by');
app.use((req,res,next)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','same-origin');
    if(req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-store');
    next();
});
app.use(cors());
app.use(express.json({limit:"16kb"}));
const onlineRouter=require('./phase9-server');
app.use('/api/online',onlineRouter);
app.use('/api/admin',onlineRouter.onlineAuth,require('./admin-server'));


// Public health check contains no user or room data.
app.get('/api/health', (req,res)=>res.json({status:'ok',service:'armkerp'}));

// ===============================
// TEST
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Արմ Կերպ backend-ը աշխատում է 🎉"
    });
});


// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Լրացրեք username-ը և password-ը"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Username-ը պետք է լինի առնվազն 3 նիշ"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password-ը պետք է լինի առնվազն 6 նիշ"
            });
        }

        const existingUser = db
            .prepare("SELECT id FROM users WHERE username = ?")
            .get(username);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Այս username-ը արդեն գոյություն ունի"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const result = db
            .prepare(`
                INSERT INTO users (username, password)
                VALUES (?, ?)
            `)
            .run(username, hashedPassword);

        res.status(201).json({
            success: true,
            message: "Օգտատերը հաջողությամբ գրանցվեց 🎉",
            user: {
                id: result.lastInsertRowid,
                username: username
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Լրացրեք username-ը և password-ը"
            });
        }

        const user = db
            .prepare(`
                SELECT *
                FROM users
                WHERE username = ?
            `)
            .get(username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Սխալ username կամ password"
            });
        }

        const passwordCorrect =
            await bcrypt.compare(password, user.password);

        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Սխալ username կամ password"
            });
        }

        res.json({
            success: true,
            message: "Մուտքը հաջողությամբ կատարվեց 🎉",
            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// ===============================
// SERVER
// ===============================

app.use(express.static(__dirname,{maxAge:0,etag:true}));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Game running at http://localhost:${PORT}`);
    console.log("Connect other devices using this computer’s LAN IP and port 3000.");
});

