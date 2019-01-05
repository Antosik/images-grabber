import BigNumber from "bignumber.js";
import * as cheerio from "cheerio";
import co from "co";
import { extname } from "path";

import AServiceSearch from "../types/AServiceSearch";
import { req, wait, writeBuffer } from "../util/functions";

BigNumber.config({ DECIMAL_PLACES: 40 });

class TwitterSearch extends AServiceSearch {
  constructor(options: any) {
    super(options);
  }

  /**
   * Gets links of images from author page
   * @returns links of images
   */
  public async getImages(source: string): Promise<string[]> {
    if (!twitterRegExp.test(source)) {
      this.events.emit("error", `Invalid twitter link`);
      return [];
    }

    const authorID = this.getSourceID(source);
    if (!authorID) {
      this.events.emit("error", `Invalid twitter link`);
      return [];
    }
    return co(this.getIllusts(authorID));
  }

  /**
   * Downloads image from pixiv url
   * @param url Pixiv image url
   * @param path Path to images folder
   * @param index Index of image
   */
  public async downloadImage(
    url: string,
    path: string,
    index: number
  ): Promise<void> {
    const file = `${path}/${index}${extname(url)}`;

    await req(url, { encoding: null }) // tslint:disable-line no-null-keyword
      .then(data => writeBuffer(file, data))
      .catch(e =>
        this.events.emit("error", `Image (${url}) downloading error: ${e}`)
      );
    await wait();

    this.events.emit("imageDownloaded", index);
  }

  public async login(): Promise<boolean> {
    return Promise.resolve(true);
  }

  protected getSourceID(source: string): string | undefined {
    const [, authorID] = twitterRegExp.exec(source) || [undefined, undefined];
    return authorID;
  }

  private mediaReq(authorID: string, param = "") {
    return req(
      `https://twitter.com/i/profiles/show/${authorID}/media_timeline${param}`,
      { json: true }
    ).catch(err => {
      this.events.emit("error", `    Twitter request error: ${err}`);
      return {
        has_more_items: false,
        items_html: ""
      };
    });
  }

  private getMedia(html: string): string[] {
    const $ = cheerio.load(html);
    const { unsafe } = this.options;

    return $(".AdaptiveMedia-photoContainer")
      .map((_, el) => {
        if ($(this).closest("[data-possibly-sensitive=true]").length) {
          if (unsafe) {
            return $(el).data("image-url");
          }
          return null;
        }
        return $(el).data("image-url");
      })
      .get()
      .filter(img => !!img);
  }

  private getParam(html: string): string {
    const $ = cheerio.load(html);
    const cxtId = $(".tweet")
      .last()
      .data("tweet-id");
    const big = new BigNumber(cxtId);
    const maxId = big.minus(1).toFixed(0);

    return `?last_note_ts=${cxtId}&max_position=${maxId}`;
  }

  private *getIllusts(authorID: string) {
    let json = yield this.mediaReq(authorID);
    let html = json.items_html;
    let results = this.getMedia(html);
    this.events.emit("findImages", results.length);

    while (json.has_more_items) {
      json = yield this.mediaReq(authorID, this.getParam(html));
      html = json.items_html;
      results = results.concat(this.getMedia(html));
      this.events.emit("findImages", results.length);
    }
    this.events.emit("findImages", results.length);

    return results;
  }
}

export default TwitterSearch;
export const twitterRegExp = new RegExp(
  /(?:http[s]?:\/\/)?(?:www.)?(?:twitter.com\/)(\w{1,})/i
);
