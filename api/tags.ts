import type { Tag } from '../types/tag';

type Env = {
	DB: D1Database;
};

type TagData = {
	name: Tag['name'];
};

const getTags = () => {
	return {
		path: 'tags',
		method: 'GET',
		handler: async (request: Request, env: Env) => {
			try {
				const query = 'SELECT * FROM tags';
				const preparedQuery = await env.DB.prepare(query);
				const blogsData = await preparedQuery.all();
				return { tags: blogsData.results };
			} catch (error: any) {
				return { error: 500, msg: `Error fetching blogs: ${error.message}` };
			}
		},
	};
};

const postTag = () => {
	return {
		path: 'tag',
		method: 'POST',
		handler: async (request: Request, env: Env) => {
			try {
				const tagData: TagData = await request.json();
				if (!tagData) {
					return { error: 400, msg: 'Tag data is missing.' };
				}
				// Construct the INSERT query
				const fieldNames = Object.keys(tagData).join(', ');
				const valuePlaceholders = Object.keys(tagData)
					.map((_, index) => `$${index + 1}`)
					.join(', ');
				const values = Object.values(tagData);
				const insertSql = `INSERT INTO tags (${fieldNames}) VALUES (${valuePlaceholders}) RETURNING id`;
				// Execute the INSERT query
				const insertStatement = await env.DB.prepare(insertSql);
				const insertResult = await insertStatement.bind(...values).run();
				// Get the ID of the newly inserted tag
				const newTagId = insertResult.results[0].id;
				// Fetch and return the newly created tag
				const selectSql = 'SELECT * FROM tags WHERE id = $1';
				const selectStatement = await env.DB.prepare(selectSql);
				const tagResult = await selectStatement.bind(newTagId).all();
				return { tag: tagResult.results[0], error: null };
			} catch (error: any) {
				return { error: 500, msg: `Server error: ${error.message}` };
			}
		},
	};
};

export { getTags, postTag };
