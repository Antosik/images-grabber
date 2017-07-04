import fs from 'fs';
import co from 'co';
import path from 'path';
import util from 'util';
import xml2js from 'xml2js';

import { req, wait } from '../util/functions';

const name = 'DeviantArt';
const deviantartURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(.{1,})(?:.deviantart.com(?:\/|))(?:.*)/i);

const parser = new xml2js.Parser();
const parseXML = util.promisify(parser.parseString);

const mediaReq = (username, offset = 0) =>
  req(`http://backend.deviantart.com/rss.xml?type=deviation&q=by%3A${username}+sort%3Atime+meta%3Aall&offset=${offset}`)
    .catch((err) => {
      console.error(`    DeviantArt request error: ${err}`);
      return '';
    });
const getMedia = (json, unsafe = false) =>
  json.rss.channel[0].item
    .map((el) => {
      if (el['media:rating'][0] === 'adult') {
        if (unsafe) return el['media:content'][0].$;
        return null;
      }
      return el['media:content'][0].$;
    })
    .filter(el => !!el)
    .filter(el => el.medium === 'image')
    .map(el => el.url);
const hasNextPage = json =>
(!!json.rss.channel[0]['atom:link'][1] && json.rss.channel[0]['atom:link'][1].$.rel === 'next')
|| (!!json.rss.channel[0]['atom:link'][2] && json.rss.channel[0]['atom:link'][2].$.rel === 'next');
const getImagesCount = json => json.rss.channel[0].item.length;
const getPage = async (username, unsafe = false, offset = 0) => {
  const string = await mediaReq(username, offset);
  const data = await parseXML(string);
  return {
    nextPage: hasNextPage(data),
    count: getImagesCount(data) || 0,
    images: getMedia(data, unsafe) || [],
  };
};
function* getIllusts(username, unsafe = false) {
  let json = yield getPage(username, unsafe);
  let count = json.count;
  let results = json.images;

  while (json.nextPage) {
    json = yield getPage(username, unsafe, count);
    count += json.count;
    results = results.concat(json.images);
  }

  return results;
}


const getImages = async ({ link, unsafe = false }) => {
  const username = deviantartURLRegExp.exec(link)[1].split('.')[0];
  return co(getIllusts(username, unsafe));
};
const downloadImage = async (url, filepath, index) => {
  const file = `${filepath}/${index}${path.extname(url)}`;
  try {
    const data = await req(url, { encoding: null });
    fs.writeFileSync(file, data, 'binary');
  } catch (e) {
    console.error(`    Image (${url}) downloading error: ${e}`);
  }
  await wait(100);
};
const cliargs = {
  string: [],
  boolean: ['unsafe'],
  default: {
    unsafe: false,
  },
  alias: {
    unsafe: 'un',
  },
};
const validateURL = link => deviantartURLRegExp.test(link);
const questions = (args, prefs) =>                      // eslint-disable-line no-unused-vars
  [
    {
      name: 'link',
      type: 'input',
      message: 'Enter link to user whose pictures you want to grab (like http://sandara.deviantart.com/):',
      validate(value) {
        if (value.length && validateURL(value)) {
          return true;
        }
        return 'Please enter valid link';
      },
      when(answers) {
        return answers.type === name && !args.link;
      },
    },
    {
      name: 'unsafe',
      type: 'confirm',
      message: 'Do you want to grab unsafe pictures?',
      when(answers) {
        return answers.type === name && args.unsafe === undefined;
      },
    },
  ];

export { getImages, downloadImage, validateURL, name, questions, cliargs };
