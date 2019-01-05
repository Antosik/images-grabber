import { Hook } from "@oclif/config";
import chalk from "chalk";

const hook: Hook<"init"> = async function () {
  this.log(chalk.green(`Welcome to images-grabber!`));
};

export default hook;
