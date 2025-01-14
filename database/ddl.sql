DROP TABLE IF EXISTS post;
DROP TABLE IF EXISTS thread;

CREATE TABLE thread (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL
);

CREATE TABLE post (
  id INTEGER,
  thread_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT, -- P5291
  PRIMARY KEY (id, thread_id),
  FOREIGN KEY (thread_id) REFERENCES thread(id)
);
