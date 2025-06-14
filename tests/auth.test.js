const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model')

beforeEach(async () => {
    await User.deleteMany({});
});

describe('Auth Tests', () => {
    it('Should sign up a new user', async() => {
        const res = await request(app).post('/api/auth/signup').send({
            first_name: 'John',
            last_name: 'Snow',
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User registered successfully ');
    });

    it('should not allow duplicate email signup', async () => {
        await request(app).post('/api/auth/signup').send({
            first_name: 'John',
            last_name: 'Snow',
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        })

        const res = await request(app).post('/api/auth/signup').send({
            first_name: 'John',
            last_name: 'Snow',
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message.toLowerCase()).toBe('email already exists');
    });

    it('should log in the user and return a token', async () => {
        await request(app).post('/api/auth/signup').send({
            first_name: 'John',
            last_name: 'Snow',
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        });

        const res = await request(app).post('/api/auth/login').send({
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should reject login with wrong credentials', async () => {
        await User.create({
            first_name: 'John',
            last_name: 'Snow',
            email: 'john.snow@example.com',
            password: 'uknwnothing'
        });

        const res = await request(app).post('/api/auth/login').send({
            email: 'john.snow@example.com',
            password: 'beyondthewall'
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });
});