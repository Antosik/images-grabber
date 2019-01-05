import { deviantartRegExp, DeviantartSearch } from "../../src/";

describe("deviantart tests", () => {
  test("init", () => {
    expect.assertions(3);
    const search = new DeviantartSearch({});
    expect(search).not.toBeNull();
    expect(search).toBeDefined();
    expect(search instanceof DeviantartSearch).toBeTruthy();
  });

  test("login", async () => {
    expect.assertions(1);
    const search = new DeviantartSearch({});
    const authorized = await search.login();
    expect(authorized).toBeTruthy();
  }, 60000);

  describe("links", () => {
    test("valid links", () => {
      expect.assertions(1);
      expect(
        deviantartRegExp.test("https://www.deviantart.com/kvacm")
      ).toBeTruthy();
    });

    test("invalid links", () => {
      expect.assertions(4);
      expect(deviantartRegExp.test("https://google.com")).toBeFalsy();
      expect(
        deviantartRegExp.test(
          "https://www.pixiv.net/member_illust.php?id=10655554"
        )
      ).toBeFalsy();
      expect(deviantartRegExp.test("https://twitter.com/genskc")).toBeFalsy();
      expect(
        deviantartRegExp.test("https://www.deviantart.coms/kvacm")
      ).toBeFalsy();
    });
  });

  describe("unauthorized session", () => {
    const search = new DeviantartSearch({});

    test("getting images", async () => {
      expect.assertions(2);
      const images = await search.getImages("https://www.deviantart.com/kvacm");
      expect(Array.isArray(images)).toBeTruthy();
      expect(images.length).toBeGreaterThan(0);
    }, 120000);

    test("getting images failed", async () => {
      expect.assertions(1);
      try {
        await search.getImages("https://www.deviantart.coms/kvacm");
      } catch (e) {
        expect(e.message).toMatch(/Invalid deviantart link/);
      }
    });
  });
});
