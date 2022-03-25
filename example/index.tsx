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
	feilmelding: <h1>Stor statisk feilmelding</h1>
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
			}
		]
	},
	config: {
		feilmelding: <h1>Kunne ikke laste inn esm-test</h1>,
	}
};
const AsyncESMApp = AsyncNavspa.importer(asyncESMConfig);

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
			<h1>Mount testing</h1>
			<button onClick={() => setMount((p) => !p)}>Toogle mount</button>
			{mount && <Dekorator appname="world" />}
			{mount && <OldApp appname="world" />}
			{mount && <NewApp appname="world" />}
			{mountAsync && mount && <AsyncCRAApp />}
			{mountAsync && mount && <AsyncESMApp />}
			<ErrorApp appname="error" />
		</>
	);
}

render(<App />, document.getElementById("root"));
