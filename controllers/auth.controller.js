const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h'});
    // console.log('JWT_SECRET:', process.env.JWT_SECRET);
};

// Signup
exports.signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const user = new User({ first_name, last_name, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully '});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.status(200).json({ token });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: err.message });
    }
};