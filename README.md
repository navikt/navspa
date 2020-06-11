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
const Child2 = NAVSPA.importer<ChildProps>('child2');

function Wrapper() {
  return (
    <>
      <Child1 data="Data til child1" />
      <Child2 data="Data til child2" />
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

## Inqueries
For inquries please create a GitHub-issue. For NAV internal inqueries please contact Team Personoversikt on slack at #personoversikt-intern
