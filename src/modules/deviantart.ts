import co from "co";
import { extname } from "path";
import { promisify } from "util";
import * as xml2js from "xml2js";

import AServiceSearch from "../types/AServiceSearch";
import { req, wait, writeBuffer } from "../util/functions";

class DeviantartSearch extends AServiceSearch {
  private readonly parser: xml2js.Parser;
  private readonly parseXML;

  constructor(options) {
    super(options);
    this.parser = new xml2js.Parser();
    this.parseXML = promisify(this.parser.parseString);
  }

  /**
   * Gets links of images from author page
   * @returns links of images
   */
  public async getImages(source: string): Promise<string[]> {
    if (!deviantartRegExp.test(source)) {
      this.events.emit("error", `Invalid deviantart link`);
      return [];
    }

    const authorID = this.getSourceID(source);
    if (!authorID) {
      this.events.emit("error", `Invalid deviantart link`);
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
    const [, authorID] = deviantartRegExp.exec(source) || [
      undefined,
      undefined
    ];
    return authorID;
  }

  private mediaReq(authorID: string, offset = 0): Promise<string> {
    return req(
      `https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A${authorID}+sort%3Atime+meta%3Aall&offset=${offset}`
    ).catch(err => {
      this.events.emit("error", `DeviantArt request error: ${err}`);
      return "";
    });
  }

  private getMedia(json): string[] {
    const { unsafe } = this.options;
    return json.rss.channel[0].item
      .map(el => {
        if (el["media:rating"][0] === "adult") {
          if (unsafe) {
            return el["media:content"][0].$;
          }
          return;
        }
        return el["media:content"][0].$;
      })
      .filter(el => el && el.medium === "image")
      .map(el => el.url);
  }

  private hasNextPage(json): boolean {
    return (
      (!!json.rss.channel[0]["atom:link"][1] &&
        json.rss.channel[0]["atom:link"][1].$.rel === "next") ||
      (!!json.rss.channel[0]["atom:link"][2] &&
        json.rss.channel[0]["atom:link"][2].$.rel === "next")
    );
  }

  private getImagesCount(json): number {
    return json.rss.channel[0].item.length;
  }

  private async getPage(authorID: string, offset = 0) {
    const xml = await this.mediaReq(authorID, offset);
    const data = await this.parseXML(xml);

    const nextPage = this.hasNextPage(data);
    const count = this.getImagesCount(data) || 0;
    const images = this.getMedia(data) || [];

    return { nextPage, count, images };
  }

  private *getIllusts(authorID: string) {
    let json = yield this.getPage(authorID);
    let count = json.count;
    let results = json.images;
    this.events.emit("findImages", results.length);

    while (json.nextPage) {
      json = yield this.getPage(authorID, count);
      count += json.count;
      results = results.concat(json.images);
      this.events.emit("findImages", results.length);
    }
    this.events.emit("findImages", results.length);

    return results;
  }
}

export default DeviantartSearch;
export const deviantartRegExp = new RegExp(
  /(?:http[s]?:\/\/)?(?:www.)?(?:.deviantart.com)\/(.{1,})/i
);
