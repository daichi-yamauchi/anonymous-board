import { Hono } from 'hono';
import { renderer } from './components';

const app = new Hono<{ Bindings: Env }>();

app.get('*', renderer);

app.get('/', async (c) => {
	const { results } = await c.env.DB.prepare('SELECT id, title FROM thread ORDER BY id DESC LIMIT 1000').all();

	return c.render(
		<div>
			<h1>匿名掲示板</h1>
			<p>ようこそ！</p>
			<h2>スレッド一覧</h2>
			{results.map((thread) => (
				<div>
					<a href={`/threads/${thread.id}`}>{thread.title}</a>
				</div>
			))}
		</div>
	);
});

export default app;
