import Promise from 'bluebird';
import Danbooru from 'danbooru';
import path from 'path';
import fs from 'fs';
import got from 'got';
import _ from 'lodash';

const req = async (url, opt) => {
  opt.headers = {                         // eslint-disable-line no-param-reassign
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
  };
  const res = await got(url, opt);
  return res.body;
};

const getImages = async (tags, unsafe) => {
  const danbooru = unsafe ? new Danbooru() : new Danbooru.Safebooru();
  const count = await danbooru.requestJson('GET counts/posts.json', { tags });
  let results = [];

  if (!count || !count.counts || !count.counts.posts) {
    return [];
  }
  if (count.counts.posts < 100) results = await danbooru.posts({ limit: 100, page: 1, tags });
  else {
    const queries = [];
    for (let i = 1, len = Math.ceil(count.counts.posts / 100); i < len + 1; i += 1) {
      queries.push(danbooru.posts({ limit: 100, page: i, tags }));
    }
    results = await Promise.all(queries);
  }

  return _.flattenDeep(results).map(post => `http://danbooru.donmai.us${post.raw.file_url}`);
};

const downloadImage = async (url, filepath) => {
  const file = `${filepath}/${path.basename(url)}`;
  const data = await req(url, { encoding: null });
  fs.writeFileSync(file, data, 'binary');
};

export default { getImages, downloadImage };
