import { EventEmitter } from "events";

import { createDir, directoryExists } from "../util/functions";

export default abstract class AbstractServiceSearch {
  public events: EventEmitter;
  public options: any;

  public constructor(options: any) {
    this.options = { path: "./images", imagesPerIteration: 25, ...options };

    this.events = new EventEmitter();
  }

  public abstract async login(
    username: string,
    password: string
  ): Promise<boolean>;
  public abstract async getImages(): Promise<string[]>;
  public abstract async downloadImage(
    url: string,
    index: number
  ): Promise<void>;

  public async downloadImages(images: string[]): Promise<void> {
    const { path, imagesPerIteration } = this.options;

    const isDirExist = await directoryExists(path);
    if (!isDirExist) {
      await createDir(path);
    }

    const iterationCount = Math.ceil(images.length / imagesPerIteration);
    const iterationContainer = new Array(iterationCount)
      .fill([])
      .map((_, i) =>
        images.slice(i * imagesPerIteration, (i + 1) * imagesPerIteration)
      );

    for (const [i, iteration] of iterationContainer.entries()) {
      await Promise.all(
        iteration.map((url, index) =>
          this.downloadImage(url, i * imagesPerIteration + index)
        )
      );
    }

    return;
  }
}
