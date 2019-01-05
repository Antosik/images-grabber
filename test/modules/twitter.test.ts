import { twitterRegExp, TwitterSearch } from "../../src";

test("init", () => {
  const search = new TwitterSearch({});
  expect(search).not.toBeNull();
  expect(search).toBeDefined();
  expect(search instanceof TwitterSearch).toBeTruthy();
});

test("login", async () => {
  const search = new TwitterSearch({});
  const authorized = await search.login();
  expect(authorized).toBeTruthy();
});

test("valid links", async () => {
  expect(twitterRegExp.test("https://twitter.com/genskc")).toBeTruthy();
});

test("invalid links", async () => {
  expect(twitterRegExp.test("https://google.com")).toBeFalsy();
  expect(twitterRegExp.test("https://www.pixiv.net/member_illust.php?id=10655554")).toBeFalsy();
  expect(twitterRegExp.test("https://twitter.coms/genskc")).toBeFalsy();
  expect(twitterRegExp.test("https://www.deviantart.com/kvacm")).toBeFalsy();
});

test("getting images", async () => {
  const search = new TwitterSearch({});
  const images = await search.getImages("https://twitter.com/genskc");
  expect(Array.isArray(images)).toBeTruthy();
  expect(images.length).toBeGreaterThan(0);
}, 60000);

test("getting images failed", async () => {
  const search = new TwitterSearch({});
  try {
    await search.getImages("https://twitter.coms/genskc");
  } catch (e) {
    expect(e);
  }
});
