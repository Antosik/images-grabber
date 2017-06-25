import { init, getLink, Progress } from './views';
import { getImages, downloadImage } from './modules';

init();

getLink()
  .then((args) => {
    const progress = new Progress();

    progress.startFind();
    getImages(args)
      .then(progress.endFind)
      .map((el, index, len) =>
          downloadImage(args, el)
            .then(progress.imageDownloaded(len)),
        { concurrency: 5 })
      .then(() => {
        console.log(' - Successfully downloaded! \n');
      })
      .catch((err) => {
        console.error(`  Got error: ${err}! \n`);
        process.exit(1);
      });
  });
