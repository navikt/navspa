import 'isomorphic-fetch';
jest.mock(
    'loadjs',
    () => jest.fn().mockReturnValue(Promise.resolve())
);
import { loadAssets, fetchAssetUrls } from '../src/async/async-navspa';
import { microfrontend, withFetchMock, withCurrentLocation } from "./test.utils";

describe('async-navspa', () => {
    it('fetchAssetUrls from app from different origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://another.io', '/pathtoapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://another.io/pathtoapp/static/js/main.js`)

                done();
            })
        ));
    });

    it('fetchAssetUrls from app from same origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://dummy.io', '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => {
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://dummy.io/anotherapp/static/js/main.js`)

                done();
            });
        });
    });

    it('fetchAssetUrls from app from same origin with relativ path', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend(null, '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withFetchMock(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://dummy.io/anotherapp/static/js/main.js`)

                done();
            })
        ));
    });

    it('loadAssets should fetch assets with the help of loadjs', (done) => {
        withFetchMock('http://dummy.io/asset-manifest.json', {},() => {
            const status = loadAssets({
                appName: 'testapp',
                appBaseUrl: 'http://dummy.io',
                assetManifestParser: () => []
            });

            expect(typeof status).toBe('object');
            expect(status instanceof Promise).toBeTruthy();
            status
                .then(() => {}, () => fail('Promise should resolve ok'))
                .then(done);
        })
    });
});