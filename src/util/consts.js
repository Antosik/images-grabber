/* eslint-disable no-useless-escape, import/prefer-default-export */

const URLRegExp = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/ig);

export const isLink = link => URLRegExp.test(link);
