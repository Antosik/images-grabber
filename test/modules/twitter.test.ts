import { twitterRegExp, TwitterSearch } from "../../src";

test("init", () => {
  expect.assertions(3);
  const search = new TwitterSearch({});
  expect(search).not.toBeNull();
  expect(search).toBeDefined();
  expect(search instanceof TwitterSearch).toBeTruthy();
});

test("login", async () => {
  expect.assertions(1);
  const search = new TwitterSearch({});
  const authorized = await search.login();
  expect(authorized).toBeTruthy();
});

test("valid links", async () => {
  expect.assertions(1);
  expect(twitterRegExp.test("https://twitter.com/genskc")).toBeTruthy();
});

test("invalid links", async () => {
  expect.assertions(4);
  expect(twitterRegExp.test("https://google.com")).toBeFalsy();
  expect(twitterRegExp.test("https://www.pixiv.net/member_illust.php?id=10655554")).toBeFalsy();
  expect(twitterRegExp.test("https://twitter.coms/genskc")).toBeFalsy();
  expect(twitterRegExp.test("https://www.deviantart.com/kvacm")).toBeFalsy();
});

test("getting images", async () => {
  expect.assertions(2);
  const search = new TwitterSearch({});
  const images = await search.getImages("https://twitter.com/genskc");
  expect(Array.isArray(images)).toBeTruthy();
  expect(images.length).toBeGreaterThan(0);
}, 60000);

test("getting images failed", async () => {
  expect.assertions(1);
  const search = new TwitterSearch({});
  try {
    await search.getImages("https://twitter.coms/genskc");
  } catch (e) {
    expect(e.message).toMatch(/Invalid twitter link/);
  }
});
