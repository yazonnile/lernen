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
* webpack -> rollup (build + dev system)

# TODO
* remove url + history
* simplify router
* simplify DB structure (words table into 1)
* voice speed to slider

* categories page
* stat page
* fancy ui
* intro animation

## far-far away
* reverse game
* spelling game

# v2.0
* two apps
  * auth app
  * user is logged in app
