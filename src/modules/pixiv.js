import co from 'co';
import flattenDeep from 'lodash.flattendeep';
import path from 'path';
import PixivApi from 'pixiv-app-api';
import pixivImg from 'pixiv-img';
import Preferences from 'preferences';

import { wait } from '../util/functions';

const pixivURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(?:pixiv.net\/member(?:|_illust).php\?id=)(\d{1,})/i);

function* getWorks(pixiv, id, type) {
  let json = yield pixiv.userIllusts(id, { type });
  let results = json.illusts.slice();

  while (pixiv.hasNext()) {
    json = yield pixiv.next();
    results = results.concat(json.illusts);
  }

  return results;
}

function getIllustrUrls(el, all) {
  if (el.metaPages && el.metaPages.length > 0) {
    return all ?
      [].concat.apply(el.metaPages.map(img => img.imageUrls.original || img.imageUrls.large)) :
      [el.metaPages[0].imageUrls.original];
  }
  return [el.metaSinglePage.originalImageUrl];
}

function getPosts(pixiv, link) {
  const id = pixivURLRegExp.exec(link)[1];
  return Promise.all([
    co(getWorks(pixiv, id, 'illust')),
    co(getWorks(pixiv, id, 'manga')),
  ]);
}

const loginToPixiv = async (pixivUsername, pixivPassword, pixivLoginAs) => {
  const prefs = new Preferences('images-grabber');
  const pixiv = new PixivApi();

  if (pixivUsername && pixivPassword) {
    prefs.pixivUsername = pixivUsername;
    prefs.pixivPassword = pixivPassword;
    await pixiv.login(prefs.pixivUsername, prefs.pixivPassword);
    return pixiv;
  }
  if (pixivLoginAs) {
    await pixiv.login(prefs.pixivUsername, prefs.pixivPassword);
    return pixiv;
  }

  return pixiv;
};

const getImages = async ({ link, all, pixivUsername, pixivPassword, pixivLoginAs }) => {
  const pixiv = await loginToPixiv(pixivUsername, pixivPassword, pixivLoginAs);
  const posts = await getPosts(pixiv, link);
  return flattenDeep(flattenDeep(posts).map(el => getIllustrUrls(el, all)));
};

const downloadImage = async (el, filepath) => {
  await pixivImg(el, `${filepath}/${path.basename(el)}`);
  await wait;
};

const validateURL = link => pixivURLRegExp.test(link);

export default { getImages, downloadImage, validateURL };
