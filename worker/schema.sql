CREATE TABLE IF NOT EXISTS contacts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  message       TEXT    NOT NULL,
  submitted_at  TEXT    NOT NULL
);
