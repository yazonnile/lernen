# install
* 1 create `/server/src/api/config/config.json` file from template `_config.json`
* 2 create database/user with DB_ID name and DB_PASSWORD from config.json
* 3 recover DB with `/install/db.sql`

# server dev
1 Run php server from `server/src` folder
2 Run mysql server

# server build
`node ./server/build`

# client dev
`node ./client/build`

# client build
`node ./client/build --mode=production`

# IN PROGRESS
* fancy ui
    * games
    * cyrillic font???? wtf?
    * strings into dictionary
    * games stat?

# TODO
* spelling game
  - 1 - перемешать буквы со слова
  - 2 - тоже самое + парочка рандомных букв
  - 3 - полный рандом
  * вести статистику, какое слово сколько раз угадал

* game page with controlls like - disable word..
* stat page
* learn strong?
* learn irregular?
* release?
