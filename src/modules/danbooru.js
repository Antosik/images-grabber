import Promise from 'bluebird';
import Danbooru from 'danbooru';
import path from 'path';
import fs from 'fs';
import got from 'got';

const req = async (url, opt) => {
  opt.headers = {                         // eslint-disable-line no-param-reassign
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
  };
  const res = await got(url, opt);
  return res.body;
};


const getImages = (tags, unsafe) => {
  const danbooru = unsafe ? new Danbooru() : new Danbooru.Safebooru();

  return new Promise(resolve =>
    danbooru.posts(tags)
      .then(posts =>
        resolve(
          posts.map(post => `http://danbooru.donmai.us${post.raw.file_url}`),
        ),
      ),
  );
};

const downloadImage = async (url, filepath) => {
  const file = `${filepath}/${path.basename(url)}`;
  const data = await req(url, { encoding: null });
  fs.writeFileSync(file, data, 'binary');
};

export default { getImages, downloadImage };
