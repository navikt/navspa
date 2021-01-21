import { importer, eksporter } from './navspa';
import { importer as importerAsync, importerLazy, preload } from './async/async-navspa';
export { AsyncSpaConfig } from './async/async-navspa';

export const AsyncNavspa = {
	importer: importerAsync,
	importerLazy,
	preload
};

export const Navspa = {
	importer,
	eksporter
};

export default Navspa;
