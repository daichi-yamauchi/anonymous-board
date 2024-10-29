import { html } from 'hono/html';
import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children }) => {
	return html`
		<!DOCTYPE html>
		<html lang="ja">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>匿名掲示板</title>
			</head>
			<body>
				${children}
			</body>
		</html>
	`;
});
