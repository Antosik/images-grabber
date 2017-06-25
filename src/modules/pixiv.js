import PixivApi from 'pixiv-app-api';
import co from 'co';
import pixivImg from 'pixiv-img';
import path from 'path';
import _ from 'lodash';
import Promise from 'bluebird';

const pixiv = new PixivApi();
const pixivURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(?:pixiv.net\/member(?:|_illust).php\?id=)(\d{1,})/i);

function* getIllusts(id) {
  let results = [];
  let json = yield pixiv.userIllusts(id);
  results = json.illusts.slice();

  while (pixiv.hasNext()) {
    json = yield pixiv.next();
    results = results.concat(json.illusts);
  }

  return results;
}

function getIllustrUrls(el, all) {
  if (all) {
    if (el.metaPages && el.metaPages.length > 0) {
      return [].concat.apply(el.metaPages.map(img => img.imageUrls.original));
    }
    return [el.metaSinglePage.originalImageUrl];
  }
  if (el.metaPages && el.metaPages.length > 0) {
    return [el.metaPages[0].imageUrls.original];
  }
  return [el.metaSinglePage.originalImageUrl];
}

function getPosts(link) {
  if (pixivURLRegExp.test(link)) {
    const id = pixivURLRegExp.exec(link)[1];
    return co(getIllusts(id));
  }
  throw new Error('Invalid pixiv author link!');
}

function getImages(link, all) {
  return Promise.resolve(getPosts(link))
    .then(res => _.flattenDeep(res.map(el => getIllustrUrls(el, all))));
}

const downloadImage = (el, filepath) => pixivImg(el, `${filepath}/${path.basename(el)}`);

const validateURL = link => pixivURLRegExp.test(link);

export default { getImages, downloadImage, validateURL };
