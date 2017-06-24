import path from 'path';
import fs from 'fs';

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

export {
  getCurrentDirectoryBase,
  directoryExists,
  createDir,
};
