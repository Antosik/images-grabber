import Promise from 'bluebird';

import { init, getLink, Progress } from './views';
import { getImages, downloadImage } from './modules';

init();

(async () => {
  const args = await getLink();
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
      await downloadImage(args, el);
      progress.imageDownloaded(len);
    }, { concurrency: 5 });

  console.log(' - Successfully downloaded! \n');
})();
