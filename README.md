# images-grabber
[![Build Status](https://travis-ci.org/Antosik/images-grabber.svg?branch=master)](https://travis-ci.org/Antosik/images-grabber)
[![NSP Status](https://snyk.io/test/github/Antosik/images-grabber/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Antosik/images-grabber?targetFile=package.json)
[![npm](https://img.shields.io/npm/dt/images-grabber.svg)](https://www.npmjs.com/package/images-grabber)

[![NPM install](https://nodei.co/npm/images-grabber.png?mini=true)](https://www.npmjs.com/package/images-grabber)

Download all images from pixiv/twitter/deviantart profiles!


### Install
* Install [node.js](https://nodejs.org/en/)
* Run `npm install -g images-grabber`


### Usage

```sh
$ img-grab [service] [links] [arguments]
``` 
or 
```sh
$ images-grabber [service] [links] [arguments]
```
 
### Services

* [deviantart](http://www.deviantart.com/) (by user profile link)
* [twitter](https://twitter.com/) (by user profile link) _(must be public!)_
* [pixiv](https://www.pixiv.net/) (by user profile link)

### Arguments
```
-h, --help                    show service help
-i [N], --iteration=[N]       number of images loaded per iteration (default: 25)
-p [path], --path=[path]      path to images directory (default: path to current directory + "/images")

Deviantart and Twitter specific args:
--unsafe                      download unsafe pictures (default: false)

Pixiv specific args:
-U [username], --username=[username]   pixiv username (required!)
-P [password], --password=[password]   pixiv password (required!)
-c, --collections                      download images in collections too
```

### Example of usage

* Get images from deviant art 
```sh
$ img-grab deviantart https://www.deviantart.coms/kvacm
```
* Get images from pixiv including images in collections
```sh
$ img-grab pixiv.net/member_illust.php?id=10655554 https://www.pixiv.net/member.php?id=810305 -c
```
* Get images from twitter (10 images per iteration)
```sh
$ img-grab twitter https://twitter.com/genskc -i 10
```

### Sources install

* Install [node.js](https://nodejs.org/en/)
* Clone repo
* Run `npm i` or `npm install`
* After install, run `./bin/run [service] [links] [arguments]`

### References
* [The Open CLI Framework](https://oclif.io)
* [node-twitter-media](https://github.com/tukiyururu/node-twitter-media) by [tukiyururu](https://github.com/tukiyururu)
* [pixiv-app-api](https://github.com/akameco/pixiv-app-api) and [pixiv-img](https://github.com/akameco/pixiv-img) by [akameco](https://github.com/akameco)
