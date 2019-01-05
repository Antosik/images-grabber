import { pixivRegExp, PixivSearch } from "../../src";

test("init", () => {
  expect.assertions(3);
  const search = new PixivSearch({});
  expect(search).not.toBeNull();
  expect(search).toBeDefined();
  expect(search instanceof PixivSearch).toBeTruthy();
});

test("login", async () => {
  expect.assertions(1);
  const search = new PixivSearch({});
  const authorized = await search.login();
  expect(authorized).toBeFalsy();
});

test("login with invalid credentials", async () => {
  expect.assertions(1);
  const search = new PixivSearch({ username: "username", password: "password" });
  const authorized = await search.login();
  expect(authorized).toBeFalsy();
});

test("login with valid credentials", async () => {
  expect.assertions(1);
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  const authorized = await search.login();
  expect(authorized).toBeTruthy();
}, 60000);

test("valid links", async () => {
  expect.assertions(1);
  expect(pixivRegExp.test("https://www.pixiv.net/member_illust.php?id=10655554")).toBeTruthy();
});

test("invalid links", async () => {
  expect.assertions(4);
  expect(pixivRegExp.test("https://google.com")).toBeFalsy();
  expect(pixivRegExp.test("https://www.pixiv.nets/member_illust.php?id=10655554")).toBeFalsy();
  expect(pixivRegExp.test("https://twitter.com/genskc")).toBeFalsy();
  expect(pixivRegExp.test("https://www.deviantart.com/kvacm")).toBeFalsy();
});

test("getting images", async () => {
  expect.assertions(2);
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  const images = await search.getImages("https://www.pixiv.net/member_illust.php?id=10655554");
  expect(Array.isArray(images)).toBeTruthy();
  expect(images.length).toBeGreaterThan(0);
}, 60000);

test("getting images failed", async () => {
  expect.assertions(1);
  const search = new PixivSearch({ username: process.env.PIXIV_USERNAME, password: process.env.PIXIV_PASSWORD });
  try {
    await search.getImages("https://www.pixiv.nets/member_illust.php?id=10655554");
  } catch (e) {
    expect(e.message).toMatch(/Invalid pixiv link/);
  }
});
