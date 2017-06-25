import BigNumber from 'bignumber.js';
import cheerio from 'cheerio';
import co from 'co';
import fs from 'fs';
import path from 'path';

import { req } from '../util/functions';

const twitterURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(?:twitter.com\/)(\w{1,})/i);
BigNumber.config({ DECIMAL_PLACES: 40, ERRORS: false });

const mediaReq = (name, param = '') => req(`https://twitter.com/i/profiles/show/${name}/media_timeline${param}`, { json: true });

const getMedia = (html) => {
  const $ = cheerio.load(html);

  return $('.AdaptiveMedia-photoContainer').map((i, el) =>
    $(el).data('image-url'),
  ).get();
};

const getParam = (html) => {
  const $ = cheerio.load(html);
  const cxtId = $('.tweet').last().data('tweet-id');
  const big = new BigNumber(cxtId);
  const maxId = big.minus(1).toFixed(0);

  return `?last_note_ts=${cxtId}&max_position=${maxId}`;
};

function* getIllusts(name) {
  let results = [];
  let json = yield mediaReq(name);
  let html = json.items_html;
  results = getMedia(html);

  while (json.has_more_items) {
    json = yield mediaReq(name, getParam(html));
    html = json.items_html;
    results = results.concat(getMedia(html));
  }

  return results;
}

function getImages(link) {
  const name = path.basename(link);
  return co(getIllusts(name));
}

const downloadImage = async (url, filepath) => {
  const file = `${filepath}/${path.basename(url)}`;
  const data = await req(`${url}:orig`, { encoding: null });
  fs.writeFileSync(file, data, 'binary');
};

const validateURL = link => twitterURLRegExp.test(link);

export default { getImages, downloadImage, validateURL };
