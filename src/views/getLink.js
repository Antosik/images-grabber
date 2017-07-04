import inquirer from 'inquirer';
import Preferences from 'preferences';

import { directoryExists, createDir } from '../util/functions';
import ModulesInit from '../modules';

const isWindows = /^win/.test(process.platform);

const getLink = async (args) => {
  const prefs = new Preferences('images-grabber');
  const { moduleNames, questions } = await ModulesInit();
  if (!args.cli) {
    if (args.type === 'Pixiv') {
      if (
        (prefs.pixivUsername && prefs.pixivPassword) || (args.pixivUsername && args.pixivPassword)
      ) return args;
    } else return args;
  }

  const question = [
    {
      name: 'type',
      type: isWindows ? 'rawlist' : 'list',
      message: 'What service you want to use?',
      choices: moduleNames,
      default: 2,
    },
    ...questions(args, prefs),
    {
      name: 'path',
      type: 'input',
      message: 'Enter path, where you want to save pictures:',
      when() {
        return args.cli;
      },
      validate(value) {
        if (value.length && directoryExists(value)) {
          return true;
        }
        if (value.length && createDir(value)) {
          return true;
        }
        return 'Please enter valid path';
      },
    },
  ];

  return inquirer.prompt(question);
};

export default getLink;
