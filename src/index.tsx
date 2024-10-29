import { Hono } from 'hono';
import { renderer } from './components';

const app = new Hono<{ Bindings: Env }>();

app.get('*', renderer);

app.get('/', async (c) => {
	return c.render(
		<div>
			<h1>匿名掲示板</h1>
			<p>ようこそ！</p>
		</div>
	);
});

export default app;
