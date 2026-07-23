CREATE TABLE IF NOT EXISTS deleted_products (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  deleted_at TEXT NOT NULL,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS deleted_products_user_deleted_idx ON deleted_products(user_id, deleted_at DESC);
