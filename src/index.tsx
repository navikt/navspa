import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface NAVSPAScope {
    [name: string]: NAVSPAApp;
}
type NAVSPAApp = (element: HTMLElement, props: any) => void;
type Frontendlogger = { error(e: Error): void; };
type State = { hasError: boolean; };

export default class NAVSPA {
    public static eksporter<PROPS>(name: string, component: React.ComponentType<PROPS>) {
        NAVSPA.scope[name] = (element: HTMLElement, props: PROPS) => {
            ReactDOM.render(React.createElement(component, props), element);
        };
    }

    public static importer<PROPS>(name: string): React.ComponentType<PROPS> {
        class NAVSPAImporter extends React.Component<PROPS, State> {

            private el?: HTMLElement;

            constructor(props: PROPS) {
                super(props);
                this.state = {
                    hasError: false,
                };
            }

            public componentDidCatch(error: Error) {
                this.setState({ hasError: true });
                NAVSPA.logger.error(error);
            }

            public componentDidMount() {
                try {
                    if (this.el) {
                        NAVSPA.scope[name](this.el, this.props);
                    }
                } catch (e) {
                    this.setState({ hasError: true });
                    NAVSPA.logger.error(e);
                }
            }

            public componentWillUnmount() {
                if (this.el) {
                    ReactDOM.unmountComponentAtNode(this.el);
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

    private static scope: NAVSPAScope = (global as any)['NAVSPA'] = (global as any)['NAVSPA'] || {}; // tslint:disable-line
    private static logger: Frontendlogger = (global as any).frontendlogger = (global as any).frontendlogger || { error() {} }; // tslint:disable-line
}
