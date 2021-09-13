import { render, screen } from '@testing-library/react';
import { queryByTestId } from '@testing-library/dom';
import { scope, importer, eksporter } from '../src/navspa';
import * as React from "react";

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

    it('it should return a react function component', () => {
        scope['testapp'] = () => {};

        const Component = importer('testapp', {
            wrapperClassName: 'testref'
        });

        expect(typeof Component).toBe('function');
    });

    it('it should render application within a div with the correct wrapper class', () => {
        const App = () => <h1>Header</h1>;
        eksporter('testapp', App);

        const Component = importer('testapp', {
            wrapperClassName: 'testref'
        });
        const { container } = render(<Component />)

        expect(container.querySelector('div.testref')).not.toBeNull();
        expect(screen.getByText('Header')).not.toBeNull();
    });
})