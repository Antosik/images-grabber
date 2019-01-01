import { Progress, Spinner } from "clui";
import * as inquirer from "inquirer";
import Preferences = require("preferences");

import { IService, IServiceSearch } from "../modules/serviceTemplate";

const isWindows = /^win/.test(process.platform);

class AppSession {
  private modules: Map<string, IService>;
  private prefs: Preferences;
  private args: any;
  private spinner: Spinner;
  private progress: Progress;

  constructor(services: Map<string, IService>, argument: any = {}) {
    this.modules = services;
    this.prefs = new Preferences("images-grabber");
    this.args = argument;
  }

  public async start() {
    // Get answers
    const answers = await this.renderQuestions();

    // Run searcher & handle events
    const searcher = this.getModuleSearch(answers.type)(answers.link, answers);
    this.handleSearcherEvents(searcher);

    // Pictures searching UI
    process.stdout.write("  Searching for pictures...\n");
    this.spinner = new Spinner("Images found: 0");
    this.spinner.start();
    try {
      await searcher.getImages();
    } catch {
      searcher.images = [];
      process.stderr.write(
        `  Got an error. Please write about it there → https://github.com/Antosik/images-grabber/issues`
      );
    }
    this.spinner.stop();
    process.stdout.write(
      `  Found images in total: ${searcher.images.length}\n`
    );
    searcher.events.emit("findImages", searcher.images.length);

    // Pictures downloading UI
    this.progress = new Progress(20);
    process.stdout.write("\n  Starting downloading pictures...\n");

    try {
      await searcher.downloadImages();
    } catch {
      process.stderr.write(
        `  Got an error. Please write about it there → https://github.com/Antosik/images-grabber/issues`
      );
    }
  }

  /**
   * Show questions (returns answers)
   */
  private async renderQuestions(): Promise<any> {
    const modulesQuestion = this.getModulesNames();
    let answers = { ...this.prefs, ...this.args };

    // Show general questions
    const answerType = await inquirer.prompt(
      [
        {
          choices: modulesQuestion,
          message: "Select service",
          name: "type",
          type: isWindows ? "rawlist" : "list",
          when: (answer: any) => !answer.type
        }
      ],
      answers
    );
    if (answers.username) {
      answers[`${answers.type}Username`] = answers.username;
    }
    if (answers.password) {
      answers[`${answers.type}Password`] = answers.password;
    }
    answers = { ...answerType, ...answers };

    console.log(this.getModuleQuestions(answers.type));

    // Show module-related questions
    const answersModule = await inquirer.prompt(
      this.getModuleQuestions(answers.type),
      answers
    );

    return { ...answersModule, ...answers };
  }

  /**
   * Get modules names (1st question)
   */
  private getModulesNames(): { name: string; value: string }[] {
    const moduleNames: ({ name: string; value: string }[]) = [];

    for (const [name] of this.modules) {
      moduleNames.push({
        name,
        value: name
      });
    }

    return moduleNames;
  }

  /**
   * Get questions of selected module
   * @param moduleName Name of module
   * @returns {inquirer.Questions} Module's questions
   */
  private getModuleQuestions(moduleName: string): inquirer.Questions {
    return this.modules.get(moduleName).questions;
  }

  /**
   * Get search class of selected module
   * @param moduleName Name of module
   */
  private getModuleSearch(moduleName: string): IService["search"] {
    return this.modules.get(moduleName).search;
  }

  /**
   * Handle events of searching/downloading
   * @param searcher Search object
   */
  private handleSearcherEvents(searcher: IServiceSearch): void {
    const self = this;

    searcher.events.on("successLogin", credentials => {
      process.stdout.write(
        `            Successfully entered as ${credentials.username}`
      );
      this.prefs[`${searcher.service}Username`] = credentials.username;
      this.prefs[`${searcher.service}Password`] = credentials.password;
    });

    let downloaded = 0;
    let count = 0;
    searcher.events.on("imageDownloaded", () => {
      downloaded++;
      process.stdout.write("\r\x1b[K");
      // tslint:disable-next-line max-line-length
      process.stdout.write(
        `  Downloading pictures: ${self.progress.update(
          downloaded / count
        )} (${downloaded}/${count})`
      );
    });

    searcher.events.on("findImages", imagesFound => {
      count = imagesFound;
      this.spinner.message(`Images found: ${imagesFound}`);
    });

    searcher.events.on("error", error => {
      process.stdout.write(`  Error: ${error}\n`);
    });
  }
}

export default AppSession;
