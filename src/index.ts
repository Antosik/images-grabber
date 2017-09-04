import App from './app/app';

(async () => {
    await App.init(process.argv.slice(2));
})();
