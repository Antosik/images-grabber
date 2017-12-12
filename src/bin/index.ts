#!/usr/bin/env node
import App from "../";
import "../util/exitHandling";

(async () => {
    await App.init(process.argv.slice(2));
})();