import * as bluebirdPromise from "bluebird";
import { EventEmitter } from "events";
import { Questions } from "inquirer";

import { createDir, directoryExists } from "../util/functions";

export enum QuestionTypes {
    list = "list",
    confirm = "confirm",
    input = "input",
    password = "password",
}

export interface IService {
    serviceName: string;
    serviceLink: string;
    questions: Questions;

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

    public constructor(public data: string, options: any = { path: "images", all: true }) {
        this.resource = data.trim();
        this.options = options;
        this.filepath = options.path || "images";
        this.events = new EventEmitter();
        this.images = [];
    }

    public async login?(username: string, password): Promise<boolean>;
    public abstract async getImages(): Promise<string[]>;
    public abstract async downloadImage(url: string,  index: number): Promise<void>;
    public async downloadImages(): Promise<void> {
        const isDirExist = await directoryExists(this.filepath);
        if (!isDirExist) {
            await createDir(this.filepath);
        }
        bluebirdPromise
            .resolve(this.images)
            .map(async (url, index) => {
                await this.downloadImage(url, index);
            }, { concurrency: 5 });
        return;
    }
}
