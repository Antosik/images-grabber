import inquirer from 'inquirer';
import Preferences from 'preferences';

import { isLink } from '../util/consts';
import { directoryExists, createDir } from '../util/functions';
import { validateLink } from '../modules/index';

const isWindows = /^win/.test(process.platform);

const getLink = () => {
  const prefs = new Preferences('images-grabber');

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
      name: 'pixivLoginAs',
      type: 'confirm',
      message: `Do you want to login as ${prefs.pixivUsername}?`,
      when(answers) {
        return answers.type === 'Pixiv' && prefs.pixivUsername && prefs.pixivPassword;
      },
    },
    {
      name: 'pixivUsername',
      type: 'input',
      message: 'Enter your pixiv username (or skip)',
      when(answers) {
        return answers.type === 'Pixiv' && (!prefs.pixivUsername || !answers.pixivLoginAs);
      },
    },
    {
      name: 'pixivPassword',
      type: 'password',
      message: 'Enter your pixiv password (or skip)',
      when(answers) {
        return answers.type === 'Pixiv' && (!prefs.pixivPassword || !answers.pixivLoginAs);
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
