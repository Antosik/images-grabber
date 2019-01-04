import { flags } from "@oclif/command";

import PixivSearch from "../modules/pixiv";
import AServiceCommand from "../types/AServiceCommand";

export default class PixivCommand extends AServiceCommand {
  static strict = false;
  static description = "Get image from pixiv (https://pixiv.net)";

  static flags = {
    ...AServiceCommand.flags,
    username: flags.string({
      char: "U",
      description: "pixiv username",
      required: true
    }),
    password: flags.string({
      char: "P",
      description: "pixiv password",
      required: true
    }),
    collections: flags.boolean({
      char: "c",
      description: "Download images in collections too",
      default: false
    })
  };

  async run() {
    const {
      argv,
      flags: { iteration, path, username, password, collections }
    } = this.parse(PixivCommand);

    if (argv.length) {
      const search = new PixivSearch({
        path,
        username,
        password,
        all: collections,
        imagesPerIteration: iteration
      });

      for (const author of argv) {
        await search.downloadImages(author);
      }
    }
  }
}
