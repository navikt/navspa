import React, { useEffect, useState } from 'react';
import loadjs from 'loadjs';
import { importer } from './navspa';
import { extractPathsFromCRAManifest, joinPaths, Object } from './utils';

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
	wrapperClassName?: string;
	assetManifestParser?: (manifestObject: Object) => string[]; // Takes a parsed asset manifest and returns a list of all paths that must be loaded
}

export function importerAsync<P>(appName: string, appBaseUrl: string, wrapperClassName?: string, assetManifestParser?: (manifestObject: Object) => string[]): React.FunctionComponent<P> {
	return (props: P) => {
		return (
			<AsyncNavSpa
				appName={appName}
				appBaseUrl={appBaseUrl}
				assetManifestParser={assetManifestParser}
				wrapperClassName={wrapperClassName}
				spaProps={props}
			/>
		);
	};
}

function AsyncNavSpa<P = {}>(
	{appName, appBaseUrl, spaProps, wrapperClassName, assetManifestParser = extractPathsFromCRAManifest}: Props<P>
): JSX.Element {
	const loadJsAppName = `async_navspa_${appName}`;
	const [loadState, setLoadState] = useState<LoadState<P>>({state: AssetLoadState.LOADING_ASSETS});

	function setAssetsLoaded() {
		setLoadState({state: AssetLoadState.ASSETS_LOADED, navSpa: importer<P>(appName, wrapperClassName)});
	}

	useEffect(() => {
		if (loadjs.isDefined(loadJsAppName)) {
			setAssetsLoaded();
		} else {
			fetch(joinPaths(appBaseUrl, 'asset-manifest.json'))
				.then(res => res.json())
				.then(manifest => {
					const pathsToLoad = assetManifestParser(manifest);
					const urlsToLoad = pathsToLoad.map(path => joinPaths(appBaseUrl, path));

					loadjs(urlsToLoad, loadJsAppName, {
						success: setAssetsLoaded,
						error: () => setLoadState({state: AssetLoadState.FAILED_TO_LOAD_ASSETS})
					});
				})
				.catch(() => setLoadState({state: AssetLoadState.FAILED_TO_LOAD_ASSETS}));
		}
	}, []);

	if (loadState.state === AssetLoadState.LOADING_ASSETS) {
		return <></>;
	} else if (loadState.state === AssetLoadState.FAILED_TO_LOAD_ASSETS || !loadState.navSpa) {
		return (
			<div className="navspa--applikasjonsfeil">
				Klarte ikke å laste inn {appName}
			</div>
		);
	}

	return <loadState.navSpa {...spaProps} />;
}
