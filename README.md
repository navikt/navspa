# navspa

[![npm version](https://badge.fury.io/js/%40navikt%2Fnavspa.svg)](https://www.npmjs.com/package/@navikt/navspa)

Hjelpe-bibliotek for å bygge opp micro-frontends

## Bruk
Antar ett system som består av tre ulike systemer; parent-app, child1-app og child2-app.
   
I childXX-app;
```typescript jsx
import NAVSPA from '@navikt/navspa';

interface Props {
  data: string;
}

function Application(props: Props) {
  return (
    <h1>Hei fra ChildX-app; {props.data}</h1>
  );
}

NAVSPA.eksporter('childX', Application);
```

I parent-app kan man så gjøre følgende;
```typescript jsx
import NAVSPA from '@navikt/navspa';
const Child1 = NAVSPA.importer<ChildProps>('child1');
const Child2 = NAVSPA.importer<ChildProps>('child2', {
    wrapperClassName: 'wrapper-classname',
    feilmelding: <Alertstripe>Feil ved innlasting av child2</Alertstripe>
});

function Wrapper() {
  return (
    <>
      <Child1 data="Data til child1" />
      <Child2 data="Data til child2" />
    </>
  );
}
```

Det er også mulig å importere inn child applikasjoner asynkront ved bruk av `AsyncNavspa.importer`.
Hvis en applikasjon importeres inn async så trengs det ikke å laste inn css/js gjennom tags i html-filen til parent-appen.
Istedenfor så vil async-navspa lese asset-manifest.json og finne ut hvilken filer den trenger å hente derfra.
Som default så må manifestet være på samme format som det som blir opprettet av CRA, men det er mulig å overskrive parsingen av manifestet ved behov.
```typescript jsx
import { AsyncNavspa } from '@navikt/navspa';

const AsyncChild1 = AsyncNavspa.importer<ChildProps>({
    appName: 'child-1',
    appBaseUrl: 'https://url-to-microfrontend1.com/'
});

const AsyncChild2 = AsyncNavspa.importer<ChildProps>({
    appName: 'child-2',
    appBaseUrl: 'https://url-to-microfrontend2.com/',
    assetManifestParser:  (manifest: { [k: string]: any }) => {/*...*/},
    config: {
        wrapperClassName: 'wrapper-classname',
        feilmelding: <Alertstripe>Feil ved innlasting av child-2</Alertstripe>
    },
    loader: (<div>Laster child 2...</div>),
});

function Wrapper() {
  return (
    <>
        <AsyncChild1 data="Data til child1" />
        <AsyncChild2 data="Data til child2" />
    </>
  );
}
```

Når man bruker `AsyncNavspa.importer` så starter innhentingen av ressursene når komponenten først mountes. 
Dette vil som regel kun medføre 1 kall for å hente asset-manifestet og 1 pr ressurs (er som regel cachet ganske bra).
For å gjøre innlasting raskere så er det mulig å bruke `AsyncNavspa.preload`. 
Da vil ressursene bli lastet inn asynkront slik at child appen kan rendres raskere.

```typescript jsx
import { AsyncNavspa } from '@navikt/navspa';

const config: AsyncSpaConfig = {
    appName: 'child-1',
    appBaseUrl: 'https://url-to-microfrontend1.com/',
    loader: <div>loading</div>
}

// Do the preloading somewhere before child-1 needs to be rendered
AsyncNavspa.preload(config);

const AsyncChild1 = AsyncNavspa.importer<ChildProps>(config);

function Wrapper() {
  return (
    <>
        <AsyncChild1 data="Data til child1" />
    </>
  );
}
```

**NB** Distribuering av PropTypes er ikke en del av dette biblioteket. 


### Bruk med create-react-app
Siden vi fjerner kallet til `ReactDOM.render` og heller kaller `NAVSPA.eksporter` så må vi gjøre noen endringer i `public/index.html`
for å få utvikler-miljø til å fungere. Brukere kommer ikke til å komme direkte til noen av barne-appene, så endringer er kun for å 
gjøre utvikling av løsningen enklere.

`public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="theme-color" content="#000000"/>
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json"/>
    <title>React App</title>
</head>
<body>
<div id="root"></div>
<script>
    NAVSPA.childXX(document.getElementById('root'), { data: 'Data til bruk under utvikling' });
</script>
</body>
```

### Bruk med vitejs
Om man bruker vitejs for eksportering av applikasjonen sin må man passe på at manifestet blir gitt riktig navn, e.g `asset-manifest.json`.
Dette kan gjøres ved hjelp av følgende config:
```typescript
// vite.config.ts
export default defineConfig({
    build: {
        manifest: 'asset-manifest.json'
    }
});
```

For konsumering av applikasjoner eksportert med vitejs bør man sikre at man har `@navikt/navspa >= 5.0.1`, 
og huske å definere en `assetManifestParser` om man laster applikasjonen asynkront.

```typescript
const asyncViteApp: AsyncSpaConfig = {
    appName: 'async-vite-app',
    appBaseUrl: 'http://url.to.your.app',
    assetManifestParser(manifest: Manifest) {
        const { file, css } = manifest['index.html'];
        const baseUrl = 'http://url.to.your.app';
        
        const script = { type: 'module', path: `${baseUrl}/${file}` };
        const styles = css.map((path) => ({ path: `${baseUrl}/${path}` }));
        
        return [ script, ...styles ];
    }
}
```
**NB!!** basert på applikasjonen man laster inn så kan det være behov for å lage en mer generisk assetmanifestparser.

### Bruk av react@<18.0.0

`react-dom@18.0.0` innførte en endring i api for rendering, som påvirker dette biblioteket. 
Som default antar NAVSPA at applikasjonen bruker `react-dom@^18`. 
Om man skal eksportere en applikasjon som bruker en react versjon eldre enn dette må man manuelt konfigurere NAVSPA til å håndtere dette.

```typescript
import { ReactElement } from "react";
import ReactDOM from 'react-dom';

NAVSPA.setAdapter({
    render<P>(component: ReactElement<P>, element: HTMLElement) {
        ReactDOM.render(component, element);
    },
    unmount(element: HTMLElement) {
        ReactDOM.unmountComponentAtNode(element);
    }
});
```

Eventuelt kan man bruke pakken `@navikt/navspa-react-17-adapter` og følgende konfigurasjon:
```typescript

NAVSPA.setAdapter(new React17Adapter());

```

## Inqueries
For inquries please create a GitHub-issue. For NAV internal inqueries please contact Team Personoversikt on slack at #personoversikt-intern
