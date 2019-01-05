import { deviantartRegExp, DeviantartSearch } from "../../src/";

test("init", () => {
  const search = new DeviantartSearch({});
  expect(search).not.toBeNull();
  expect(search).toBeDefined();
  expect(search instanceof DeviantartSearch).toBeTruthy();
});

test("login", async () => {
  const search = new DeviantartSearch({});
  const authorized = await search.login();
  expect(authorized).toBeTruthy();
});

test("valid links", async () => {
  expect(
    deviantartRegExp.test("https://www.deviantart.com/kvacm")
  ).toBeTruthy();
});

test("invalid links", async () => {
  expect(deviantartRegExp.test("https://google.com")).toBeFalsy();
  expect(
    deviantartRegExp.test("https://www.pixiv.net/member_illust.php?id=10655554")
  ).toBeFalsy();
  expect(deviantartRegExp.test("https://twitter.com/genskc")).toBeFalsy();
  expect(
    deviantartRegExp.test("https://www.deviantart.coms/kvacm")
  ).toBeFalsy();
});

test("getting images", async () => {
  const search = new DeviantartSearch({});
  const images = await search.getImages("https://www.deviantart.com/kvacm");
  expect(Array.isArray(images)).toBeTruthy();
  expect(images.length).toBeGreaterThan(0);
}, 60000);

test("getting images failed", async () => {
  const search = new DeviantartSearch({});
  try {
    await search.getImages("https://www.deviantart.coms/kvacm");
  } catch (e) {
    expect(e);
  }
});
