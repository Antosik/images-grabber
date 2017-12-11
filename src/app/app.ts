import { readdirSync } from "fs";
import * as minimist from "minimist";
import { extname, resolve } from "path";

import { IService } from "../modules/serviceTemplate";
import AppSession from "./session";

class App {
    public static modules: Map<string, IService>;
    public static session: AppSession;

    public static async init(argument: string[]) {
        App.modules = new Map<string, IService>();
        await App.loadModules();
        const args = App.getArgs(argument);

        App.session = new AppSession(App.modules, args);
        App.session.start();
    }

    private static async loadModules(): Promise<void> {
        return readdirSync(resolve(__dirname, "../modules"))
            .filter((file) => (extname(file) === ".js") && (file !== "serviceTemplate.js"))
            .forEach(async (file) => {
                const module: IService = (await require(resolve(__dirname, "../modules", `./${file}`))).default;
                App.modules.set(module.serviceName, module);
            });
    }

    private static getArgs(args: string[]): any {
        const parsedArgs = minimist(args, {
            alias: {
                path: "p",
                unsafe: "u",
            },
            boolean: ["unsafe"],
            default: {
                path: "images",
                unsafe: false,
            },
            string: ["path", "username", "pssword"],
        });
        if (parsedArgs._.length) {
            let type = "";
            const link = parsedArgs._[0];
            App.modules.forEach((module) => {
                if (module.validateLink(link)) {
                    type = module.serviceName;
                }
            });

            if (!type) {
                return {...parsedArgs};
            }
            return {...parsedArgs, type, link};
        }
        return {...parsedArgs};
    }
}

export default App;
