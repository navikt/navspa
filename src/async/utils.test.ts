import * as Utils from './utils';
import {withCurrentLocation} from "../test.utils";

describe('Utils', () => {
    describe('makeAbsolute', () => {
        it('should append manifest-path to baseUrl-domain', () => {
            expect(Utils.makeAbsolute('http://nav.no/appnavn', '/appnavn/main.js'))
                .toBe('http://nav.no/appnavn/main.js')
        });

        it('should use current domain is path is relative', () => {
            withCurrentLocation('http://container.app/appname', () => {
                expect(Utils.makeAbsolute('/podlet-app', '/podlet-app/static/js/main.js'))
                    .toBe('http://container.app/podlet-app/static/js/main.js')
            });
        });
    });
});