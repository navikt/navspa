import * as React from 'react';
import { render } from 'react-dom';
import { importer } from '../src/navspa';
import { importerAsync, preloadAsync } from '../src/async-navspa';
import { useEffect } from 'react';

interface DecoratorProps {
	appname: string;
}

const Dekorator = importer<DecoratorProps>('internarbeidsflatefs');
const OldApp = importer<DecoratorProps>('oldapp');
const NewApp = importer<DecoratorProps>('newapp');

const asyncConfig = {
	appName: 'cra-test',
	appBaseUrl: 'http://localhost:5000',
	loader: (<div>Laster...</div>)
};

const AsyncApp = importerAsync(asyncConfig);

function App() {
	const [mount, setMount] = React.useState<boolean>(true);
	const [mountAsync, setMountAsync] = React.useState<boolean>(false);

	useEffect(() => {
		preloadAsync(asyncConfig);

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
		</>
	);
}

render(<App/>, document.getElementById("root"));
