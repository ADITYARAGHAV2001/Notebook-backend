const express = require('express');
const User = require('../models/User')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = 'Adityaisagoodb$oy';
// create a User using : POST "/api/auth/createuser". Doesn't require Auth - No login required
router.post('/createuser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // if there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ success ,errors: errors.array() });
    }

    try {
        // check whether the user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success , error: "Sorry a user with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
});



// Authenticate a User using : POST "/api/auth/login". Doesn't require Auth - No login required
router.post('/login', [
    body('email').isEmail(),
    body('password').exists()
], async (req, res) => {
    // if there are errors, return Bad request and the errors
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        res.send({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {

        // check whether the user with this email already exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        console.log(authtoken);
        success = true;
        res.json({ success, authtoken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server error." });
    }



});

// Get loggedin a User Details using : POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.send(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error." });
    }
});


module.exports = router


