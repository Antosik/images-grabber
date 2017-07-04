import BigNumber from 'bignumber.js';
import cheerio from 'cheerio';
import co from 'co';
import fs from 'fs';
import path from 'path';

import { req, wait } from '../util/functions';

const name = 'Twitter';
const twitterURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(?:twitter.com\/)(\w{1,})/i);

BigNumber.config({ DECIMAL_PLACES: 40, ERRORS: false });

const mediaReq = (username, param = '') =>
  req(`https://twitter.com/i/profiles/show/${username}/media_timeline${param}`, { json: true })
    .catch((err) => {
      console.error(`    Twitter request error: ${err}`);
      return {
        has_more_items: false,
        items_html: '',
      };
    });
const getMedia = (html, unsafe = false) => {
  const $ = cheerio.load(html);

  return $('.AdaptiveMedia-photoContainer').map((i, el) => {
    if ($(el).closest('[data-possibly-sensitive=true]').length) {
      if (unsafe) return $(el).data('image-url');
      return null;
    }
    return $(el).data('image-url');
  }).get().filter(img => !!img);
};
const getParam = (html) => {
  const $ = cheerio.load(html);
  const cxtId = $('.tweet').last().data('tweet-id');
  const big = new BigNumber(cxtId);
  const maxId = big.minus(1).toFixed(0);

  return `?last_note_ts=${cxtId}&max_position=${maxId}`;
};
function* getIllusts(username, unsafe = false) {
  let json = yield mediaReq(username);
  let html = json.items_html;
  let results = getMedia(html, unsafe);

  while (json.has_more_items) {
    json = yield mediaReq(username, getParam(html));
    html = json.items_html;
    results = results.concat(getMedia(html, unsafe));
  }

  return results;
}


function getImages({ link, unsafe = false }) {
  const username = path.basename(link);
  return co(getIllusts(username, unsafe));
}
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
const validateURL = link => twitterURLRegExp.test(link);
const questions = (args, prefs) =>                      // eslint-disable-line no-unused-vars
  [
    {
      name: 'link',
      type: 'input',
      message: 'Enter link to user whose pictures you want to grab (like https://twitter.com/kamindani):',
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
