import { mkdir, readdir, stat, writeFile } from "fs";
import * as got from "got";
import { basename } from "path";
import { promisify } from "util";

const mkdirAsync = promisify(mkdir);
const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);
const writeFileAsync = promisify(writeFile);

const getCurrentDirectoryBase = () => basename(process.cwd());

/**
 * Checks, is directory exists
 * @param {string} dirPath directory path
 * @returns {Promise<boolean>}
 */
const directoryExists = (dirPath: string): Promise<boolean> =>
  statAsync(dirPath)
    .then(stats => stats.isDirectory())
    .catch(() => false);

/**
 * Creates directory
 * @param {string} dirPath directory path
 * @returns {Promise<boolean>}
 */
const createDir = (dirPath: string): Promise<boolean> =>
  mkdirAsync(dirPath)
    .then(() => true)
    .catch(() => false);

/**
 * Load file names in directory
 * @param {string} dirPath directory path
 * @returns {Promise<string[]>}
 */
const readDir = (dirPath: string): Promise<string[]> =>
  readdirAsync(dirPath).catch(() => []);

const writeBuffer = (name: string, data: Buffer) =>
  writeFileAsync(name, data, "binary");

const req = async (url: string, opt: any = {}) => {
  opt.headers = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko"
  };
  const res = await got(url, opt);
  return res.body;
};

const wait = (time: number = 1000): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => resolve(), time);
  });

export {
  getCurrentDirectoryBase,
  directoryExists,
  createDir,
  readDir,
  writeBuffer,
  req,
  wait
};
