import BigNumber from "bignumber.js";
import * as cheerio from "cheerio";
import co from "co";
import { Question } from "inquirer";
import { writeFileSync } from "fs";
import { basename, extname } from "path";

import { req, wait, writeBuffer } from "../util/functions";
import { QuestionTypes, IService, IServiceSearch } from "./serviceTemplate";

BigNumber.config({DECIMAL_PLACES: 40, ERRORS: false});

class TwitterSearch extends IServiceSearch {
    public authorID: string;

    constructor(public data: string, options: any) {
        super(data, options);
        this.authorID = basename(this.resource);
        this.service = twitter.serviceName;
    }

    /**
     * Gets links of images from author page
     * @returns {Promise<string[]>}
     */
    public async getImages(): Promise<string[]> {
        this.images = await co(this.getIllusts());
        return this.images;
    }

    /**
     * Downloads image from pixiv url
     * @param {string} url
     * @param {number} index
     * @returns {Promise<void>}
     */
    public async downloadImage(url: string, index: number): Promise<void> {
        const file = `${this.filepath}/${index}${extname(url)}`;

        await req(url, {encoding: null})  // tslint:disable-line no-null-keyword
            .then(data => writeBuffer(file, data))
            .catch(e => this.events.emit("error", `Image (${url}) downloading error: ${e}`));
        await wait();

        this.events.emit("imageDownloaded", index);
    }

    private mediaReq(param: string = "") {
        return req(`https://twitter.com/i/profiles/show/${this.authorID}/media_timeline${param}`, {json: true})
            .catch((err) => {
                this.events.emit("error", `    Twitter request error: ${err}`);
                return {
                    has_more_items: false,
                    items_html: "",
                };
            });
    }

    private getMedia(html: string): string[] {
        const $ = cheerio.load(html);
        const {unsafe} = this.options;

        return $(".AdaptiveMedia-photoContainer").map((i, el) => {
            if ($(this).closest("[data-possibly-sensitive=true]").length) {
                if (unsafe) {
                    return $(el).data("image-url");
                }
                return undefined;
            }
            return $(el).data("image-url");
        }).get().filter((img) => !!img);
    }

    private getParam(html: string): string {
        const $ = cheerio.load(html);
        const cxtId = $(".tweet").last().data("tweet-id");
        const big = new BigNumber(cxtId);
        const maxId = big.minus(1).toFixed(0);

        return `?last_note_ts=${cxtId}&max_position=${maxId}`;
    }

    private * getIllusts() {
        let json = yield this.mediaReq();
        let html = json.items_html;
        let results = this.getMedia(html);
        this.events.emit("findImages", results.length);

        while (json.has_more_items) {
            json = yield this.mediaReq(this.getParam(html));
            html = json.items_html;
            results = results.concat(this.getMedia(html));
            this.events.emit("findImages", results.length);
        }
        this.events.emit("findImages", results.length);

        return results;
    }
}

const twitter: IService = {
    questions:
        [
            {
                message: "Enter link to user whose pictures you want to grab (like https://twitter.com/kamindani):",
                name: "link",
                type: QuestionTypes.input,
                validate(value) {
                    if (value.length && twitter.validateLink(value)) {
                        return true;
                    }
                    return "Please enter valid link";
                },
                when: (answers) =>
                    answers.type === twitter.serviceName && !answers.link,
            } as Question,
            {
                message: "Do you want to grab unsafe pictures?",
                name: "unsafe",
                type: QuestionTypes.confirm,
                when: (answers) =>
                    answers.type === twitter.serviceName && answers.unsafe === undefined,
            } as Question,
        ],
    regExpLink: new RegExp(/(?:(?:http|https)(?::\/\/))?(?:www.)?(?:twitter.com\/)(\w{1,})/i),
    search: (link: string, options: any) => new TwitterSearch(link, options),
    serviceLink: "https://twitter.com",
    serviceName: "twitter",
    validateLink: (link) => twitter.regExpLink.test(link),
};

export { twitter as default , TwitterSearch as search };
