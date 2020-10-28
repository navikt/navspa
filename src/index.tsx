import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Feilmelding from './feilmelding';

interface DeprecatedNAVSPAScope {
    [name: string]: DeprecatedNAVSPAApp;
}
type DeprecatedNAVSPAApp = (element: HTMLElement, props: any) => void;
interface NAVSPAScope {
    [name: string]: NAVSPAApp;
}
type NAVSPAApp = {
    mount(element: HTMLElement, props: any): void;
    unmount(element: HTMLElement): void;
}
type Frontendlogger = { error(e: Error): void; };
type State = { hasError: boolean; };

export default class NAVSPA {
    public static eksporter<PROPS>(name: string, component: React.ComponentType<PROPS>) {
        NAVSPA.scope[name] = (element: HTMLElement, props: PROPS) => {
            ReactDOM.render(React.createElement(component, props), element);
        };
        NAVSPA.scopeV2[name] = {
            mount(element: HTMLElement, props: PROPS) {
                ReactDOM.render(React.createElement(component, props), element);
            },
            unmount(element: HTMLElement) {
                ReactDOM.unmountComponentAtNode(element);
            }
        }
    }

    public static importer<PROPS>(name: string): React.ComponentType<PROPS> {
        let app: NAVSPAApp = NAVSPA.scopeV2[name];
        if (!app) {
            console.error(Feilmelding.v2Unmount(name))
            app = {
                mount: NAVSPA.scope[name],
                unmount(element: HTMLElement) {
                    ReactDOM.unmountComponentAtNode(element);
                }
            };
        }

        class NAVSPAImporter extends React.Component<PROPS, State> {

            private el?: HTMLElement;

            constructor(props: PROPS) {
                super(props);
                this.state = {
                    hasError: false,
                };
            }

            private renderImportedComponent() {
                try {
                    if (this.el) {
                        app.mount(this.el, this.props);
                    }
                } catch (e) {
                    this.setState({ hasError: true });
                    NAVSPA.logger.error(e);
                }
            }

            public componentDidCatch(error: Error) {
                this.setState({ hasError: true });
                NAVSPA.logger.error(error);
            }

            public componentDidMount() {
                this.renderImportedComponent();
            }

            public componentDidUpdate(): void {
                if (!this.state.hasError) {
                    this.renderImportedComponent();
                }
            }

            public componentWillUnmount() {
                if (this.el) {
                    app.unmount(this.el);
                }
            }

            public render() {
                if (this.state.hasError) {
                    return <div className="navspa--applikasjonsfeil">Feil i {name}</div>;
                }
                return <div ref={this.saveRef} />;
            }

            private saveRef = (el: HTMLDivElement) => {
                this.el = el;
            };
        }

        return NAVSPAImporter;
    }

    private static scope: DeprecatedNAVSPAScope = (global as any)['NAVSPA'] = (global as any)['NAVSPA'] || {}; // tslint:disable-line
    private static scopeV2: NAVSPAScope = (global as any)['NAVSPA-V2'] = (global as any)['NAVSPA-V2'] || {}; // tslint:disable-line
    private static logger: Frontendlogger = (global as any).frontendlogger = (global as any).frontendlogger || { error() {} }; // tslint:disable-line
}
