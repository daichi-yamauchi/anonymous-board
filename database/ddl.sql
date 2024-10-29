DROP TABLE IF EXISTS thread;

CREATE TABLE thread (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL
);

INSERT INTO thread (id, title) VALUES ('1', 'スレッド1');
INSERT INTO thread (id, title) VALUES ('2', 'スレッード2');