-- users
CREATE TABLE IF NOT EXISTS users (
  userId        MEDIUMINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  login         CHAR(25)     NOT NULL DEFAULT '' UNIQUE KEY,
  email         CHAR(100)    NOT NULL DEFAULT '' UNIQUE KEY,
  password      VARCHAR(255) NOT NULL DEFAULT '',
  regDate       INT          NOT NULL DEFAULT -1,
  lastVisitDate INT          NOT NULL DEFAULT -1,
  CONSTRAINT id UNIQUE KEY (userId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- words
CREATE TABLE IF NOT EXISTS words (
  wordId      MEDIUMINT    NOT NULL AUTO_INCREMENT PRIMARY KEY,
  original    VARCHAR(100) NOT NULL DEFAULT '',
  active      BOOLEAN               DEFAULT NULL,
  translation VARCHAR(100) NOT NULL DEFAULT '',
  type        TINYINT      NOT NULL DEFAULT 1,
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- types
CREATE TABLE IF NOT EXISTS types (
  typeId   TINYINT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  typeName CHAR(10) NOT NULL,
  CONSTRAINT typeId UNIQUE KEY (typeId),
  CONSTRAINT typeName UNIQUE KEY (typeName)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- plural
CREATE TABLE IF NOT EXISTS plural (
  wordId MEDIUMINT    NOT NULL PRIMARY KEY,
  plural VARCHAR(100) NOT NULL,
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- articles
CREATE TABLE IF NOT EXISTS articles (
  articleId   TINYINT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  articleName CHAR(10) NOT NULL,
  CONSTRAINT articleId UNIQUE KEY (articleId),
  CONSTRAINT articleName UNIQUE KEY (articleName)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- strong
CREATE TABLE IF NOT EXISTS strong (
  wordId  MEDIUMINT NOT NULL PRIMARY KEY,
  strong1 CHAR(100) NOT NULL DEFAULT '',
  strong2 CHAR(100) NOT NULL DEFAULT '',
  strong3 CHAR(100) NOT NULL DEFAULT '',
  strong4 CHAR(100) NOT NULL DEFAULT '',
  strong5 CHAR(100) NOT NULL DEFAULT '',
  strong6 CHAR(100) NOT NULL DEFAULT '',
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- irregular
CREATE TABLE IF NOT EXISTS irregular (
  wordId     MEDIUMINT NOT NULL PRIMARY KEY,
  irregular1 CHAR(100) NOT NULL DEFAULT '',
  irregular2 CHAR(100) NOT NULL DEFAULT '',
  irregular3 CHAR(100) NOT NULL DEFAULT '',
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- categories
CREATE TABLE IF NOT EXISTS categories (
  categoryId   SMALLINT     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoryName VARCHAR(100) NOT NULL,
  CONSTRAINT id UNIQUE KEY (categoryId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- words to categories
-- categories to user
-- words to users
-- plural to word
-- article to word
CREATE TABLE IF NOT EXISTS joins (
  whatId   MEDIUMINT NOT NULL,
  whatType CHAR(10)  NOT NULL,
  toId     MEDIUMINT NOT NULL,
  toType   CHAR(10)  NOT NULL,
  CONSTRAINT id UNIQUE KEY (whatId, toId, whatType, toType)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;
