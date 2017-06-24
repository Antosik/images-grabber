import inquirer from 'inquirer';

import { isLink } from '../util/consts';
import { directoryExists, createDir } from '../util/functions';

const isWindows = /^win/.test(process.platform);

function getLink() {
  const questions = [
    {
      name: 'type',
      type: isWindows ? 'rawlist' : 'list',
      message: 'What service you want to use?',
      choices: [
        'Twitter',
        'Pixiv',
        'DeviantArt',
      ],
      default: 1,
    },
    {
      name: 'link',
      type: 'input',
      message: 'Enter link to user whose pictures you want to grab:',
      validate(value) {
        if (value.length && isLink(value)) {
          return true;
        }
        return 'Please enter valid link';
      },
    },
    {
      name: 'all',
      type: 'confirm',
      message: 'Do you want to grab pictures in "collections"?',
      when(answers) {
        return answers.type === 'Pixiv';
      },
    },
    {
      name: 'path',
      type: 'input',
      message: 'Enter path, where you want to save pictures:',
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

  return inquirer.prompt(questions);
}

export default getLink;
