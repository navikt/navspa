import { scope, importer } from '../src/navspa';

describe('navspa', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('it should log error if application is not loaded', () => {
        const errorlog = jest.spyOn(console, 'error');
        importer('testapp');

        expect(errorlog).toHaveBeenCalledTimes(1);
        expect(errorlog.mock.calls[0][0]).toContain(`NAVSPA-appen 'testapp' er ikke lastet inn.`)
    });

    it('it should log error if old version is used', () => {
        const errorlog = jest.spyOn(console, 'error');
        scope['testapp'] = () => {};

        importer('testapp');

        expect(errorlog).toHaveBeenCalledTimes(1);
        expect(errorlog.mock.calls[0][0]).toContain(`NAVSPA-appen 'testapp' bruker en eldre versjon av NAVSPA for eksportering.`)
    });
})