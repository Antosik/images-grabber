#!/usr/bin/env node

import 'babel-polyfill';
import Promise from 'bluebird';

import { MainWindowInit, getLink, Progress } from './views';
import ModulesInit from './modules';
import getArgs from './util/args';

(async () => {
  MainWindowInit();
  const { getImages, downloadImage } = await ModulesInit();
  const argv = await getArgs(process.argv.slice(2));
  const args = await getLink(argv);
  const progress = new Progress();

  progress.startFind();
  const images = await getImages(args);
  if (!images.length) {
    console.error('  No images found :c');
    process.exit(0);
  }

  progress.endFind(images);

  await Promise.resolve(images)
    .map(async (el, index, len) => {
      await downloadImage(args, el, index);
      progress.imageDownloaded(len);
    }, { concurrency: 5 });

  console.log(' - Successfully downloaded! \n');
})();
