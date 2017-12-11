#!/usr/bin/env node
import App from "../";

(async () => {
    await App.init(process.argv.slice(2));
})();
