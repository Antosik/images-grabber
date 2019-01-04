import { flags } from "@oclif/command";
import chalk from "chalk";

import TwitterSearch from "../modules/twitter";
import AServiceCommand from "../types/AServiceCommand";

export default class TwitterCommand extends AServiceCommand {
  static strict = false;
  static description = "Get image from Twitter (https://twitter.com)";

  static flags = {
    ...AServiceCommand.flags,
    unsafe: flags.boolean({
      description: "Download unsafe pictures",
      default: false
    })
  };

  async run() {
    const {
      argv,
      flags: { iteration, path, unsafe }
    } = this.parse(TwitterCommand);

    if (argv.length) {
      const engine = new TwitterSearch({
        path,
        imagesPerIteration: iteration,
        unsafe
      });

      for (const source of argv) {
        console.log("\n" + chalk.blue(source));
        await this.search(engine, source);
      }
    }
  }
}
