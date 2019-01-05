import { pixivRegExp, PixivSearch } from "../../src";

test("init", () => {
  const search = new PixivSearch({});
  expect(search).not.toBeNull();
  expect(search).toBeDefined();
  expect(search instanceof PixivSearch).toBeTruthy();
});

test("login", async () => {
  const search = new PixivSearch({});
  const authorized = await search.login();
  expect(authorized).toBeFalsy();
});

test("login with invalid credentials", async () => {
  const search = new PixivSearch({ username: "username", password: "password" });
  const authorized = await search.login();
  expect(authorized).toBeFalsy();
});

test("login with valid credentials", async () => {
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  const authorized = await search.login();
  expect(authorized).toBeTruthy();
});

test("valid links", async () => {
  expect(pixivRegExp.test("https://www.pixiv.net/member_illust.php?id=10655554")).toBeTruthy();
});

test("invalid links", async () => {
  expect(pixivRegExp.test("https://google.com")).toBeFalsy();
  expect(pixivRegExp.test("https://www.pixiv.nets/member_illust.php?id=10655554")).toBeFalsy();
  expect(pixivRegExp.test("https://twitter.com/genskc")).toBeFalsy();
  expect(pixivRegExp.test("https://www.deviantart.com/kvacm")).toBeFalsy();
});

test("getting images", async () => {
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  const images = await search.getImages("https://www.pixiv.net/member_illust.php?id=10655554");
  expect(Array.isArray(images)).toBeTruthy();
  expect(images.length).toBeGreaterThan(0);
}, 30000);

test("getting images failed", async () => {
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  try {
    await search.getImages("https://www.pixiv.nets/member_illust.php?id=10655554");
  } catch (e) {
    expect(e);
  }
});
