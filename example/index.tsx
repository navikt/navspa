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
	// feilmelding: null
	// feilmelding: 'bare en string er lov'
	feilmelding: <h1>Stor statisk feilmelding</h1>
});

const asyncConfig: AsyncSpaConfig = {
	appName: 'cra-test',
	appBaseUrl: 'http://localhost:5000',
	loader: (<div>Laster...</div>),
	config: {
		// feilmelding: null
		// feilmelding: 'Kunne ikke laste inn cra-test'
		feilmelding: <h1>Kunne ikke laste inn cra-test</h1>
	}
};

const AsyncApp = AsyncNavspa.importer(asyncConfig);

function App() {
	const [mount, setMount] = React.useState<boolean>(true);
	const [mountAsync, setMountAsync] = React.useState<boolean>(false);

	useEffect(() => {
		AsyncNavspa.preload(asyncConfig);

		setTimeout(() => {
			setMountAsync(true);
		}, 3000);
	}, [])

	return (
		<>
			<h1>Mount testing</h1>
			<button onClick={() => setMount((p) => !p)}>Toogle mount</button>
			{mount && <Dekorator appname="world"/>}
			{mount && <OldApp appname="world"/>}
			{mount && <NewApp appname="world"/>}
			{mountAsync && mount && <AsyncApp/>}
			<ErrorApp />
		</>
	);
}

render(<App/>, document.getElementById("root"));
