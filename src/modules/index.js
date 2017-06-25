import Promise from 'bluebird';

import pixiv from './pixiv';
import twitter from './twitter';
import danbooru from './danbooru';

function getImages({ type, link, tags, unsafe = false, all = false }) {
  switch (type) {
    case 'Twitter':
      return twitter.getImages(link);
    case 'Pixiv':
      return pixiv.getImages(link, all);
    case 'Danbooru':
      return danbooru.getImages(tags, unsafe);
    default:
      return Promise.reject('Module not found!');
  }
}

function downloadImage({ type, path }, image) {
  switch (type) {
    case 'Twitter':
      return twitter.downloadImage(image, path);
    case 'Pixiv':
      return pixiv.downloadImage(image, path);
    case 'Danbooru':
      return danbooru.downloadImage(image, path);
    default:
      return Promise.reject('Module not found!');
  }
}

function validateLink(type, link) {
  switch (type) {
    case 'Twitter':
      return twitter.validateURL(link);
    case 'Pixiv':
      return pixiv.validateURL(link);
    default:
      return Promise.reject('Module not found!');
  }
}

export { getImages, downloadImage, validateLink };
