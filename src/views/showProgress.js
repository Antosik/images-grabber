/* eslint-disable class-methods-use-this */
import clui from 'clui';

const Progress = clui.Progress;

export default class {
  constructor() {
    this.ProgressBar = new Progress(20);
    this.i = 0;
  }

  startFind() {
    console.log('\n  We are looking for images, please wait...  ');
  }

  endFind(images) {
    if (images.length) {
      console.log(`  ${images.length} images found!`);
      return images;
    }
    throw new Error('No images found :c');
  }

  imageDownloaded(len) {
    this.i += 1;
    process.stdout.write('\r\x1b[K');
    process.stdout.write(`  Downloading images: ${this.ProgressBar.update(this.i / len)}`);
  }
}
