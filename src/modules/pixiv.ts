import co from "co";
import * as flattenDeep from "lodash.flattendeep";
import { extname } from "path";
import * as PixivApi from "pixiv-app-api";
import * as pixivImg from "pixiv-img";

import AServiceSearch from "../types/AServiceSearch";
import { wait } from "../util/functions";

class PixivSearch extends AServiceSearch {
  private pixivApi: PixivApi;
  private authorized = false;

  constructor(options) {
    super(options);

    this.pixivApi = new PixivApi();
  }

  /**
   * Gets links of images from author page
   * @returns Array with images links
   */
  public async getImages(source: string): Promise<string[]> {
    if (!pixivRegExp.test(source)) {
      this.events.emit("error", `Invalid pixiv link`);
      return [];
    }

    const authorID = this.getSourceID(source);
    if (!authorID) {
      this.events.emit("error", `Invalid pixiv link`);
      return [];
    }

    if (!this.authorized) {
      this.authorized = await this.login();

      if (!this.authorized) {
        this.events.emit(
          "error",
          `Pixiv account credentials need! Register, or enter valid credentials!`
        );
        return [];
      }
    }
    this.events.emit("successLogin", {
      username: this.options.username,
      password: this.options.password
    });

    const posts = await Promise.all([
      co(this.getWorks(authorID, "illust")),
      co(this.getWorks(authorID, "manga"))
    ]);

    return flattenDeep(
      flattenDeep(posts).map(el => this.getIllustrUrls(el, this.options.all))
    );
  }

  protected getSourceID(source: string): string | undefined {
    const [, authorID] = pixivRegExp.exec(source) || [undefined, undefined];
    return authorID;
  }

  /**
   * Login into pixiv
   * @returns Succesful login or not
   */
  protected async login(): Promise<boolean> {
    const { username, password } = this.options;

    return this.pixivApi
      .login(username, password)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Downloads image from pixiv url
   * @param url Pixiv image url
   * @param path Path to images folder
   * @param index Index of image
   */
  protected async downloadImage(
    url: string,
    path: string,
    index: number
  ): Promise<void> {
    const file = `${path}/${index}${extname(url)}`;
    try {
      await pixivImg(url, file);
    } catch (e) {
      this.events.emit("error", `Image (${url}) downloading error: ${e}`);
    }
    await wait();

    this.events.emit("imageDownloaded", index);
  }

  /**
   * Gets all posts by type from author profile pages
   * @returns IterableIterator with array of images
   */
  private *getWorks(
    authorID: string,
    type: string
  ): IterableIterator<string[]> {
    let json;
    try {
      json = yield this.pixivApi.userIllusts(authorID, { type });
    } catch (e) {
      this.events.emit("error", `Pixiv request error: ${e}`);
      json = { illusts: [] };
    }
    let results = json.illusts.slice();
    this.events.emit("findImages", results.length);

    while (this.pixivApi.hasNext()) {
      json = yield this.pixivApi.next();
      results = results.concat(json.illusts);
      this.events.emit("findImages", results.length);
    }
    this.events.emit("findImages", results.length);

    return results;
  }

  /**
   * Gets URLs from post
   * @param post Author post object
   * @param all Download all of images? (multipage post)
   * @returns Image from post
   */
  private getIllustrUrls(post, all: boolean): string[] {
    if (post.metaPages && post.metaPages.length > 0) {
      return all
        ? [].concat.apply(
            post.metaPages.map(
              img => img.imageUrls.original || img.imageUrls.large
            )
          )
        : [post.metaPages[0].imageUrls.original];
    }
    return [post.metaSinglePage.originalImageUrl];
  }
}

export default PixivSearch;
export const pixivRegExp = new RegExp(
  /(?:http[s]?:\/\/)?(?:www.)?(?:pixiv.net\/member(?:_illust)?.php\?id=)(\d{1,})/i
);
