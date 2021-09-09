import 'isomorphic-fetch';
import { fetchAssetUrls } from '../src/async/async-navspa';
import { microfrontend, withAssetManifestAt, withCurrentLocation } from "./test.utils";

describe('async-navspa', () => {
    it('loadAssets from app from different origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://another.io', '/pathtoapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withAssetManifestAt(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://another.io/pathtoapp/static/js/main.js`)

                done();
            })
        ));
    });

    it('loadAssets from app from same origin', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend('http://dummy.io', '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => {
            withAssetManifestAt(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://dummy.io/anotherapp/static/js/main.js`)

                done();
            });
        });
    });

    it('loadAssets from app from same origin with relativ path', (done) => {
        const {baseUrl, manifest, manifestUrl, manifestParser} = microfrontend(null, '/anotherapp');

        withCurrentLocation('http://dummy.io/pathtoapp', () => (
            withAssetManifestAt(manifestUrl, manifest, async () => {
                const assets = await fetchAssetUrls(baseUrl, manifestParser);

                expect(assets).toHaveLength(1);
                expect(assets[0]).toBe(`http://dummy.io/anotherapp/static/js/main.js`)

                done();
            })
        ));
    });
});