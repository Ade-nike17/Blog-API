require('dotenv').config({ path: '.env.test '});

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const db = mongoose.connection.db;
    if (!db) {
        console.warn('Skipping cleanup: DB not connected');
    }

    const collections = await db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
});