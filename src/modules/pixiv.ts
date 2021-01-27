import co from "co";
import flattenDeep from "lodash.flattendeep";
import { extname } from "path";
import PixivApi from "pixiv-app-api";
import pixivImg from "pixiv-img";
import { URL } from "url";

import AServiceSearch from "../types/AServiceSearch";
import { wait } from "../util/functions";

class PixivSearch extends AServiceSearch {
  private readonly pixivApi: PixivApi;
  private authorized = false;

  constructor(options) {
    super(options);

    this.pixivApi = new PixivApi('', '');
  }

  /**
   * Gets links of images from author page
   * @returns Array with images links
   */
  public async getImages(source: string): Promise<string[]> {
    let posts = [];

    if (!pixivRegExp.test(source)) {
      this.events.emit("error", `Invalid pixiv link`);
      return posts;
    }

    const [sourceType, sourceID] = this.getSource(source);
    if (!sourceID) {
      this.events.emit("error", `Invalid pixiv link`);
      return posts;
    }

    if (!this.authorized) {
      await this.login();

      if (!this.authorized) {
        this.events.emit(
          "error",
          `Pixiv account credentials need! Register, or enter valid credentials!`
        );
        return posts;
      }
    }
    this.events.emit("successLogin", {
      username: this.options.username,
      password: this.options.password
    });

    switch (sourceType) {
      case 'artworks': {
        posts = await this.getWork(sourceID);
        break;
      }
      case 'users': {
        posts = await Promise.all([
          co(this.getWorks(sourceID, "illust")),
          co(this.getWorks(sourceID, "manga"))
        ]);
        break;
      }
      default: {
        this.events.emit(
          "error",
          `Unsupported source type ${sourceType}`
        );
        return posts;
      }
    }

    return flattenDeep(
      flattenDeep(posts).map(el => this.getIllustrUrls(el, this.options.all)).filter(Boolean)
    );
  }

  /**
   * Login into pixiv
   * @returns Succesful login or not
   */
  public async login(): Promise<boolean> {
    const { username, password } = this.options;

    return this.pixivApi
      .login(username, password)
      .then(() => (this.authorized = true))
      .catch(() => (this.authorized = false));
  }

  protected getSource(source: string): [?string, ?number] {
    const [sourceType, sourceID] = pixivRegExp.exec(source) || [undefined, undefined];

    return [sourceType, Number(sourceID)];
  }

  protected getSourceID(source: string): string | undefined {
    const [_, sourceID] = pixivRegExp.exec(source) || [undefined, undefined];

    return sourceID;
  }

  /**
   * Downloads image from pixiv url
   * @param url Pixiv image url
   * @param path Path to images folder
   * @param index Index of image
   */
  protected async downloadImage(url: string, path: string, index: number): Promise<void> {
    const pathname = new URL(url).pathname;
    const file = `${path}/${index}${extname(pathname)}`;

    try {
      await pixivImg(url, file);
    } catch (e) {
      this.events.emit("error", `Image (${url}) downloading error: ${e}`);
    }
    await wait();

    this.events.emit("imageDownloaded", index);
  }

  /**
   * Gets post from its page
   * @returns Promise with array of one image
   */
  private getWork(artworkID: number): Promise<any> {
    let json: any;

    try {
      json = yield this.pixivApi.illustDetail(artworkID) as Promise<any>;
    } catch (e) {
      this.events.emit("error", `Pixiv request error: ${e}`);
      json = { illust: null };
    }

    let results = [json.illust];
    this.events.emit("findImages", results.length);

    return results;
  }

  /**
   * Gets all posts by type from author profile pages
   * @returns IterableIterator with array of images
   */
  private *getWorks(authorID: number, type: string): IterableIterator<any> {
    let json: any;

    try {
      json = yield this.pixivApi.userIllusts(authorID, { type }) as Promise<any>;
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
            img => img?.imageUrls?.original || img?.imageUrls?.large
          )
        )
        : [post?.metaPages[0]?.imageUrls?.original];
    }

    return [post?.metaSinglePage?.originalImageUrl];
  }
}

export default PixivSearch;
export const pixivRegExp = new RegExp(
  /(?:http[s]?:\/\/)?(?:www.)?(?:pixiv.net\/\w+\/)?(\w+)\/(\d+)/i
);
