import * as inquirer from 'inquirer';
import * as Preferences from 'preferences';
import {IQuestion, IService, IServiceSearch} from '../modules/serviceTemplate';

const isWindows = /^win/.test(process.platform);

class AppSession {
    private modules: Map<string, IService>;
    private prefs: Preferences;

    constructor(services: Map<string, IService>) {
        this.modules = services;
        this.prefs = new Preferences('images-grabber');
    }

    public async start() {
        const answers = await this.renderQuestions();
        const searcher = (this.getModuleSearch(answers.type))(answers.link, answers);
        this.handleSearcherEvents(searcher);
        if (answers.username) {
            answers[`${answers.type}Username`] = answers.username;
        }
        if (answers.password) {
            answers[`${answers.type}Password`] = answers.password;
        }
        process.stdout.write('Searching for pictures...\n');
        await searcher.getImages();
        process.stdout.write('\nDownloading pictures...\n');
        await searcher.downloadImages();
    }

    private async renderQuestions() {
        const modulesQuestion = this.selectModulesValues();
        let answers = {...this.prefs};

        const answerType = await inquirer.prompt([{
            choices: modulesQuestion,
            message: 'Select service',
            name: 'type',
            type: isWindows ? 'rawlist' : 'list',
        }], answers);
        answers = {...answerType, ...answers};

        const answersModule = await inquirer.prompt(
            this.getModuleQuestions(answerType.type), answers,
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
        searcher.events.on('successLogin', (username, password) => {
            this.prefs[`${searcher.service}Username`] = username;
            this.prefs[`${searcher.service}Password`] = password;
        });

        let downloaded = 0;
        let count = 0;
        searcher.events.on('imageDownloaded', () => {
            downloaded++;
            process.stdout.write(`Images downloaded: ${downloaded}/${count}\n`);
        });

        searcher.events.on('findImages', (imagesFound) => {
            count = imagesFound;
            process.stdout.write(`Images found: ${imagesFound}\n`);
        });

        searcher.events.on('error', (error) => {
            process.stdout.write(`Error: ${error}\n`);
        });
    }
}

export default AppSession;
