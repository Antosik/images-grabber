import { flags } from "@oclif/command";
import chalk from "chalk";

import DeviantArtSearch from "../modules/deviantart";
import AServiceCommand from "../types/AServiceCommand";

export default class DeviantArtCommand extends AServiceCommand {
  static strict = false;
  static description = "get images from DeviantArt (https://www.deviantart.com/)";

  static flags = {
    ...AServiceCommand.flags,
    unsafe: flags.boolean({
      description: "download unsafe pictures",
      default: false
    })
  };

  static args = [
    {
      name: "sources",
      required: true,
      description:
        "space separated image sources (links to author page, for example: https://www.deviantart.com/kvacm)"
    }
  ];

  async run() {
    const {
      argv,
      flags: { iteration, path, unsafe }
    } = this.parse(DeviantArtCommand);

    if (argv.length !== 0) {
      const engine = new DeviantArtSearch({
        path,
        imagesPerIteration: iteration,
        unsafe
      });

      for (const source of argv) {
        this.log("\n" + chalk.blue(source));
        await this.search(engine, source);
      }
    }
  }
}
