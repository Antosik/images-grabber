import Promise from 'bluebird';
import Danbooru from 'danbooru';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';

import { req } from '../util/functions';

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
