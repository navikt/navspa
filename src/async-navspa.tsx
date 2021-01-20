import React, { useEffect, useState } from 'react';
import loadjs from 'loadjs';
import { importer } from './navspa';
import { createAssetManifestParser, joinPaths } from './utils';

enum AssetLoadState {
	LOADING_ASSETS,
	ASSETS_LOADED,
	FAILED_TO_LOAD_ASSETS
}

interface LoadState<P> {
	navSpa?: React.ComponentType<P>;
	state: AssetLoadState;
}

interface Props<P> {
	appName: string;
	appBaseUrl: string;
	spaProps: P;
	assetManifestParser: AssetManifestParser;
	wrapperClassName?: string;
	loader?: React.ReactNode;
}

interface AsyncSpaConfig {
	appName: string;
	appBaseUrl: string;
	assetManifestParser?: AssetManifestParser;
	wrapperClassName?: string;
	loader?: React.ReactNode;
}

interface PreloadConfig {
	appName: string;
	appBaseUrl: string;
	assetManifestParser?: AssetManifestParser;
}

export type ManifestObject = { [k: string]: any };

// Takes a parsed asset manifest and returns a list of all URLs that must be loaded
export type AssetManifestParser = (manifestObject: ManifestObject) => string[];

const ASSET_MANIFEST_NAME = 'asset-manifest.json';


export function importerAsync<P>(config: AsyncSpaConfig): React.FunctionComponent<P> {
	return (props: P) => {
		return (
			<AsyncNavSpa
				appName={config.appName}
				appBaseUrl={config.appBaseUrl}
				assetManifestParser={config.assetManifestParser || createAssetManifestParser(config.appBaseUrl)}
				wrapperClassName={config.wrapperClassName}
				loader={config.loader}
				spaProps={props}
			/>
		);
	};
}

export function preloadAsync(config: PreloadConfig): void {
	const loadJsBundleId = createLoadJsBundleId(config.appName);
	const assetManifestParser = config.assetManifestParser || createAssetManifestParser(config.appBaseUrl);

	fetchAssetUrls(config.appBaseUrl, assetManifestParser)
		.then(urls => loadjs(urls, loadJsBundleId))
		.catch((err) => console.warn('Failed to async preload ' + config.appName, err));
}

function fetchAssetUrls(appBaseUrl: string, assetManifestParser: AssetManifestParser): Promise<string[]> {
	return fetch(joinPaths(appBaseUrl, ASSET_MANIFEST_NAME))
		.then(res => res.json())
		.then(manifest => assetManifestParser(manifest));
}

function createLoadJsBundleId(appName: string): string {
	return `async_navspa_${appName}`;
}

function AsyncNavSpa<P = {}>(
	{appName, appBaseUrl, spaProps, wrapperClassName, assetManifestParser, loader }: Props<P>
): JSX.Element {
	const loadJsBundleId = createLoadJsBundleId(appName);
	const [loadState, setLoadState] = useState<LoadState<P>>({state: AssetLoadState.LOADING_ASSETS});

	function setAssetsLoaded() {
		setLoadState({state: AssetLoadState.ASSETS_LOADED, navSpa: importer<P>(appName, wrapperClassName)});
	}

	useEffect(() => {
		if (loadjs.isDefined(loadJsBundleId)) {
			setAssetsLoaded();
		} else {
			fetchAssetUrls(appBaseUrl, assetManifestParser)
				.then(urls => {
					// Since preload might be used, we need to check again if the assets were already loaded asynchronously
					if (loadjs.isDefined(loadJsBundleId)) {
						setAssetsLoaded();
					} else {
						loadjs(urls, loadJsBundleId, {
							success: setAssetsLoaded,
							error: () => setLoadState({state: AssetLoadState.FAILED_TO_LOAD_ASSETS})
						});
					}
				})
				.catch(() => setLoadState({state: AssetLoadState.FAILED_TO_LOAD_ASSETS}))
		}
	}, []);

	if (loadState.state === AssetLoadState.LOADING_ASSETS) {
		return <>{loader}</>;
	} else if (loadState.state === AssetLoadState.FAILED_TO_LOAD_ASSETS || !loadState.navSpa) {
		return (
			<div className="navspa--applikasjonsfeil">
				Klarte ikke å laste inn {appName}
			</div>
		);
	}

	return <loadState.navSpa {...spaProps} />;
}
