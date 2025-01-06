import { Hono } from 'hono';
import { Post, renderer } from './components';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { basicAuth } from 'hono/basic-auth';

const app = new Hono<{ Bindings: Env }>();

app.use('*', (c, next) =>
	basicAuth({
		username: 'anonymous',
		password: c.env.PASSWORD,
	})(c, next)
);

app.get('*', renderer);

app.get('/', async (c) => {
	const { results } = await c.env.DB.prepare(`
		SELECT thread.id, thread.title, COUNT(post.id) as post_count
		FROM thread
		LEFT JOIN post ON thread.id = post.thread_id
		GROUP BY thread.id, thread.title
		ORDER BY thread.id DESC
		LIMIT 1000
	`).all();

	return c.render(
		<>
			<p>ようこそ！</p>
			<h2 class="text-xl font-bold my-3">スレッド一覧</h2>
			<div id="threads">
				{results.map((thread) => (
					<div>
						<a href={`/threads/${thread.id}`} class="text-blue-500 underline">
							{thread.title} ({thread.post_count})
						</a>
					</div>
				))}
			</div>
			<h2 class="text-xl font-bold mt-5 mb-3">スレッド作成</h2>
			<form action="/threads" method="post">
				<input type="text" name="title" placeholder="タイトル" class="border border-gray-300 rounded p-1 w-80 h-10" />
				<button type="submit" class="ml-3 border rounded h-10 w-20 bg-gray-50">
					作成
				</button>
			</form>
		</>
	);
});

app.post(
	'/threads',
	zValidator(
		'form',
		z.object({
			title: z.string().min(1),
		})
	),
	async (c) => {
		const { title } = await c.req.valid('form');

		const { meta } = await c.env.DB.prepare('INSERT INTO thread (title) VALUES (?);').bind(title).run();

		return c.redirect(`/threads/${meta.last_row_id}`);
	}
);

app.get('/threads/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
	const { id } = await c.req.valid('param');

	const thread = await c.env.DB.prepare('SELECT title FROM thread WHERE id = ?').bind(id).first();

	if (!thread) {
		c.status(404);
		return c.render(<div>スレッドが見つかりませんでした</div>);
	}

	const { results } = await c.env.DB.prepare('SELECT id, content, image_url FROM post WHERE thread_id = ? ORDER BY id ASC LIMIT 1000').bind(id).all();

	return c.render(
		<div>
			<h2 class="text-xl font-bold my-3">{thread.title}</h2>
			<div id="posts">
				{results.length === 0 && <p class="hidden last:block">投稿がありません</p>}
				{results.map((post) => (
					<Post id={post.id} content={post.content as string} imageUrl={post.image_url as string} />
				))}
			</div>
			<h3 class="text-lg font-bold mt-5 mb-3">投稿</h3>
			<form hx-post={`/threads/${id}/posts`} hx-target="#posts" hx-swap="beforeend" hx-on="htmx:afterRequest: this.reset()" encType="multipart/form-data">
				<textarea name="content" placeholder="本文" class="border border-gray-300 rounded p-1 w-80 h-20" />
				<input type="file" name="image" accept="image/*" class="border border-gray-300 rounded p-1 w-80 h-10" />
				<button type="submit" class="border rounded h-10 w-20 bg-gray-50 block">
					投稿
				</button>
			</form>
		</div>
	);
});

app.post(
	'/threads/:id/posts',
	zValidator(
		'form',
		z.object({
			content: z.string().min(1),
		})
	),
	zValidator('param', z.object({ id: z.string() })),
	async (c) => {
		const { id: threadId } = await c.req.valid('param');
		const { content } = await c.req.valid('form');

		const { count } = (await c.env.DB.prepare('SELECT COUNT(*) as count FROM post WHERE thread_id = ?').bind(threadId).first()) as {
			count: number;
		};
		const id = count + 1;

		let imageUrl = null;
		const image = c.req.files?.image;
		if (image) {
			const imageName = `${threadId}-${id}-${image.name}`;
			const imageUrl = `https://<your-r2-bucket-url>/${imageName}`;
			await c.env.IMAGE_BUCKET.put(imageName, image.data);
		}

		const { meta } = await c.env.DB.prepare('INSERT INTO post (id, thread_id, content, image_url) VALUES (?, ?, ?, ?);')
			.bind(id, threadId, content, imageUrl)
			.run();

		return c.html(<Post id={id} content={content} imageUrl={imageUrl} />);
	}
);

export default app;
