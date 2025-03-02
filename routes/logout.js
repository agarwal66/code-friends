const express = require('express');
const router = express.Router();

router.post('/', (req, res, next) => {
    console.log("🔹 Logout route HIT!");
    console.log("📌 Session before logout:", req.session);

    req.logout((err) => {
        if (err) {
            console.error("❌ Logout Error:", err);
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("❌ Session Destroy Error:", err);
                return res.status(500).send("Logout Failed");
            }

            console.log("✅ Session destroyed successfully!");
            res.clearCookie('connect.sid', { path: '/' });

            console.log("📌 Redirecting to /login...");
            return res.redirect('/login');
        });
    });
});

module.exports = router;
