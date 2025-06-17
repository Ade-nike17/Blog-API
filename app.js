require('dotenv').config();

const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// test API
app.get('/', (req, res) => {
    res.send('Blog API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

module.exports = app;