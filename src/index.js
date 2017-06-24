import chalk from 'chalk';
import clear from 'clear';
import clui from 'clui';
import figlet from 'figlet';

import getLink from './views/getLink';
import { pixiv } from './modules';

const Progress = clui.Progress;
const Spinner = clui.Spinner;

clear();
console.log(
  chalk.blue(
    figlet.textSync('Img Grabber', { horizontalLayout: 'full' }),
  ),
);

getLink()
  .then((args) => {
    const ProgressBar = new Progress(20);
    let i = 0;
    const GettingImages = new Spinner('We find images, please wait...  ');
    GettingImages.start();
    switch (args.type) {
      case 'Twitter':
        console.log('Not implemented yet');
        return null;
      case 'Pixiv':
        return pixiv.getImages(args.link, args.all)
          .then((images) => {
            GettingImages.stop();
            console.log(`Found ${images.length} images!`);
            return images;
          })
          .mapSeries((el, index, len) =>
            pixiv.downloadImage(el, args.path)
              .then(() => {
                i += 1;
                process.stdout.write('\r\x1b[K');
                process.stdout.write(ProgressBar.update(i / len));
              }),
          )
          .then(() => {
            console.log(' - Successfully downloaded! \n');
          });
      case 'DeviantArt':
        console.log('Not implemented yet');
        return null;
      default:
        break;
    }
    throw new Error('invalid type');
  });
