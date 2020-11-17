import * as React from 'react';
import { render } from 'react-dom';
import { importer } from '../src/navspa';
import { importerAsync } from '../src/async-navspa';

interface DecoratorProps {
    appname: string;
}

const Dekorator = importer<DecoratorProps>('internarbeidsflatefs');
const OldApp = importer<DecoratorProps>('oldapp');
const NewApp = importer<DecoratorProps>('newapp');
const AsyncApp = importerAsync('cra-test', 'http://localhost:5000');

function App() {
    const [ mount, setMount ] = React.useState<boolean>(true);
    return (
        <>
            <h1>Mount testing</h1>
            { mount && <Dekorator appname="world" />}
            { mount && <OldApp appname="world" />}
            { mount && <NewApp appname="world" />}
            { mount && <AsyncApp />}
            <button onClick={() => setMount((p) => !p)}>Toogle mount</button>
        </>
    );
}

render(<App />, document.getElementById("root"));
