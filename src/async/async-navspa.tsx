import React, {ReactNode} from "react";
import loadjs from 'loadjs';
import {createAssetManifestParser, joinPaths} from "./utils";
import {importer as importerSync, NAVSPAAppConfig, scope, scopeV2} from '../navspa'
import {asyncLoadingOfDefinedApp} from "../feilmelding";


const ASSET_MANIFEST_NAME = 'asset-manifest.json';
export type ManifestObject = { [k: string]: any };
export type AssetManifestParser = (manifestObject: ManifestObject) => string[];

export interface PreloadConfig {
    appName: string;
    appBaseUrl: string;
    assetManifestParser?: AssetManifestParser;
}

export interface AsyncSpaConfig extends PreloadConfig {
    config?: NAVSPAAppConfig;
    loader?: NonNullable<ReactNode>;
}

function createLoadJsBundleId(appName: string): string {
    return `async_navspa_${appName}`;
}

export function fetchAssetUrls(appBaseUrl: string, assetManifestParser: AssetManifestParser): Promise<string[]> {
    return fetch(joinPaths(appBaseUrl, ASSET_MANIFEST_NAME))
        .then(res => res.json())
        .then(manifest => assetManifestParser(manifest));
}

const loadingStatus: { [key: string]: Promise<void> } = {};
export function loadAssets(config: PreloadConfig): Promise<void> {
    const loadJsBundleId = createLoadJsBundleId(config.appName);
    if (!loadingStatus[loadJsBundleId]) {
        if (process.env.NODE_ENV === 'development' && (scope[config.appName] || scopeV2[config.appName])) {
            console.warn(asyncLoadingOfDefinedApp(config.appName))
        }

        const assetManifestParser = config.assetManifestParser || createAssetManifestParser(config.appBaseUrl);
        loadingStatus[loadJsBundleId] = fetchAssetUrls(config.appBaseUrl, assetManifestParser)
                .then((assets) => loadjs(assets, loadJsBundleId, {returnPromise: true}))
    }

    return loadingStatus[loadJsBundleId];
}

export function preload(config: PreloadConfig) {
    loadAssets(config)
        .catch(console.error);
}

export function importerLazy<P>(config: AsyncSpaConfig): Promise<{ default: React.ComponentType<P> }> {
    return loadAssets(config)
        .catch(console.error)
        .then(() => ({ default: importerSync<P>(config.appName, config.config) }));
}

export function importer<P>(config: AsyncSpaConfig): React.ComponentType<P> {
    const LazyComponent = React.lazy(() => importerLazy(config));
    const loader = config.loader || <></>;
    return (props: P) => (
        <React.Suspense fallback={loader}>
            <LazyComponent {...props} />
        </React.Suspense>
    );
}
