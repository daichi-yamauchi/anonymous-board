import { Hono } from 'hono';
import { renderer } from './components';

const app = new Hono<{ Bindings: Env }>();

app.get('*', renderer);

app.get('/', async (c) => {
	return c.render('Hello, World!');
});

export default app;
