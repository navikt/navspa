import React, { useEffect } from 'react';
import { render } from 'react-dom';
import { Navspa, AsyncNavspa, AsyncSpaConfig } from '../src';

interface DecoratorProps {
	appname: string;
}

const Dekorator = Navspa.importer<DecoratorProps>('internarbeidsflatefs');
const OldApp = Navspa.importer<DecoratorProps>('oldapp');
const NewApp = Navspa.importer<DecoratorProps>('newapp');
const ErrorApp = Navspa.importer<DecoratorProps>('errorapp', {
	feilmelding: <p className="with-ok-prefix">Custom feilmelding ved feil innlasting</p>
});

const asyncCRAConfig: AsyncSpaConfig = {
	appName: 'cra-test',
	appBaseUrl: 'http://localhost:5000',
	loader: (<div>Laster...</div>),
	config: {
		feilmelding: <h1>Kunne ikke laste inn cra-test</h1>
	}
};
const AsyncCRAApp = AsyncNavspa.importer(asyncCRAConfig);

const asyncESMConfig: AsyncSpaConfig = {
	appName: 'esm-test',
	appBaseUrl: 'http://localhost:2000',
	loader: (<div>Laster...</div>),
	assetManifestParser: manifest => {
		return [
			{
				path: `http://localhost:2000/${manifest.index}`,
				type: "module"
			},
			{
				path: `http://localhost:2000/${manifest.style}`
			}
		]
	},
	config: {
		feilmelding: <h1>Kunne ikke laste inn esm-test</h1>,
	}
};
const AsyncESMApp = AsyncNavspa.importer(asyncESMConfig);

const react18Config: AsyncSpaConfig = {
	appName: 'react-18-app',
	appBaseUrl: 'http://localhost:2001',
	loader: (<div>Laster...</div>),
	config: {
		feilmelding: <h1>Kunne ikke laste inn react18-test</h1>
	}
};
const React18App = AsyncNavspa.importer(react18Config);

function App() {
	const [mount, setMount] = React.useState<boolean>(true);
	const [mountAsync, setMountAsync] = React.useState<boolean>(false);

	useEffect(() => {
		AsyncNavspa.preload(asyncCRAConfig);
		AsyncNavspa.preload(asyncESMConfig);

		setTimeout(() => {
			setMountAsync(true);
		}, 3000);
	}, [])

	return (
		<>
			<h1>NAVSPA - Testpage</h1>
			<button className="blokk-m" onClick={() => setMount((p) => !p)}>
				Vis/Skjul applikasjoner
			</button>

			<h2>Sync applikasjoner: {mount ? 'Vises' : 'Skjult'}</h2>
			{mount && <ErrorApp appname="error" />}
			{mount && <OldApp appname="world" />}
			{mount && <NewApp appname="world" />}
			{mount && <Dekorator appname="world" />}

			<h2>Async applikasjoner: {mount ? (mountAsync ? 'Vises' : 'Laster') : 'Skjult'}</h2>
			{mountAsync && mount && <AsyncCRAApp />}
			{mountAsync && mount && <AsyncESMApp />}
			{mountAsync && mount && <React18App />}
		</>
	);
}

render(<App />, document.getElementById("root"));
