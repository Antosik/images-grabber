import { flags } from "@oclif/command";
import chalk from "chalk";

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
      const engine = new PixivSearch({
        path,
        username,
        password,
        all: collections,
        imagesPerIteration: iteration
      });

      for (const source of argv) {
        console.log("\n" + chalk.blue(source));
        await this.search(engine, source);
      }
    }
  }
}
