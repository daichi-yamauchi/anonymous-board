import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/', async (c) => {
	return c.body('Hello, World!');
});

export default app;
