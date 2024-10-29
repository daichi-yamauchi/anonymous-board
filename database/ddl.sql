DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS thread;

CREATE TABLE thread (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL
);

CREATE TABLE post (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES thread(id)
);

INSERT INTO thread (title) VALUES ('First thread');
INSERT INTO post (thread_id, content) VALUES (1, 'First post in the first thread');
INSERT INTO post (thread_id, content) VALUES (1, 'Second post in the first thread');