const express = require('express');
const Blog = require('../models/blog.model');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', blogController.getPublishedBlogs);
router.get('/user', authenticate, blogController.getMyBlogs);
router.get('/:id', blogController.getSinglePublishedBlog);
router.post('/', authenticate, blogController.createBlog);
router.patch('/:id/publish', authenticate, blogController.publishBlog);
router.patch('/:id', authenticate, blogController.updateBlog);
router.delete('/:id', authenticate, blogController.deleteBlog);

// // TEMPORARY TEST ROUTE 
// router.get('/all', async (req, res) => {
//   const blogs = await Blog.find({});
//   res.json({ blogs });
// });
module.exports = router;