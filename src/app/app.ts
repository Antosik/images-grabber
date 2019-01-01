import * as minimist from "minimist";
import { extname, resolve } from "path";

import { IService } from "../modules/serviceTemplate";
import { readDir } from "../util/functions";

import AppSession from "./session";

class App {
  public static modules: Map<string, IService>;
  public static session: AppSession;

  /**
   * Init main App
   * @param argument CLI arguments
   */
  public static async init(argument: string[]) {
    App.modules = new Map<string, IService>();
    await App.loadModules();
    const args = App.getArgs(argument);

    App.session = new AppSession(App.modules, args);
    App.session.start();
  }

  /**
   * Load modules
   */
  private static async loadModules(): Promise<void> {
    const moduleFiles = await readDir(resolve(__dirname, "../modules"));

    return moduleFiles
      .filter(file => extname(file) === ".js" && file !== "serviceTemplate.js")
      .forEach(async file => {
        try {
          const module: IService = (await require(resolve(
            __dirname,
            "../modules",
            `./${file}`
          ))).default;
          App.modules.set(module.serviceName, module);
        } catch {}
      });
  }

  /**
   * Get parsed CLI arguments
   * @param args CLI arguments
   */
  private static getArgs(args: string[]): any {
    const parsedArgs = minimist(args, {
      alias: {
        path: "p",
        unsafe: "u"
      },
      default: {
        path: "images"
      },
      string: ["path", "username", "password"]
    });

    if (parsedArgs._.length) {
      let type = "";
      const link = parsedArgs._[0];

      App.modules.forEach(module => {
        if (module.validateLink(link)) {
          type = module.serviceName;
        }
      });

      if (!type) {
        return { ...parsedArgs };
      }
      return { ...parsedArgs, type, link };
    }
    return { ...parsedArgs };
  }
}

export default App;
