import inquirer from 'inquirer';

import { isLink } from '../util/consts';
import { directoryExists, createDir } from '../util/functions';
import { validateLink } from '../modules/index';

const isWindows = /^win/.test(process.platform);

const getLink = () => {
  const questions = [
    {
      name: 'type',
      type: isWindows ? 'rawlist' : 'list',
      message: 'What service you want to use?',
      choices: [
        'Danbooru',
        'Deviantart',
        'Pixiv',
        'Twitter',
      ],
      default: 2,
    },
    {
      name: 'link',
      type: 'input',
      message: 'Enter link to user whose pictures you want to grab:',
      validate(value, answers) {
        if (value.length && isLink(value) && validateLink(answers.type, value)) {
          return true;
        }
        return 'Please enter valid link';
      },
      when(answers) {
        return answers.type !== 'Danbooru';
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
      name: 'tags',
      type: 'input',
      message: 'Write tags through a space',
      when(answers) {
        return answers.type === 'Danbooru';
      },
    },
    {
      name: 'unsafe',
      type: 'confirm',
      message: 'Do you want to grab unsafe pictures?',
      when(answers) {
        return answers.type === 'Danbooru';
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
};

export default getLink;
