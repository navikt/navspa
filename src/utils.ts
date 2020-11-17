export type Object = { [k: string]: any };

/**
 * Extracts paths to load from a Create React App asset manifest.
 * @param manifestObject parsed json from the asset manifest
 */
export function extractPathsFromCRAManifest(manifestObject: Object): string[] {
	const pathsToLoad: string[] = [];
	const unnecessaryFiles = ['runtime-main', 'service-worker', 'precache-manifest'];

	if (typeof manifestObject.files !== 'object') {
		throw new Error('Invalid manifest: ' + JSON.stringify(manifestObject));
	}

	Object.entries(manifestObject.files).forEach(([_, filePath]) => {
		const path = filePath as string;
		const isCssOrJs = path.endsWith('.js') || path.endsWith('.css');
		const isUnnecessary = unnecessaryFiles.find(filePath => path.includes(filePath));

		if (isCssOrJs && !isUnnecessary) {
			pathsToLoad.push(path);
		}
	});

	return pathsToLoad;
}

export function joinPaths(...paths: string[]): string {
	return paths.map((path, idx) => {
		if (path.trim() === '' || path === '/') {
			return null;
		}

		const isFirstPath = idx === 0;
		const isLastPath = idx === paths.length - 1;

		let cleanedPath = path;

		if (cleanedPath.startsWith('/') && !isFirstPath) {
			cleanedPath = cleanedPath.substr(1);
		}

		if (cleanedPath.endsWith('/') && !isLastPath) {
			cleanedPath = cleanedPath.substr(0, path.length - 1);
		}

		return cleanedPath;
	}).filter(p => p != null).join('/');
}