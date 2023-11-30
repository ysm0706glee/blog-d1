import { getBlogs, getBlogsWithTags, postBlogTags, postBlog } from './api/blogs';
import { getTags, postTag } from './api/tags';

export interface Env {
	DB: D1Database;
}

// insert API endpoints here
const apiEndpoints: Array<any> = [];
// blogs
apiEndpoints.push(getBlogs());
apiEndpoints.push(getBlogsWithTags());
apiEndpoints.push(postBlogTags());
apiEndpoints.push(postBlog());
// tags
apiEndpoints.push(getTags());
apiEndpoints.push(postTag());

export default {
	async fetch(request: Request, env: Env) {
		try {
			if (request.method === 'OPTIONS') {
				return handlePreflightRequest();
			}
			return handleRequest(request, env);
		} catch (e) {
			return new Response(`${e}`);
		}
	},
};

const jsonReply = (json: object, status = 200) =>
	new Response(JSON.stringify(json), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
			'access-control-allow-origin': '*',
			'access-control-allow-headers': '*',
			'access-control-allow-methods': '*',
		},
		status: status,
	});

const handlePreflightRequest = () =>
	new Response(null, {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
		},
		status: 204,
	});

const handleRequest = async (request: Request, env: Env) => {
	const url = new URL(request.url);
	const [path, param] = url.pathname.slice(1).split('/');
	if (!path.includes('api')) {
		return new Response('Not found', { status: 404 });
	}
	const api = apiEndpoints.map((ep) => `${ep.method},${ep.path}`).indexOf(`${request.method},${param}`);
	const apiResult = await apiEndpoints[api].handler(request, env);
	return jsonReply(apiResult, apiResult.error ? apiResult.error : 200);
};
