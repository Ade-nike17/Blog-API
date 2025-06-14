require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

// GET PORT FROM ENV OR DEFAULT TO 3000
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// CONNECT TO MONGODB
mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');

    // Start the server after DB is connected
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
});