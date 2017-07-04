/* eslint-disable global-require, import/no-dynamic-require */

import fs from 'fs';
import path from 'path';
import flattenDeep from 'lodash.flattendeep';
import mergeWith from 'lodash.mergewith';
import union from 'lodash.union';
import { defaultArgs } from '../util/consts';

const ModulesInit = async () => {
  const modules = {};

  await fs
    .readdirSync(__dirname)
    .filter(file => (path.extname(file) === '.js') && (file !== 'index.js'))
    .forEach(async (file) => {
      const module = await require(`./${file}`);
      modules[module.name] = module;
    });

  function getImages(args) {
    const { type } = args;
    if (!modules[type]) return Promise.reject('Module not found!');
    if (!modules[type].getImages) return Promise.reject('Not implemented yet!');
    return (modules[type]).getImages(args);
  }

  function downloadImage({ type, path }, image, index) {          // eslint-disable-line no-shadow
    if (!modules[type]) return Promise.reject('Module not found!');
    if (!modules[type].downloadImage) return Promise.reject('Not implemented yet!');
    return (modules[type]).downloadImage(image, path, index);
  }

  function validateLink(type, link) {
    if (!modules[type]) return Promise.reject('Module not found!');
    if (!modules[type].validateURL) return Promise.reject('Not implemented yet!');
    return (modules[type]).validateURL(link);
  }

  const moduleNames = Object.keys(modules);

  const questions = (args, prefs) =>
    flattenDeep(
      moduleNames.map(key => modules[key].questions(args, prefs)).filter(el => !!el),
    );

  const args = () => {
    const customizer = (objValue, srcValue) => { // eslint-disable-line consistent-return
      if (Array.isArray(objValue)) return union([...objValue, ...srcValue]);
      if (objValue !== null && typeof objValue === 'object' &&
        srcValue !== null && typeof srcValue === 'object') return { ...objValue, ...srcValue };
    };
    const allargs = moduleNames.map(key => modules[key].cliargs).filter(el => !!el);
    return mergeWith({}, defaultArgs, ...allargs, customizer);
  };

  return { getImages, downloadImage, validateLink, moduleNames, modules, questions, args };
};

export default ModulesInit;
