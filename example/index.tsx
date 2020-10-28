
import * as React from 'react';
import { render } from 'react-dom';
import NAVSPA from "../src/index";
interface DecoratorProps {
    appname: string;
}
const Dekorator = NAVSPA.importer<DecoratorProps>('internarbeidsflatefs');
const OldApp = NAVSPA.importer<DecoratorProps>('oldapp');
const NewApp = NAVSPA.importer<DecoratorProps>('newapp');

function App() {
    const [ mount, setMount ] = React.useState<boolean>(true);
    return (
        <>
            <h1>Mount testing</h1>
            { mount && <Dekorator appname="world" />}
            { mount && <OldApp appname="world" />}
            { mount && <NewApp appname="world" />}

            <button onClick={() => setMount((p) => !p)}>Toogle mount</button>
        </>
    );
}

render(<App />, document.getElementById("root"));
