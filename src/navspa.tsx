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

export interface NAVSPAAppConfig {
	wrapperClassName?: string;
	feilmelding?: React.ReactNode;
}

type NAVSPAApp = {
	mount(element: HTMLElement, props: any): void;
	unmount(element: HTMLElement): void;
}

export const scope: DeprecatedNAVSPAScope = (global as any)['NAVSPA'] = (global as any)['NAVSPA'] || {}; // tslint:disable-line
export const scopeV2: NAVSPAScope = (global as any)['NAVSPA-V2'] = (global as any)['NAVSPA-V2'] || {}; // tslint:disable-line

export function eksporter<PROPS>(name: string, component: React.ComponentType<PROPS>) {
	scope[name] = (element: HTMLElement, props: PROPS) => {
		ReactDOM.render(React.createElement(component, props), element);
	};
	scopeV2[name] = {
		mount(element: HTMLElement, props: PROPS) {
			ReactDOM.render(React.createElement(component, props), element);
		},
		unmount(element: HTMLElement) {
			ReactDOM.unmountComponentAtNode(element);
		}
	}
}

export function importer<P>(name: string, config?: NAVSPAAppConfig): React.ComponentType<P> {
	const appconfig: NAVSPAAppConfig = {
		...(config ?? {}),
		feilmelding: config?.feilmelding === undefined ? <>Feil i {name}</> : config?.feilmelding
	}

	let app: NAVSPAApp = scopeV2[name];
	if (!app) {
		if (scope[name]) {
			console.error(Feilmelding.v2Unmount(name));
		} else {
			console.error(Feilmelding.ukjentApp(name));
		}
		app = {
			mount: scope[name],
			unmount(element: HTMLElement) {
				ReactDOM.unmountComponentAtNode(element);
			}
		};
	}

	return (props: P) => <NavSpa name={name} navSpaApp={app} navSpaProps={props} config={appconfig} />;
}

interface NavSpaWrapperProps<P> {
	name: string;
	navSpaApp: NAVSPAApp;
	navSpaProps: P;
	config: NAVSPAAppConfig;
}

interface NavSpaState {
	hasError: boolean;
}

class NavSpa<P> extends React.Component<NavSpaWrapperProps<P>, NavSpaState> {

	private spaRootElement?: HTMLElement;

	constructor(props: NavSpaWrapperProps<P>) {
		super(props);
		this.state = {
			hasError: false
		};
	}

	private renderImportedComponent() {
		try {
			if (this.spaRootElement) {
				this.props.navSpaApp.mount(this.spaRootElement, this.props.navSpaProps);
			}
		} catch (e) {
			this.setState({hasError: true});
			console.error(e);
		}
	}

	public componentDidCatch(error: Error) {
		this.setState({hasError: true});
		console.error(error);
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
		if (this.spaRootElement) {
			this.props.navSpaApp.unmount(this.spaRootElement);
		}
	}

	public render() {
		if (this.state.hasError) {
			return <div className="navspa--applikasjonsfeil">{this.props.config.feilmelding}</div>;
		}
		return <div className={this.props.config.wrapperClassName} ref={this.saveRef}/>;
	}

	private saveRef = (mountPoint: HTMLDivElement) => {
		this.spaRootElement = mountPoint;
	};
}
