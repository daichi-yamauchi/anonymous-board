import { Hono } from 'hono';
import { renderer } from './components';
import { zValidator } from '@hono/zod-validator';
import { coerce, z } from 'zod';

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

app.get('/threads/:id', zValidator('param', z.object({ id: z.string().pipe(z.coerce.number()) })), async (c) => {
	const { id } = await c.req.valid('param');

	const thread = await c.env.DB.prepare('SELECT title FROM thread WHERE id = ?').bind(id).first();

	if (!thread) {
		c.status(404);
		return c.render(<div>スレッドが見つかりませんでした</div>);
	}

	return c.render(
		<div>
			<h1>{thread.title}</h1>
		</div>
	);
});

export default app;
