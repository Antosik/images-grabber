import {readdirSync} from 'fs';
import {extname, resolve} from 'path';
import {IService} from '../modules/serviceTemplate';
import AppSession from './session';

class App {
    public static modules: Map<string, IService>;
    public static session: AppSession;

    public static async init() {
        App.modules = new Map<string, IService>();
        await App.loadModules();

        App.session = new AppSession(App.modules);
        App.session.start();
    }

    private static async loadModules(): Promise<void> {
        return readdirSync(resolve(__dirname, '../modules'))
            .filter((file) => (extname(file) === '.js') && (file !== 'serviceTemplate.js'))
            .forEach(async (file) => {
                const module: IService = (await require(resolve(__dirname, '../modules', `./${file}`))).default;
                App.modules.set(module.serviceName, module);
            });
    }
}

export default App;
