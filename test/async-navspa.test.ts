import "isomorphic-fetch";
import { fetchAssetUrls, loadAssets } from "../src/async/async-navspa";
import {
  microfrontend,
  withCurrentLocation,
  withFetchMock,
} from "./test.utils";
import { describe, afterEach, vi, it, expect } from "vitest";

const mockedLoadjs = vi.hoisted(() => vi.fn());

vi.mock("loadjs", () => {
  return { default: mockedLoadjs };
});

describe("async-navspa", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetchAssetUrls from app from different origin", () =>
    new Promise<void>((done) => {
      const { baseUrl, manifest, manifestUrl, manifestParser } = microfrontend(
        "http://another.io",
        "/pathtoapp",
      );

      withCurrentLocation("http://dummy.io/pathtoapp", () =>
        withFetchMock(manifestUrl, manifest, async () => {
          const assets = await fetchAssetUrls(baseUrl, manifestParser);

          expect(assets).toEqual([
            { path: "http://another.io/pathtoapp/static/js/main.js" },
          ]);

          done();
        }),
      );
    }));

  it("fetchAssetUrls from app from same origin", () =>
    new Promise<void>((done) => {
      const { baseUrl, manifest, manifestUrl, manifestParser } = microfrontend(
        "http://dummy.io",
        "/anotherapp",
      );

      withCurrentLocation("http://dummy.io/pathtoapp", () => {
        withFetchMock(manifestUrl, manifest, async () => {
          const assets = await fetchAssetUrls(baseUrl, manifestParser);

          expect(assets).toEqual([
            { path: "http://dummy.io/anotherapp/static/js/main.js" },
          ]);

          done();
        });
      });
    }));

  it("fetchAssetUrls from app from same origin with relativ path", () =>
    new Promise<void>((done) => {
      const { baseUrl, manifest, manifestUrl, manifestParser } = microfrontend(
        null,
        "/anotherapp",
      );

      withCurrentLocation("http://dummy.io/pathtoapp", () =>
        withFetchMock(manifestUrl, manifest, async () => {
          const assets = await fetchAssetUrls(baseUrl, manifestParser);

          expect(assets).toEqual([
            { path: "http://dummy.io/anotherapp/static/js/main.js" },
          ]);

          done();
        }),
      );
    }));

  it("loadAssets should fetch assets with the help of loadjs", () =>
    new Promise<void>((done) => {
      mockedLoadjs.mockReturnValue(Promise.resolve());
      withFetchMock("http://dummy.io/asset-manifest.json", {}, async () => {
        await loadAssets({
          appName: "testapp",
          appBaseUrl: "http://dummy.io",
          assetManifestParser: () => [{ path: "http://dummy.io/index.js" }],
        });

        expect(mockedLoadjs).toHaveBeenCalledWith(
          ["http://dummy.io/index.js"],
          expect.any(String),
          expect.any(Object),
        );

        done();
      });
    }));
});
