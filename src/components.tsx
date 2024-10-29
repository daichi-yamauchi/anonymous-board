import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
	return html`
		<!DOCTYPE html>
		<html lang="ja">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://unpkg.com/htmx.org@1.9.3"></script>
				<title>匿名掲示板</title>
			</head>
			<body>
				${children}
			</body>
		</html>
	`;
});

export const Post = ({ id, content }: { id: unknown; content: unknown }) => {
	return html`
		<hr />
		<div>
			<h2>${id}</h2>
			<p>${content}</p>
		</div>
	`;
};
