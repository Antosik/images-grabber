import * as inquirer from 'inquirer';
import * as Preferences from 'preferences';
import {IQuestion, IService} from '../modules/serviceTemplate';

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
        process.stdout.write('Searching for pictures...');
        await searcher.getImages();
        process.stdout.write('Downloading pictures...');
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
}

export default AppSession;
