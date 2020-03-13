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
  translation VARCHAR(100) NOT NULL DEFAULT '',
  article     CHAR(10)     NOT NULL,
  plural      VARCHAR(100) NOT NULL,
  strong1     CHAR(100)    NOT NULL DEFAULT '',
  strong2     CHAR(100)    NOT NULL DEFAULT '',
  strong3     CHAR(100)    NOT NULL DEFAULT '',
  strong4     CHAR(100)    NOT NULL DEFAULT '',
  strong5     CHAR(100)    NOT NULL DEFAULT '',
  strong6     CHAR(100)    NOT NULL DEFAULT '',
  irregular1  CHAR(100)    NOT NULL DEFAULT '',
  irregular2  CHAR(100)    NOT NULL DEFAULT '',
  active      BOOLEAN               DEFAULT NULL,
  type        TINYINT      NOT NULL DEFAULT 1,
  CONSTRAINT id UNIQUE KEY (wordId),
  CONSTRAINT id2 UNIQUE KEY (wordId, userId)
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
  voiceSpeed          FLOAT DEFAULT .5 NOT NULL,
  phrases             BOOLEAN DEFAULT 1 NOT NULL,
  other               BOOLEAN DEFAULT 1 NOT NULL,
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
