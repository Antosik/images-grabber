import parseArgs from 'minimist';
import ModulesInit from '../modules';

const getArgs = async (mainargs) => {
  const { moduleNames, args, validateLink } = await ModulesInit();
  const argv = parseArgs(mainargs, args());

  if (argv._.length) {
    let type = 'Danbooru';
    let tags;
    const link = argv._[0];
    moduleNames.forEach((moduleName) => {
      if (validateLink(moduleName, link)) type = moduleName;
    });

    if (type === 'Danbooru') tags = link;

    return Object.assign({ cli: false, type, link, tags }, argv);
  }

  return Object.assign({ cli: true }, argv);
};

export default getArgs;
