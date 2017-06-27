import parseArgs from 'minimist';

import { validateLink } from '../modules';

const types = ['Pixiv', 'Deviantart', 'Twitter'];

const getArgs = (args) => {
  const argv = parseArgs(args, {
    string: ['path', 'pixivUsername', 'pixivPassword'],
    boolean: ['unsafe'],
    default: {
      unsafe: false,
      path: '.',
    },
    '--': true,
    alias: {
      path: 'p',
      unsafe: 'us',
    },
  });

  if (argv._.length) {
    let type = 'Danbooru';
    let tags;
    const link = argv._[0];
    types.forEach((defaultType) => {
      if (validateLink(defaultType, link)) type = defaultType;
    });

    if (type === 'Danbooru') tags = link;

    return Object.assign({ cli: false, type, link, tags }, argv);
  }

  return Object.assign({ cli: true }, argv);
};

export default getArgs;
