require('dotenv').config({ path: '.env' });
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Blog = require('../models/blog.model');
const jwt = require('jsonwebtoken');

let token;
let userId;

beforeEach(async () => {
    const user = await User.create({
        first_name: 'Joanne',
        last_name: 'Siwan',
        email: 'joanne.siwan@example.com',
        password: 'jojosimple'
    });

    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

describe('Blog Tests', () => {
    it('should allow a logged-in user to create a blog in draft', async () => {
        const res = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Draft Blog',
            description: 'This is a draft blog',
            body: 'Blog content...',
            tags: ['draft', 'test']
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.blog.title).toBe('Draft Blog');
        expect(res.body.blog.state).toBe('draft');
    });

    it('should allow the owner to publish a blog', async () => {
        const blog = await Blog.create({
            title: 'To be published',
            description: 'a blog to be published',
            body: 'This blog will be published...',
            tags: ['publish'],
            author: userId,
            state: 'draft'
        });

        const res = await request(app)
            .patch(`/api/blogs/${blog._id}/publish`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(201);
        expect(res.body.blog.state).toBe('published');
    });

    it('should get list of published blogs (unauthenticated)', async () => {
          const blog = await Blog.create({
            title: 'Public Blog',
            description: 'This blog has been made public',
            body: 'This blog has been published...',
            tags: ['public'],
            author: userId,
            state: 'published'
        });

        const res = await request(app).get('/api/blogs');

        expect(res.statusCode).toBe(200);
        expect(res.body.blogs).toBeDefined();
        expect(Array.isArray(res.body.blogs)).toBe(true);
        expect(res.body.blogs.length).toBeGreaterThan(0);
    });

    it('should get a single published blog and increase read count', async () => {
        const blog = await Blog.create({
            title: 'Readable Blog',
            description: 'blog has been publish, now to read',
            body: 'The content of this blog needs to be read...',
            tags: ['read'],
            author: userId,
            state: 'published',
            read_count: 0
        });

        const res = await request(app).get(`/api/blogs/${blog._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.blog.read_count).toBe(1);
    }); 

    it('should allow user to update a blog', async () => {
          const blog = await Blog.create({
            title: 'Existing Blog',
            description: 'this blog needs an update',
            body: 'This blog will be updated...',
            tags: ['update'],
            author: userId,
            state: 'draft'
        });

        const res = await request(app)
            .patch(`/api/blogs/${blog._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title'});

        expect(res.statusCode).toBe(200);
        expect(res.body.blog.title).toBe('Updated Title');
    });

    it('should allow user to delete a blog', async () => {
          const blog = await Blog.create({
            title: 'To be published',
            description: 'a blog to be published',
            body: 'This blog will be published...',
            tags: ['publish'],
            author: userId,
            state: 'draft'
        });

        const res = await request(app)
            .delete(`/api/blogs/${blog._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    it("should return user's own blog when authenticated", async () => {
          const blog = await Blog.create({
            title: 'My Blog',
            description: 'my blog to be published',
            body: 'This is my blog...',
            tags: ['mine'],
            author: userId,
            state: 'draft'
        });

        const res = await request(app)
            .get('/api/blogs/user')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.blogs.length).toBeGreaterThan(0);
        expect(res.body.blogs[0].author).toBe(userId.toString());
    });

    it('should filter, paginate and sort blogs', async () => {
        await Blog.insertMany([
            {title: 'A', description: 'Blog A', body: 'This is blog A', tags: ['x'], author: userId, state: 'published', read_count: 2 },
            {title: 'B', description: 'Blog B', body: 'This is blog B', tags: ['x'], author: userId, state: 'published', read_count: 5 }
        ]);

        const res = await request(app).get('/api/blogs?tags=x&sortBy=read_count&order=desc&page=1&limit=1');

        expect(res.statusCode).toBe(200);
        expect(res.body.blogs.length).toBe(1);
        expect(res.body.blogs[0].title).toBe('B');

    });
})