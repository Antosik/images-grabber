import { EventEmitter } from "events";

import { createDir, directoryExists } from "../util/functions";

export default abstract class AServiceSearch {
  public events: EventEmitter;
  public options: any;

  public constructor(options: any) {
    this.options = { path: "./images", imagesPerIteration: 25, ...options };

    this.events = new EventEmitter();
  }

  public abstract async getImages(source: string): Promise<string[]>;

  public async downloadImages(source: string, images: string[] = []): Promise<void> {
    const { path, imagesPerIteration } = this.options;
    const sourceID = this.getSourceID(source) || "unnamed";

    const isPathExist = await directoryExists(path);
    if (!isPathExist) {
      await createDir(path);
    }

    const folderPath = `${path}/${sourceID}`;
    const isDirExist = await directoryExists(folderPath);
    if (!isDirExist) {
      await createDir(folderPath);
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
          this.downloadImage(url, folderPath, i * imagesPerIteration + index)
        )
      );
    }

    return;
  }

  public abstract async login(
    username: string,
    password: string
  ): Promise<boolean>;

  protected abstract getSourceID(source: string): string | undefined;

  protected abstract async downloadImage(
    url: string,
    path: string,
    index: number
  ): Promise<void>;
}
