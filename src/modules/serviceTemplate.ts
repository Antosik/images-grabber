import * as bluebirdPromise from 'bluebird';
import { EventEmitter } from 'events';
import { createDir, directoryExists } from '../util/functions';

export enum IQuestionTypes {
    list = 'list',
    confirm = 'confirm',
    input = 'input',
    password = 'password',
}

export interface IQuestion {
    name: string;
    type: IQuestionTypes;
    message: any;
    when?(answers: any): boolean;
    validate?(input: string, hash: any): boolean;
}

export interface IService {
    serviceName: string;
    serviceLink: string;
    questions: IQuestion[];

    regExpLink?: RegExp;
    validateLink?(link: string): boolean;
    search(link: string, options: any): IServiceSearch;
}

export abstract class IServiceSearch {
    public resource: string;
    public filepath: string;
    public events: EventEmitter;
    public options: any;
    public service: string;

    public images: string[];

    public constructor(public data: string, options: any = { path: 'images', all: true }) {
        this.resource = data;
        this.options = options;
        this.filepath = options.path || 'images';
        this.events = new EventEmitter();
        this.images = [];
    }

    public async login?(username: string, password): Promise<boolean>;
    public abstract async getImages(): Promise<string[]>;
    public abstract async downloadImage(url: string,  index: number): Promise<void>;
    public async downloadImages(): Promise<void> {
        if (!directoryExists(this.filepath)) {
            createDir(this.filepath);
        }
        bluebirdPromise
            .resolve(this.images)
            .map(async (url, index) => {
                await this.downloadImage(url, index);
            }, { concurrency: 5 });
        return;
    }
}
