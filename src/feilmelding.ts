export const v2Unmount = (app: string) => `
NAVSPA-appen '${app}' bruker en eldre versjon av NAVSPA for eksportering.
Denne har ett kjent problem med unmounting av komponenten, og det er derfor anbefalt å oppdatere til nyeste versjon.
`.trim();

export const asyncLoadingOfDefinedApp = (app: string) => `
NAVSPA-appen '${app}' ser ut til å være lastet inn via statiske script/link tags fra før av.
Man kan derfor bruke synkron innlasting av denne appen, eller fjerne innlastingen fra index.html.
`.trim()
