import path from 'path';
import fs from 'fs';
import got from 'got';

const getCurrentDirectoryBase = () => path.basename(process.cwd());

const directoryExists = (filePath) => {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (err) {
    return false;
  }
};

const createDir = (filePath) => {
  try {
    fs.mkdirSync(filePath);
    return true;
  } catch (err) {
    return false;
  }
};

const req = async (url, opt = {}) => {
  opt.headers = {                         // eslint-disable-line no-param-reassign
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
  };
  const res = await got(url, opt);
  return res.body;
};

const wait = (time = 1000) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

export {
  getCurrentDirectoryBase,
  directoryExists,
  createDir,
  req,
  wait,
};
