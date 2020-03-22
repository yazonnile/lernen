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

# TODO
* deu-rus
  * только оригинал. Без озвучки.
  * по клику - артикли, плурал и все остальное + перевод

* learn article
  * все активные существительные
  * три кнопки внизу
  * вести статистику, какое слово сколько раз угадал

* learn plural
  * все активные существительные
  * написать?
  * вести статистику, какое слово сколько раз угадал

* spelling game
  - 1 - перемешать буквы со слова
  - 2 - тоже самое + парочка рандомных букв
  - 3 - полный рандом
  * вести статистику, какое слово сколько раз угадал

* game categories to storage, not ALL games store
* game page with controlls like - disable word..
* stat page
* learn strong
* learn irregular
* release?
