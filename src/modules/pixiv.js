import co from 'co';
import flattenDeep from 'lodash.flattendeep';
import path from 'path';
import PixivApi from 'pixiv-app-api';
import pixivImg from 'pixiv-img';
import Preferences from 'preferences';

import { wait } from '../util/functions';

const name = 'Pixiv';
const pixivURLRegExp = new RegExp(/(?:(?:http|https)(?::\/\/)|)(?:www.|)(?:pixiv.net\/member(?:|_illust).php\?id=)(\d{1,})/i);

function* getWorks(pixiv, id, type) {
  let json;
  try {
    json = yield pixiv.userIllusts(id, { type });
  } catch (e) {
    console.error(`    Pixiv request error: ${e}`);
    json = { illusts: [] };
  }
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
  let pixiv = new PixivApi();

  if ((pixivUsername && pixivPassword) || pixivLoginAs) {
    try {
      await pixiv.login(prefs.pixivUsername, prefs.pixivPassword);
      if (pixivUsername && pixivPassword) {
        prefs.pixivUsername = pixivUsername;
        prefs.pixivPassword = pixivPassword;
      }
    } catch (e) {
      console.error(`    Pixiv login errored: ${e}. Continue as guest.`);
      pixiv = new PixivApi();
    }
    return pixiv;
  }

  return pixiv;
};


const getImages = async ({ link, all, pixivUsername, pixivPassword, pixivLoginAs }) => {
  const pixiv = await loginToPixiv(pixivUsername, pixivPassword, pixivLoginAs);
  const posts = await getPosts(pixiv, link);
  return flattenDeep(flattenDeep(posts).map(el => getIllustrUrls(el, all)));
};
const downloadImage = async (url, filepath, index) => {
  const file = `${filepath}/${index}${path.extname(url)}`;
  try {
    await pixivImg(url, file);
  } catch (e) {
    console.error(`    Image (${url}) downloading error: ${e}`);
  }
  await wait;
};
const cliargs = {
  string: ['pixivUsername', 'pixivPassword'],
  boolean: ['unsafe'],
  default: {
    unsafe: false,
  },
  alias: {
    unsafe: 'un',
    pixivUsername: 'pixivU',
    pixivPassword: 'pixivP',
  },
};
const validateURL = link => pixivURLRegExp.test(link);
const questions = (args, prefs) =>                      // eslint-disable-line no-unused-vars
  [
    {
      name: 'link',
      type: 'input',
      message: 'Enter link to user whose pictures you want to grab (like https://www.pixiv.net/member_illust.php?id=6996493):',
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
      name: 'all',
      type: 'confirm',
      message: 'Do you want to grab pictures in "collections"?',
      when(answers) {
        return answers.type === name;
      },
    },
    {
      name: 'pixivLoginAs',
      type: 'confirm',
      message: `Do you want to login as ${prefs.pixivUsername}?`,
      when(answers) {
        return answers.type === name && prefs.pixivUsername && prefs.pixivPassword;
      },
    },
    {
      name: 'pixivUsername',
      type: 'input',
      message: 'Enter your pixiv username (or skip)',
      when(answers) {
        return answers.type === name &&
          ((!prefs.pixivUsername && !args.pixivUsername) || !answers.pixivLoginAs);
      },
    },
    {
      name: 'pixivPassword',
      type: 'password',
      message: 'Enter your pixiv password (or skip)',
      when(answers) {
        return answers.type === name &&
          ((!prefs.pixivPassword && !args.pixivPassword) || !answers.pixivLoginAs);
      },
    },
  ];

export { getImages, downloadImage, validateURL, name, questions, cliargs };
