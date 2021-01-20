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

const scope: DeprecatedNAVSPAScope = (global as any)['NAVSPA'] = (global as any)['NAVSPA'] || {}; // tslint:disable-line
const scopeV2: NAVSPAScope = (global as any)['NAVSPA-V2'] = (global as any)['NAVSPA-V2'] || {}; // tslint:disable-line

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

export function importer<P>(name: string, wrapperClassName?: string, loader?: React.ReactNode): React.ComponentType<P> {
	return (props: P) => <NavSpa navSpaName={name} navSpaProps={props} wrapperClassName={wrapperClassName} loader={loader} />;
}

interface NavSpaWrapperProps<P> {
	navSpaName: string;
	navSpaProps: P;
	wrapperClassName?: string;
	loader?: React.ReactNode;
}

interface NavSpaState {
	isLoading: boolean;
	hasError: boolean;
}

class NavSpa<P> extends React.Component<NavSpaWrapperProps<P>, NavSpaState> {

	readonly MAX_RETRIES = 100;

	readonly RETRY_INTERVAL_MS = 50;

	private retryCounter = 0;

	private retryInterval?: number;

	private spaRootElement?: HTMLElement;

	private navSpaApp?: NAVSPAApp;

	constructor(props: NavSpaWrapperProps<P>) {
		super(props);

		this.navSpaApp = this.getNavSpaApp(props.navSpaName);

		this.state = {
			isLoading: !this.navSpaApp,
			hasError: false
		};
	}

	private getNavSpaApp(appName: string): NAVSPAApp | undefined {
		let app: NAVSPAApp = scopeV2[appName];

		if (!app) {
			const oldApp = scope[appName];

			if (oldApp) {
				console.error(Feilmelding.v2Unmount(appName));

				app = {
					mount: scope[appName],
					unmount: (element: HTMLElement) => ReactDOM.unmountComponentAtNode(element)
				};
			}
		}

		return app;
	}

	private renderImportedComponent() {
		if (!this.navSpaApp) {
			console.error(`Kan ikke rendre ${this.props.navSpaName} fordi mount() mangler`);
			return;
		}

		try {
			if (this.spaRootElement) {
				this.navSpaApp.mount(this.spaRootElement, this.props.navSpaProps);
			}
		} catch (e) {
			this.setState({hasError: true});
			console.error(`Error while rendering NAVSPA ${this.props.navSpaName}`, e);
		}
	}

	private startReloadNavSpa() {
		const reloadNavSpa = () => {
			this.navSpaApp = this.getNavSpaApp(this.props.navSpaName);

			if (this.navSpaApp) {
				this.renderImportedComponent();
				clearInterval(this.retryInterval);
				this.setState({ hasError: false, isLoading: false });
			} else {
				this.retryCounter += 1;

				if (this.retryCounter > this.MAX_RETRIES) {
					console.error(`${this.props.navSpaName} has exceeded the number of retries for reloading`);
					clearInterval(this.retryInterval);
					this.setState({ hasError: true, isLoading: false });
				}
			}
		};

		this.retryInterval = setInterval(reloadNavSpa, this.RETRY_INTERVAL_MS) as unknown as number;
	}

	public componentDidCatch(error: Error) {
		this.setState({hasError: true});
		console.error(`Caught error for NAVSPA ${this.props.navSpaName}`, error);
	}

	public componentDidMount() {
		if (!this.navSpaApp) {
			this.startReloadNavSpa();
		} else {
			this.renderImportedComponent();
		}
	}

	public componentDidUpdate(): void {
		if (!this.state.hasError && this.navSpaApp) {
			this.renderImportedComponent();
		}
	}

	public componentWillUnmount() {
		if (this.spaRootElement && this.navSpaApp) {
			this.navSpaApp.unmount(this.spaRootElement);
		}
	}

	public render() {
		if (this.state.isLoading) {
			return <>{this.props.loader}</>;
		}

		if (this.state.hasError) {
			return <div className="navspa--applikasjonsfeil">Feil i {this.props.navSpaName}</div>;
		}

		return <div className={this.props.wrapperClassName} ref={this.saveRef}/>;
	}

	private saveRef = (mountPoint: HTMLDivElement) => {
		this.spaRootElement = mountPoint;
	};
}
