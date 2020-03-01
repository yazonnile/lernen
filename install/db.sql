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
  userId      MEDIUMINT    NOT NULL,
  original    VARCHAR(100) NOT NULL DEFAULT '',
  active      BOOLEAN               DEFAULT NULL,
  translation VARCHAR(100) NOT NULL DEFAULT '',
  type        TINYINT      NOT NULL DEFAULT 1,
  CONSTRAINT id UNIQUE KEY (wordId),
  CONSTRAINT id2 UNIQUE KEY (wordId, userId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- plural
CREATE TABLE IF NOT EXISTS plural (
  wordId MEDIUMINT    NOT NULL,
  plural VARCHAR(100) NOT NULL,
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- article
CREATE TABLE IF NOT EXISTS articles (
  wordId  MEDIUMINT NOT NULL,
  article char(10)  NOT NULL,
  CONSTRAINT id UNIQUE KEY (wordId, article)
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
  CONSTRAINT id UNIQUE KEY (wordId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- categories
CREATE TABLE IF NOT EXISTS categories (
  categoryId   SMALLINT     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  categoryName VARCHAR(100) NOT NULL,
  userId       MEDIUMINT    NOT NULL,
  CONSTRAINT id UNIQUE KEY (categoryId),
  CONSTRAINT id2 UNIQUE KEY (categoryName, userId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- words_to_categories
CREATE TABLE IF NOT EXISTS words_to_categories (
  wordId     MEDIUMINT NOT NULL,
  categoryId SMALLINT  NOT NULL,
  CONSTRAINT id UNIQUE KEY (wordId, categoryId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;

-- setup
CREATE TABLE IF NOT EXISTS setup (
  userId              MEDIUMINT         NOT NULL PRIMARY KEY,
  voice               BOOLEAN DEFAULT 1 NOT NULL,
  voiceSpeed          TINYINT DEFAULT 1 NOT NULL,
  phrases             BOOLEAN DEFAULT 1 NOT NULL,
  soundPhrases        BOOLEAN DEFAULT 1 NOT NULL,
  nouns               BOOLEAN DEFAULT 1 NOT NULL,
  soundNouns          BOOLEAN DEFAULT 1 NOT NULL,
  articles            BOOLEAN DEFAULT 1 NOT NULL,
  soundArticles       BOOLEAN DEFAULT 1 NOT NULL,
  plural              BOOLEAN DEFAULT 1 NOT NULL,
  soundPlural         BOOLEAN DEFAULT 1 NOT NULL,
  verbs               BOOLEAN DEFAULT 1 NOT NULL,
  soundVerbs          BOOLEAN DEFAULT 1 NOT NULL,
  strongVerbs         BOOLEAN DEFAULT 1 NOT NULL,
  soundStrongVerbs    BOOLEAN DEFAULT 0 NOT NULL,
  irregularVerbs      BOOLEAN DEFAULT 0 NOT NULL,
  soundIrregularVerbs BOOLEAN DEFAULT 0 NOT NULL,
  CONSTRAINT id UNIQUE KEY (userId)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin
  AUTO_INCREMENT = 1;
