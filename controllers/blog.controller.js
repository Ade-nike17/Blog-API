const Blog = require('../models/blog.model');
const calcReadingTime = require('../utils/readingTime');

// Create a new blog
exports.createBlog = async (req, res, next) => {
    try {
        const { title, description, tags, body } = req.body;

        const blog = new Blog({
            title,
            description,
            tags,
            body,
            author: req.user._id,
            reading_time: calcReadingTime(body)
        });

        // console.log("User from token:", req.user);
        // console.log("Blog body:", body);

        await blog.save();
        res.status(201).json({ message: 'Blog created successfully', blog });
    } catch (error) {
        next(error);
    }
};

// Publish the blog
exports.publishBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findOne({ _id: req.params.id, author: req.user._id });
        if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' }) ;

        blog.state = 'published';
        await blog.save();

        // console.log("Publishing Blog...")
        res.status(201).json({ message: 'Blog published successfully', blog });
    } catch (err) {
        next(err);
    }
};

// Get all published blogs
exports.getPublishedBlogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, author, title, tags, sortBy = 'timestamp', order = 'desc'} = req.query;

        const pageNum = parseInt(page, 20);
        const limitNum = parseInt(limit, 20);

        const query = { state: 'published' };

        if (author) query.author = author;
        if (title) query.title = new RegExp(title, 'i');
        if (tags) query.tags = { $in: tags.split(',') };

        const blogs = await Blog.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('author', 'first_name last_name');

    const total = await Blog.countDocuments(query);

    res.json({ total, currentPage: pageNum, totalPages: Math.ceil(total / limitNum), blogs });
    } catch (err) {
        next(err);
    }
};

// Get all blogs created by the logged-in user
exports.getMyBlogs = async( req, res, next) => {
    try {
        const blogs = await Blog.find({ 
            author: req.user._id,
            ...(req.query.state && { state: req.query.state })
        });
        res.json({ blogs });
    } catch (err) {
        next(err);
    }
};

// Read a specific published blog
exports.getSinglePublishedBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { _id: req.params.id, state: 'published' },
            { $inc: { read_count: 1 } },
            { new: true }
        ).populate('author', 'first_name last_name');

        if (!blog) {
            return res.status(404).json({ message: 'Published blog not found '});
        }

        res.json({ blog });
    } catch (err) {
        next(err);
    }
};

// Update a blog (only by the author)
exports.updateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findOne({ _id:req.params.id, author: req.user._id });
        if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });

        const { title, description, tags, body } = req.body;

        if (title) blog.title = title;
        if (description) blog.description = description;
        if (tags) blog.tags = tags;
        if (body) {
            blog.body = body;
            blog.reading_time = require('../utils/readingTime')(body);
        }

        await blog.save();
        res.json({ message: 'Blog updated successfully', blog });
    } catch (err) {
        next(err);
    }
};


// Delete a blog (only by the author)
exports.deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findOneAndDelete({ _id: req.params.id, author: req.user._id });
        if (!blog) return res.status(404).json({ message: 'Blog not found or unauthorized' });

        res.json({ message: 'Blog deleted successfully'});
    } catch (err) {
        next(err);
    }
}