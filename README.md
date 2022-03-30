# ProJour : Project journaling

## Prerequisites

Redis account, such as [Redis Cloud](https://redis.com/try-free/)

## Live demo

https://projour.herokuapp.com/

## Component technologies

### Web server framework

[Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)

#### Authentication middleware

[express-session](https://github.com/expressjs/session) with [connect-redis](https://github.com/tj/connect-redis)

#### Data store

[Redis Cloud](https://app.redislabs.com/)

#### Template engine

[Pug](https://github.com/pugjs/pug/tree/master/packages/pug)

### Front end toolkit

[Bootstrap](https://getbootstrap.com/)

### JavaScript style guide

[Airbnb](https://github.com/airbnb/javascript)

## Installation

### [Install the Node dependencies in the local node_modules folder](https://docs.npmjs.com/cli/v6/commands/npm-install)

    npm install

## [Local testing](https://nodejs.org/en/docs/guides/getting-started-guide/)

    URL=redis://[url] SESSION_SECRET=[session secret] USERNAME=[user] PASSWORD=[password] node .

[Local URL](http://localhost:3000)

## Login process

### Client GET /login

### Server receives `req.session.id` from cookie or creates a new one.

### Server retrieves `session.from` and `session.message`

- `req.session.from` : ProJour or Redis server
- `req.session.message` : Login failure reason

### check referer HTTP request header

If missing, this means the user requested the login page directly

- delete `req.session.from`
- delete `req.session.message` 

### Server renders with `login.pug` with `session.from` and `session.message`

### client downloads and executes code

#### `login` HTML page

##### Text input `floatingUrl`

URL of Redis store

#### `/javascripts/login.js`

Registers `loginPost()` event handler for `butLogin`

### user clicks `butLogin`

### `loginPost()` executed

#### Paragraph element `from` assigned value of `floatingUrl`

#### fetch POST to `resource`

`resource` is `login` be default

##### fetch body

- data.url = `floatingUrl`
- data.user = `floatinguser`
- data.password = `floatingpassword`

##### client POST `/login`

###### server executes `loginRedis` middleware

- server connects to `floatingUrl` using `req.body.user` and `req.body.password`
- if the connection succeeds `req.session.user` is assigned the value of `req.body.user` and `req.session.from` and `req.session.message` are deleted
- if the connection fails, `req.session.from` is assigned the value `req.body.url` and `req.session.message` is asssigned the error message from `redisClient`

###### `req.session` is returned to client

## building a multi-level HTML list from JSON
### level 0
- create ul0
- ul0.setAttribute('is', 'expanding-list')
- append ul0 to document.body
### level 1 (NodeJSON)
- create li1
- append NodeJSON.key to li1
- append li1 to ul0 level 0
#### if NodeJSON[key]
- create ul1
- append ul1 to li1

## Package and development tools installation

### [Express](https://expressjs.com/en/starter/installing.html)

#### [Create a package.json file](https://docs.npmjs.com/cli/v6/commands/npm-init)

    npm init -y

#### [Install the package](https://docs.npmjs.com/cli/v6/commands/npm-install)

    npm install express

#### [ESLint](https://eslint.org/docs/user-guide/getting-started)

    npm install eslint --save-dev

##### Set up a configuration file

    npx eslint --init

##### run ESLint on any file or directory

    npx eslint server.js

##### [Publish on GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Copy to public directory to docs

###### Navagate to https://shanemcandrewai.github.io/projour

#### Error when deleting folder

    Could not find this item. This is no longer located in [Path]. Verify the item’s location and try again

##### Solution

    rmdir /s \\?\C:\Users\shane\dev\smdb-ace.

#### Local markdown file viewer

##### Firefox

[Markdown Viewer Webext](https://addons.mozilla.org/en-US/firefox/addon/markdown-viewer-webext)

#### Notes about [local testing](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)

Some browsers (including Chrome) will not run async requests (see Fetching data from the server) if you just run the example from a local file.

##### [solution](https://support.mozilla.org/en-US/questions/1264280) to "CORS request not http" error

change privacy_file_unique_origin to false in about:config

#### git warning : [warning: LF will be replaced by CRLF in package-lock.json](https://git-scm.com/docs/git-config#Documentation/git-config.txt-coreautocrlf)

    git config --global core.autocrlf false

#### git switch to tagged version (equivalent to https://github.com/ajaxorg/ace/tree/v1.4.12)

    git checkout v1.4.12

### [Heroku](https://projour.herokuapp.com)

#### [Installation](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli)

[Windows 64 bit installer](https://cli-assets.heroku.com/heroku-x64.exe)

#### [Local testing](https://devcenter.heroku.com/articles/heroku-local)

    heroku local

#### [Verify remote repository is tracked](https://git-scm.com/docs/git-remote)

    git remote -v

#### app checks

- must be named `server.js` to enable `npm start`
- include `process.env.PORT` in `const port = process.env.PORT || 3000`;

##### Expected output

    heroku	https://git.heroku.com/projour.git (fetch)
    heroku	https://git.heroku.com/projour.git (push)
    origin	https://github.com/shanemcandrewai/projour.git (fetch)
    origin	https://github.com/shanemcandrewai/projour.git (push)

###### [If heroku missing, add remote to local repository](https://devcenter.heroku.com/articles/git#creating-a-heroku-remote)

    heroku create
    heroku login -i
    heroku git:remote -a projour

##### [Deploy code](https://devcenter.heroku.com/articles/git#deploying-code)

    git push heroku master

##### [App URL](https://dashboard.heroku.com/apps/projour/settings)

    https://projour.herokuapp.com/

### Future plans

#### Front end symmetric encryption

[crypto-js](https://github.com/brix/crypto-js)
