import { Command, flags } from "@oclif/command";

export default abstract class AServiceCommand extends Command {
  static strict = false;

  static flags = {
    help: flags.help({ char: "h" }),
    path: flags.string({
      char: "d",
      description: "Directory where to save images",
      default: "./images"
    }),
    iteration: flags.integer({
      char: "i",
      description: "Count of images downloading per iteration",
      default: 25
    })
  };
}
