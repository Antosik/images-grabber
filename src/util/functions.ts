import axios, { AxiosRequestConfig } from "axios";
import { mkdir, readdir, stat, writeFile } from "fs";
import { basename } from "path";
import { promisify } from "util";

const pkg = require('../../package.json');

const mkdirAsync = promisify(mkdir);
const readdirAsync = promisify(readdir);
const statAsync = promisify(stat);
const writeFileAsync = promisify(writeFile);

const getCurrentDirectoryBase = () => basename(process.cwd());

/**
 * Checks, is directory exists
 * @param dirPath directory path
 * @returns is directory exists
 */
const directoryExists = async (dirPath: string): Promise<boolean> =>
  statAsync(dirPath)
    .then(stats => stats.isDirectory())
    .catch(() => false);

/**
 * Creates directory
 * @param dirPath directory path
 * @returns is directory created
 */
const createDir = async (dirPath: string): Promise<boolean> =>
  mkdirAsync(dirPath)
    .then(() => true)
    .catch(() => false);

/**
 * Load file names in directory
 * @param dirPath directory path
 * @returns array of filenames
 */
const readDir = async (dirPath: string): Promise<string[]> =>
  readdirAsync(dirPath).catch(() => []);

const writeBuffer = async (name: string, data: Buffer) =>
  writeFileAsync(name, data, "binary");

const req = async (url: string, opt: AxiosRequestConfig = {}) => {
  opt.headers = {
    "user-agent": `${pkg.name}/${pkg.version} (+${pkg.homepage})`,
    ...opt.headers
  };
  return axios(url, opt);
};

const wait = (time = 1000): Promise<void> =>
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
