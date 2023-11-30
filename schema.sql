DROP TABLE IF EXISTS blogs;
CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now'))
);

DROP TABLE IF EXISTS tags;
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

DROP TABLE IF EXISTS blog_tags;
CREATE TABLE IF NOT EXISTS blog_tags (
    blog_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (blog_id, tag_id),
    FOREIGN KEY (blog_id) REFERENCES blogs(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

INSERT INTO blogs (url, title, description, image) VALUES
('https://example1.com', 'Blog 1', 'Description for Blog 1', 'https://picture1.com'),
('https://example2.com', 'Blog 2', 'Description for Blog 2', 'https://picture2.com'),
('https://example3.com', 'Blog 3', 'Description for Blog 3', 'https://picture3.com'),
('https://example4.com', 'Blog 4', 'Description for Blog 4', 'https://picture4.com'),
('https://example5.com', 'Blog 5', 'Description for Blog 5', 'https://picture5.com'),
('https://example6.com', 'Blog 6', 'Description for Blog 6', 'https://picture6.com'),
('https://example7.com', 'Blog 7', 'Description for Blog 7', 'https://picture7.com'),
('https://example8.com', 'Blog 8', 'Description for Blog 8', 'https://picture8.com'),
('https://example9.com', 'Blog 9', 'Description for Blog 9', 'https://picture9.com'),
('https://example10.com', 'Blog 10', 'Description for Blog 10', 'https://picture10.com');

INSERT INTO tags (name) VALUES ('programming');

INSERT INTO blog_tags (blog_id, tag_id) VALUES (1, 1);
