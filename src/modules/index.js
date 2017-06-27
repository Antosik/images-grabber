import pixiv from './pixiv';
import twitter from './twitter';
import danbooru from './danbooru';
import deviantart from './deviantart';

function getImages(args) {
  const { type } = args;
  switch (type) {
    case 'Twitter':
      return twitter.getImages(args);
    case 'Pixiv':
      return pixiv.getImages(args);
    case 'Danbooru':
      return danbooru.getImages(args);
    case 'Deviantart':
      return deviantart.getImages(args);
    default:
      return Promise.reject('Module not found!');
  }
}

function downloadImage({ type, path }, image, index) {
  switch (type) {
    case 'Twitter':
      return twitter.downloadImage(image, path, index);
    case 'Pixiv':
      return pixiv.downloadImage(image, path, index);
    case 'Danbooru':
      return danbooru.downloadImage(image, path, index);
    case 'Deviantart':
      return deviantart.downloadImage(image, path, index);
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
    case 'Deviantart':
      return deviantart.validateURL(link);
    default:
      return Promise.reject('Module not found!');
  }
}

export { getImages, downloadImage, validateLink };
