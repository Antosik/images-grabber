import { Progress, Spinner } from "clui";
import * as inquirer from "inquirer";
import * as Preferences from "preferences";
import { IQuestion, IService, IServiceSearch } from "../modules/serviceTemplate";

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
        const answers = await this.renderQuestions();
        const searcher = (this.getModuleSearch(answers.type))(answers.link, answers);
        this.handleSearcherEvents(searcher);

        process.stdout.write("  Searching for pictures...\n");
        this.spinner = new Spinner("Images found: 0");
        this.spinner.start();
        await searcher.getImages();
        this.spinner.stop();
        process.stdout.write(`  Found images in total: ${searcher.images.length}\n`);
        searcher.events.emit("findImages", searcher.images.length);

        this.progress = new Progress(20);
        process.stdout.write("\n  Starting downloading pictures...\n");
        await searcher.downloadImages();
    }

    private async renderQuestions() {
        const modulesQuestion = this.selectModulesValues();
        let answers = {...this.prefs, ...this.args};

        const answerType = await inquirer.prompt([
            {
                choices: modulesQuestion,
                message: "Select service",
                name: "type",
                type: isWindows ? "rawlist" : "list",
                when: (answer) => !answer.type,
            },
        ], answers);
        if (answers.username) {
            answers[`${answers.type}Username`] = answers.username;
        }
        if (answers.password) {
            answers[`${answers.type}Password`] = answers.password;
        }
        answers = {...answerType, ...answers};

        const answersModule = await inquirer.prompt(
            this.getModuleQuestions(answers.type), answers,
        );
        return {...answersModule, ...answers};
    }

    private selectModulesValues() {
        const moduleNames = [];
        for (const [name] of this.modules) {
            moduleNames.push({
                name,
                value: name,
            });
        }
        return moduleNames;
    }

    private getModuleQuestions(moduleName: string): IQuestion[] {
        return this.modules.get(moduleName).questions;
    }

    private getModuleSearch(moduleName: string) {
        return this.modules.get(moduleName).search;
    }

    private handleSearcherEvents(searcher: IServiceSearch) {
        const self = this;

        searcher.events.on("successLogin", (credentials) => {
            process.stdout.write(`            Successfully entered as ${credentials.username}`);
            this.prefs[`${searcher.service}Username`] = credentials.username;
            this.prefs[`${searcher.service}Password`] = credentials.password;
        });

        let downloaded = 0;
        let count = 0;
        searcher.events.on("imageDownloaded", () => {
            downloaded++;
            process.stdout.write("\r\x1b[K");
            // tslint:disable-next-line max-line-length
            process.stdout.write(`  Downloading pictures: ${self.progress.update(downloaded / count)} (${downloaded}/${count})`);
        });

        searcher.events.on("findImages", (imagesFound) => {
            count = imagesFound;
            this.spinner.message(`Images found: ${imagesFound}`);
        });

        searcher.events.on("error", (error) => {
            process.stdout.write(`Error: ${error}\n`);
        });
    }
}

export default AppSession;
