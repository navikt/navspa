import { extractPathsFromCRAManifest, joinPaths } from '../src/utils';

describe('joinPaths', () => {
	it('should join url with path', () => {
		expect(joinPaths('https://example.com', 'test')).toBe('https://example.com/test');
	})
	it('should join paths', () => {
		expect(joinPaths('/path', '/to', '/test')).toBe('/path/to/test');
		expect(joinPaths('/path', '', 'test')).toBe('/path/test');
		expect(joinPaths('/path', '/', 'test')).toBe('/path/test');
		expect(joinPaths('path', 'test')).toBe('path/test');
		expect(joinPaths('', '', 'test')).toBe('test');
	})
});


describe('extractPathsFromCRAManifest', () => {
	it('should extract correct paths from the manifest', () => {
		const testManifest =  {
			files: {
				"main.css": "/veilarbdemo/static/css/main.css",
				"main.js": "/veilarbdemo/static/js/main.js",
				"main.js.map": "/veilarbdemo/static/js/main.js.map",
				"index.html": "/veilarbdemo/index.html",
				"precache-manifest.1b3d59df3e178365037cfd06d62a63fc.js": "/veilarbdemo/precache-manifest.1b3d59df3e178365037cfd06d62a63fc.js",
				"service-worker.js": "/veilarbdemo/service-worker.js",
				"static/css/main.css.map": "/veilarbdemo/static/css/main.css.map",
				"static/js/main.js.LICENSE.txt": "/veilarbdemo/static/js/main.js.LICENSE.txt",
				"static/media/cv-panel-innhold.less": "/veilarbdemo/static/media/rediger.a0d6689d.svg",
				"static/media/printer.f2de876d.svg": "/veilarbdemo/static/media/printer.f2de876d.svg"
			},
			entrypoints: [
				"static/css/main.css",
				"static/js/main.js"
			]
		};

		expect(extractPathsFromCRAManifest(testManifest)).toStrictEqual(["/veilarbdemo/static/css/main.css","/veilarbdemo/static/js/main.js"]);
	})
	it('should throw error for invalid manifest', () => {
		const testManifest =  {};
		expect(() => extractPathsFromCRAManifest(testManifest)).toThrow('Invalid manifest: {}');
	})
});