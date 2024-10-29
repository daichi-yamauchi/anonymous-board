import { Hono } from 'hono';
import { renderer } from './components';

const app = new Hono<{ Bindings: Env }>();

app.get('*', renderer);

app.get('/', async (c) => {
	const { results } = await c.env.DB.prepare('SELECT "Hello, World!" AS title').run();

	return c.render(
		<div>
			<h1>匿名掲示板</h1>
			<p>ようこそ！</p>
			{results[0]?.title}
		</div>
	);
});

export default app;
