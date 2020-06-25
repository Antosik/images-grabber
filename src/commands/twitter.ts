import { flags } from "@oclif/command";
import chalk from "chalk";

import TwitterSearch from "../modules/twitter";
import AServiceCommand from "../types/AServiceCommand";

export default class TwitterCommand extends AServiceCommand {
  static strict = false;
  static description = "get images from Twitter (https://twitter.com)";

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
        "space separated image sources (links to author page, for example: https://twitter.com/genskc)"
    }
  ];

  async run() {
    const {
      argv,
      flags: { iteration, path, unsafe }
    } = this.parse(TwitterCommand);

    if (argv.length !== 0) {
      const engine = new TwitterSearch({
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
