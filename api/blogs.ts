import type { Tag } from '../types/tag';
import type { Blog } from '../types/blog';

type Env = {
	DB: D1Database;
};

type BlogTagsData = {
	blogId: number;
	tagIds: Tag['id'][];
};

type BlogData = {
	id: Blog['id'];
	url: Blog['id'];
	title: Blog['title'];
	description: Blog['description'];
	image: Blog['image'];
};

const getBlogs = () => {
	return {
		path: 'blogs',
		method: 'GET',
		handler: async (request: Request, env: Env) => {
			const { searchParams } = new URL(request.url);
			const offset = parseInt(searchParams.get('offset') || '0', 10);
			const limit = parseInt(searchParams.get('limit') || '10', 10);
			try {
				const results = await env.DB.prepare('SELECT * FROM blogs LIMIT ? OFFSET ?').bind(limit, offset).all();
				return { blogs: results.results };
			} catch (error: any) {
				return { error: 404, msg: error.toString() };
			}
		},
	};
};

const getBlogsWithTags = () => {
	return {
		path: 'blogs-with-tags',
		method: 'GET',
		handler: async (request: Request, env: Env) => {
			const { searchParams } = new URL(request.url);
			const tags =
				searchParams
					.get('tags')
					?.split(',')
					.map((tag) => parseInt(tag, 10)) || [];
			const offset = parseInt(searchParams.get('offset') || '0', 10);
			const limit = parseInt(searchParams.get('limit') || '10', 10);
			if (tags.length === 0) {
				return { error: 400, msg: 'No tags specified' };
			}
			try {
				const query = `
                    SELECT blogs.*, tags.*
                    FROM blogs
                    INNER JOIN blog_tags ON blogs.id = blog_tags.blog_id
                    INNER JOIN tags ON blog_tags.tag_id = tags.id
                    WHERE tags.id IN (${tags.join(',')})
                    LIMIT ? OFFSET ?
                `;
				const results = await env.DB.prepare(query).bind(limit, offset).all();
				return { blogs: results.results };
			} catch (error: any) {
				return { error: 404, msg: error.toString() };
			}
		},
	};
};

const postBlogTags = () => {
	return {
		path: 'blog-tags',
		method: 'POST',
		handler: async (request: Request, env: Env) => {
			try {
				const { blogId, tagIds }: BlogTagsData = await request.json();
				if (!blogId) {
					return { error: 400, msg: 'Blog ID is missing.' };
				}
				if (!tagIds) {
					return { error: 400, msg: 'tag Ids are missing.' };
				}
				const stmt = await env.DB.prepare('INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)');
				for (const tagId of tagIds) {
					await stmt.bind(blogId, tagId).run();
				}
				return { success: true };
			} catch (error: any) {
				return { error: 500, msg: error.toString() };
			}
		},
	};
};

const postBlog = () => {
	return {
		path: 'blog',
		method: 'POST',
		handler: async (request: Request, env: Env) => {
			try {
				const blogData: BlogData = await request.json();
				if (!blogData) {
					return { error: 400, msg: 'Blog data is missing.' };
				}
				// Construct the INSERT query
				const fieldNames = Object.keys(blogData).join(', ');
				const valuePlaceholders = Object.keys(blogData)
					.map((_, index) => `$${index + 1}`)
					.join(', ');
				const values = Object.values(blogData);
				const insertSql = `INSERT INTO blogs (${fieldNames}) VALUES (${valuePlaceholders}) RETURNING id`;
				// Execute the INSERT query
				const insertStatement = await env.DB.prepare(insertSql);
				const insertResult = await insertStatement.bind(...values).run();
				// Get the ID of the newly inserted blog post
				const newBlogId = insertResult.results[0].id;
				// Fetch and return the newly created blog post
				const selectSql = 'SELECT * FROM blogs WHERE id = $1';
				const selectStatement = await env.DB.prepare(selectSql);
				const blogResult = await selectStatement.bind(newBlogId).all();
				return { blog: blogResult.results[0], error: null };
			} catch (error: any) {
				return { error: 500, msg: `Server error: ${error.message}` };
			}
		},
	};
};

export { getBlogs, getBlogsWithTags, postBlogTags, postBlog };
