import * as fs from 'fs';
import * as got from 'got';
import * as path from 'path';

const getCurrentDirectoryBase = () => path.basename(process.cwd());

const directoryExists = (filePath: string): boolean => {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch (err) {
        return false;
    }
};

const createDir = (filePath: string): boolean => {
    try {
        fs.mkdirSync(filePath);
        return true;
    } catch (err) {
        return false;
    }
};

const req = async (url: string, opt: any = {}) => {
    opt.headers = {                         // eslint-disable-line no-param-reassign
        'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
    };
    const res = await got(url, opt);
    return res.body;
};

const wait = (time: number = 1000): Promise<void> =>
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
