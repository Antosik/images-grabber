import fs from 'fs';
import co from 'co';
import path from 'path';
import util from 'util';
import xml2js from 'xml2js';

import { req, wait } from '../util/functions';

const deviantartURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(.{1,})(?:.deviantart.com(?:\/|))(?:.*)/i);
const parser = new xml2js.Parser();
const parseXML = util.promisify(parser.parseString);

const mediaReq = (name, offset = 0) =>
  req(`http://backend.deviantart.com/rss.xml?type=deviation&q=by%3A${name}+sort%3Atime+meta%3Aall&offset=${offset}`)
    .catch((err) => {
      console.error(`    DeviantArt request error: ${err}`);
      return '';
    });

const getMedia = json => json.rss.channel[0].item
  .map(el => el['media:content'][0].$)
  .filter(el => el.medium === 'image')
  .map(el => el.url);

const hasNextPage = json =>
(!!json.rss.channel[0]['atom:link'][1] && json.rss.channel[0]['atom:link'][1].$.rel === 'next')
|| (!!json.rss.channel[0]['atom:link'][2] && json.rss.channel[0]['atom:link'][2].$.rel === 'next');

const getImagesCount = json => json.rss.channel[0].item.length;

const getPage = async (name, offset = 0) => {
  const string = await mediaReq(name, offset);
  const data = await parseXML(string);
  return {
    nextPage: hasNextPage(data),
    count: getImagesCount(data) || 0,
    images: getMedia(data) || [],
  };
};

function* getIllusts(name) {
  let json = yield getPage(name);
  let count = json.count;
  let results = json.images;

  while (json.nextPage) {
    json = yield getPage(name, count);
    count += json.count;
    results = results.concat(json.images);
  }

  return results;
}

const getImages = async ({ link }) => {
  const name = deviantartURLRegExp.exec(link)[1].split('.')[0];
  return co(getIllusts(name));
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

const validateURL = link => deviantartURLRegExp.test(link);

export default { getImages, downloadImage, validateURL };
