import { Hook } from "@oclif/config";
import chalk from "chalk";

const hook: Hook<"init"> = async function () {
  this.log(chalk.red(`Command not found!`));
  this.log(
    chalk.grey(`Enter `) +
      chalk.magenta(`"images-grabber help"`) +
      chalk.grey(` to see available commands or `) +
      chalk.magenta(`"images-grabber help [COMMAND]"`) +
      chalk.grey(` to see arguments of command`)
  );
};

export default hook;
