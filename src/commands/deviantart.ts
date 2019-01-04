import { flags } from "@oclif/command";

import DeviantArtSearch from "../modules/deviantart";
import AServiceCommand from "../types/AServiceCommand";

export default class DeviantArtCommand extends AServiceCommand {
  static strict = false;
  static description = "Get image from DeviantArt (https://www.deviantart.com/)";

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
    } = this.parse(DeviantArtCommand);

    if (argv.length) {
      const search = new DeviantArtSearch({
        path,
        imagesPerIteration: iteration,
        unsafe
      });

      for (const author of argv) {
        await search.downloadImages(author);
      }
    }
  }
}
