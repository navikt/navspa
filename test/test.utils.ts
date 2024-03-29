import FetchMock from "yet-another-fetch-mock";
import {ManifestObject} from "../src/async/async-navspa";
import {createAssetManifestParser} from "../src/async/utils";

export async function withCurrentLocation(url: string, assertion: () => void) {
    const original = window.location;
    delete window.location;
    window.location = new URL(url) as any;
    await assertion();
    window.location = original;
}

export async function withFetchMock(
    url: string,
    data: object,
    assertion: () => void
) {
    const mock = FetchMock.configure({ enableFallback: false });
    mock.get(url, (req, res, ctx) => res(
        ctx.json(data)
    ));
    await assertion();
    mock.restore();
}

export function assetManifestWith(...filesPaths: string[]): ManifestObject {
    const files = filesPaths
        .map((path) => {
            const [filename] = path.split("/").reverse();
            return [filename, path];
        })
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as ManifestObject);

    return {
        files,
        entrypoints: filesPaths
    }
}

export function microfrontend(host: string | null, domain: string) {
    const baseUrl = `${host}${domain}`;
    const manifest = assetManifestWith(`${domain}/static/js/main.js`);
    const manifestUrl = `${baseUrl}/asset-manifest.json`;
    const manifestParser = createAssetManifestParser(baseUrl);
    return { baseUrl, manifest, manifestUrl, manifestParser };
}