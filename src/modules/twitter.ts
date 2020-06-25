import co from "co";
import { extname } from "path";
import { URL } from "url";

import AServiceSearch from "../types/AServiceSearch";
import { req, wait, writeBuffer } from "../util/functions";

class TwitterSearch extends AServiceSearch {
  private guest_token = '';
  private readonly auth_token = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

  constructor(options: any) {
    super(options);
  }

  private get authorized(): boolean {
    return this.guest_token !== '';
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

    if (!this.authorized) {
      await this.login();

      if (!this.authorized) {
        this.events.emit(
          "error",
          `Twitter search errorred!`
        );
        return [];
      }
    }

    const authorTwitterID = await this.getSourceTwitterID(authorID);

    if (authorTwitterID === undefined) {
      this.events.emit(
        "error",
        `Twitter search errorred!`
      );
      return [];
    }

    return co(this.getIllusts(authorTwitterID));
  }

  /**
   * Downloads image from pixiv url
   * @param url Pixiv image url
   * @param path Path to images folder
   * @param index Index of image
   */
  public async downloadImage(url: string, path: string, index: number): Promise<void> {
    const pathname = new URL(url).pathname;
    const file = `${path}/${index}${extname(pathname)}`;

    await req(`${url}:orig`, { responseType: "arraybuffer" })
      .then(({ data }) => writeBuffer(file, data))
      .catch(e =>
        this.events.emit("error", `Image (${url}) downloading error: ${e}`)
      );
    await wait();

    this.events.emit("imageDownloaded", index);
  }

  public async login(): Promise<boolean> {
    const response = await req("https://twitter.com/twitter");
    const gt_cookie = response.headers['set-cookie']?.find(cookie => cookie.includes('gt='));

    if (gt_cookie !== undefined) {
      const regexpresult = /gt=(\d+)/.exec(gt_cookie);

      if (regexpresult !== null && !Number.isNaN(Number(regexpresult[1]))) {
        this.guest_token = regexpresult[1];

        return true;
      }
    }

    return false;
  }

  protected getSourceID(source: string): string | undefined {
    const [, authorID] = twitterRegExp.exec(source) || [undefined, undefined];
    return authorID;
  }

  private async getSourceTwitterID(authorID: string): Promise<string | undefined> {
    const params = encodeURIComponent(JSON.stringify({ screen_name: authorID, withHighlightedLabel: true }));
    const url = `https://api.twitter.com/graphql/-xfUfZsnR_zqjFd-IfrN5A/UserByScreenName?variables=${params}`;

    const { data } = await req(url, {
      headers: {
        authorization: `Bearer ${this.auth_token}`
      }
    });

    return data?.data?.user?.rest_id;
  }

  private async mediaReq(authorTwitterID: string, cursor = ""): Promise<Record<string, any>> {
    return req(
      `https://api.twitter.com/2/timeline/media/${authorTwitterID}.json?${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
      {
        headers: {
          authorization: `Bearer ${this.auth_token}`,
          'x-guest-token': this.guest_token
        },
      }
    )
      .then(({ data }) => data)
      .catch(err => {
        this.events.emit("error", `    Twitter request error: ${err}`);
        return {};
      });
  }

  private getMedia(json: Record<string, any>): string[] {
    const tweets = json?.globalObjects?.tweets ?? {};

    const results: string[] = [];

    for (const tweet of Object.values<Record<string, any>>(tweets)) {
      if (tweet?.possibly_sensitive === true && !this.options.unsafe) {
        continue;
      }

      const media = tweet?.entities?.media ?? [];

      for (const item of media) {
        if (item?.media_url_https !== undefined) {
          results.push(item.media_url_https);
        } else if (item?.media_url !== undefined) {
          results.push(item.media_url);
        }
      }
    }

    return results;
  }

  private getCursor(json: Record<string, any>): string | undefined {
    const instructions: Array<Record<string, any>> = json?.timeline?.instructions ?? [];
    if (instructions.length === 0) {
      return;
    }

    const entries: Array<Record<string, any>> = instructions.find(el => "addEntries" in el)?.addEntries?.entries ?? [];
    if (entries.length === 0) {
      return;
    }

    const cursorEntry = entries.find(entry => entry?.content?.operation?.cursor?.cursorType === "Bottom");
    return cursorEntry?.content?.operation?.cursor?.value;
  }

  private *getIllusts(authorTwitterID: string) {
    let results: string[] = [];

    let json = yield this.mediaReq(authorTwitterID);
    let images = this.getMedia(json);

    let cursor = this.getCursor(json);
    let prevCursor;

    results = results.concat(images);
    this.events.emit("findImages", results.length);

    while (cursor !== prevCursor) {
      json = yield this.mediaReq(authorTwitterID, cursor);
      images = this.getMedia(json);

      prevCursor = cursor;
      cursor = this.getCursor(json);

      results = results.concat(images);

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
