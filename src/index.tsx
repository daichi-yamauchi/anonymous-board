import { Hono } from 'hono';
import { Post, renderer } from './components';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono<{ Bindings: Env }>();

app.get('*', renderer);

app.get('/', async (c) => {
	const { results } = await c.env.DB.prepare('SELECT id, title FROM thread ORDER BY id DESC LIMIT 1000').all();

	return c.render(
		<div>
			<h1>匿名掲示板</h1>
			<p>ようこそ！</p>
			<h2>スレッド一覧</h2>
			<div id="threads">
				{results.map((thread) => (
					<div>
						<a href={`/threads/${thread.id}`}>{thread.title}</a>
					</div>
				))}
			</div>
			<h2>スレッド作成</h2>
			<form action="/threads" method="post">
				<input type="text" name="title" placeholder="タイトル" />
				<button type="submit">作成</button>
			</form>
		</div>
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

	const { results } = await c.env.DB.prepare('SELECT id, content FROM post WHERE thread_id = ? ORDER BY id ASC LIMIT 1000').bind(id).all();

	return c.render(
		<div>
			<h1>{thread.title}</h1>
			<div id="posts">
				{results.map((post) => (
					<Post id={post.id} content={post.content} />
				))}
			</div>
			<h2>投稿</h2>
			<form hx-post={`/threads/${id}/posts`} hx-target="#posts" hx-swap="beforeend" hx-on="htmx:afterRequest: this.reset()">
				<textarea name="content" placeholder="本文" />
				<button type="submit">投稿</button>
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
		const { id } = await c.req.valid('param');
		const { content } = await c.req.valid('form');

		const { meta } = await c.env.DB.prepare('INSERT INTO post (thread_id, content) VALUES (?, ?);').bind(id, content).run();

		return c.html(<Post id={meta.last_row_id} content={content} />);
	}
);

export default app;
