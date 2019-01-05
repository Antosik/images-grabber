import { Command, flags } from "@oclif/command";
import * as Listr from "listr";

import AServiceSearch from "./AServiceSearch";

export default abstract class AServiceCommand extends Command {
  static strict = false;

  static flags = {
    help: flags.help({ char: "h" }),
    path: flags.string({
      char: "p",
      description: "path to images directory",
      default: "./images"
    }),
    iteration: flags.integer({
      char: "i",
      description: "number of images loaded per iteration",
      default: 25
    })
  };

  search(engine: AServiceSearch, source: string) {
    const tasks = new Listr([
      {
        title: `Searching for images`,
        task: async (ctx, task) => {
          engine.events.addListener("error", e => task.report(e));
          engine.events.addListener(
            "findImages",
            count => (task.output = `Found ${count} images`)
          );
          ctx.images = await engine.getImages(source);
          engine.events.removeAllListeners();
          task.title = `Found ${ctx.images.length} images`;
          return Promise.resolve();
        }
      },
      {
        title: "Downloading images",
        task: async (ctx, task) => {
          let total = 0;
          engine.events.addListener("error", task.report);
          engine.events.addListener("imageDownloaded", () => {
            total += 1;
            task.output = `Downloaded ${total}/${ctx.images.length} images`;
          });
          await engine.downloadImages(source, ctx.images);
          task.title = `Downloaded ${total}/${ctx.images.length} images`;
          engine.events.removeAllListeners();
          return Promise.resolve();
        }
      }
    ]);
    return tasks.run();
  }
}
