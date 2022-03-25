import 'isomorphic-fetch';
import loadjs from "loadjs";
import { fetchAssetUrls, loadAssets } from '../src/async/async-navspa';
import { microfrontend, withCurrentLocation, withFetchMock } from "./test.utils";

jest.mock('loadjs');

const mockedLoadjs = loadjs as jest.MockedFunction<typeof loadjs>;

describe('async-navspa', () => {
    afterEach(() => {
        mockedLoadjs.mockClear()
    });

    it('fetchAssetUrls from app from different origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://another.io', '/pathtoapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toEqual([
                    { path: 'http://another.io/pathtoapp/static/js/main.js' }
                ]);

                done();
            })
        ));
    });

    it('fetchAssetUrls from app from same origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://dummy.io', '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => {
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toEqual([
                    { path: 'http://dummy.io/anotherapp/static/js/main.js' }
                ])

                done();
            });
        });
    });

    it('fetchAssetUrls from app from same origin with relativ path', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend(null, '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toEqual([
                    { path: 'http://dummy.io/anotherapp/static/js/main.js' }
                ]);

                done();
            })
        ));
    });

    it('loadAssets should fetch assets with the help of loadjs', (done) => {
        mockedLoadjs.mockReturnValue(Promise.resolve());

        withFetchMock('http://dummy.io/asset-manifest.json', {}, async () => {
            await loadAssets({
                appName: 'testapp',
                appBaseUrl: 'http://dummy.io',
                assetManifestParser: () => [{ path: "http://dummy.io/index.js" }]
            });

            expect(mockedLoadjs).toHaveBeenCalledWith(
                ["http://dummy.io/index.js"],
                expect.any(String),
                expect.any(Object)
            );

            done();
        })
    });
});