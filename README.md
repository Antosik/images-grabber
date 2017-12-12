# images-grabber
[![Build Status](https://travis-ci.org/Antosik/images-grabber.svg?branch=master)](https://travis-ci.org/Antosik/images-grabber)
[![NSP Status](https://nodesecurity.io/orgs/antosik/projects/a71a0a22-f08d-4882-a708-727f91d20886/badge)](https://nodesecurity.io/orgs/antosik/projects/a71a0a22-f08d-4882-a708-727f91d20886)
[![npm](https://img.shields.io/npm/dt/images-grabber.svg)](https://www.npmjs.com/package/images-grabber)

[![NPM install](https://nodei.co/npm/images-grabber.png?mini=true)](https://www.npmjs.com/package/images-grabber)

Download all images from pixiv/twitter/deviantart profiles!

### How to run
__Install__
* Install [node.js](https://nodejs.org/en/)
* Run `npm install -g images-grabber` in console
* Run in console `images-grabber`


__Usage__

`$ img-grab <link>` or `$ images-grabber <link>`
 
__Options__
```
-p, --path   - directory to saved images (default - current directory + '/images')
-u, --unsafe  - download unsafe pictures (default - false)
 
--username and --password - if you want to download private pictures too
```
__Example__

`$ img-grab www.pixiv.net/member.php?id=420928 -p=C:/images`


### Supported services

* [DeviantArt](http://www.deviantart.com/) (by user profile link)
* [Twitter](https://twitter.com/) (by user profile link) _(must be public!)_
* [Pixiv](https://www.pixiv.net/) (by user profile link)

### Sources install

* Install [node.js](https://nodejs.org/en/)
* Clone repo
* Run `npm i` or `npm install`
* After install, run `npm start`

#### Additional
* [Build a JavaScript Command Line Interface (CLI) with Node.js](https://www.sitepoint.com/javascript-command-line-interface-cli-node-js/) from [sitepoint.com](https://www.sitepoint.com)
* [node-twitter-media](https://github.com/tukiyururu/node-twitter-media) by [tukiyururu](https://github.com/tukiyururu)
* [pixiv-app-api](https://github.com/akameco/pixiv-app-api) and [pixiv-img](https://github.com/akameco/pixiv-img) by [akameco](https://github.com/akameco)
