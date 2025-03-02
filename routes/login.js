const express = require('express');
const { body, validationResult } = require('express-validator'); // ✅ Correct import
const router = express.Router();
const passport = require('passport');
const User = require('../models/user'); // Ensure correct path
// Login Page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Live Code Collab', layout: 'layout' });
});

// Failed Login
router.get('/login/fail', (req, res) => {
    res.render('login', { title: 'Live Code Collab', message: 'Incorrect Username or Password', layout: 'layout' });
});

// Login Authentication
router.post("/login",
    passport.authenticate("local", {
        successRedirect: '/',
        failureRedirect: '/login/fail'
    })
);

// Register Page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Live Code Collab', layout: 'layout' });
});

// Registration Route with Validation
router.post('/register', [
    body('name').notEmpty().withMessage('Name cannot be empty'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password cannot be empty'),
    body('password').custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', {
            name: req.body.name,
            email: req.body.email,
            errorMessages: errors.array(),
            layout: 'layout'
        });
    }

    try {
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.setPassword(req.body.password);
        await user.save(); // ✅ Use async/await for better error handling
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.render('register', { errorMessages: [{ msg: 'Error saving user' }], layout: 'layout' });
    }
});

// Logout
// Logout (GET and POST)
// Logout (GET request for direct link)
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        
        req.session.destroy((err) => {
            if (err) {
                console.error("Session Destroy Error:", err);
                return res.status(500).send("Logout Failed");
            }
            res.clearCookie('connect.sid'); // Clears session cookie
            return res.redirect('/login');
        });
    });
});


module.exports = router;
