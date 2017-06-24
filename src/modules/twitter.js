import got from 'got';
import cheerio from 'cheerio';
import BigNumber from 'bignumber.js';
import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';


BigNumber.config({ DECIMAL_PLACES: 40, ERRORS: false });

const wait = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), 5000);
  });

const req = async (url, opt) => {
  opt.headers = {                         // eslint-disable-line no-param-reassign
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
  };
  const res = await got(url, opt);
  return res.body;
};

const getMedia = (html) => {
  const $ = cheerio.load(html);

  return Promise.all(
    $('.AdaptiveMedia-photoContainer').map((i, el) => {
      return $(el).data('image-url');
    }).get(),
  );
};

const getParam = (html) => {
  const $ = cheerio.load(html);
  const cxtId = $('.tweet').last().data('tweet-id');
  const big = new BigNumber(cxtId);
  const maxId = big.minus(1).toFixed(0);

  return `?last_note_ts=${cxtId}&max_position=${maxId}`;
};

const twitterMedia = async (name, param, arr, callback) => {
  const json = await req(
    `https://twitter.com/i/profiles/show/${name}/media_timeline${param}`,
    { json: true },
  );
  const html = json.items_html;
  arr = arr.concat(await getMedia(html));             // eslint-disable-line no-param-reassign

  if (json.has_more_items) {
    await wait();
    twitterMedia(name, getParam(html), arr, callback);
  } else callback(null, arr);
};

function getImages(link) {
  return new Promise((resolve) => {
    let array = [];                                         // eslint-disable-line prefer-const
    const name = path.basename(link);
    twitterMedia(name, '', array, (err, arr) => {
      resolve(arr);
    });
  });
}

const downloadImage = async (url, filepath) => {
  const file = `${filepath}/${path.basename(url)}`;
  const data = await req(`${url}:orig`, { encoding: null });
  fs.writeFileSync(file, data, 'binary');
};

export default { getImages, downloadImage };
