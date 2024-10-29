import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
	return html`
		<!DOCTYPE html>
		<html lang="ja">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://unpkg.com/htmx.org@1.9.3"></script>
				<script src="https://cdn.tailwindcss.com"></script>
				<title>匿名掲示板</title>
			</head>
			<body>
				<div class="p-5">
					<h1 class="text-3xl font-bold mb-3">匿名掲示板</h1>
					${children}
				</div>
			</body>
		</html>
	`;
});

export const Post = ({ id, content }: { id: unknown; content: unknown }) => {
	return html`
		<hr />
		<div class="flex gap-3 my-2">
			<h4>${id}</h4>
			<p>${content}</p>
		</div>
	`;
};
