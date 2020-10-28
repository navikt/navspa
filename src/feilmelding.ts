export const v2Unmount = (app: string) => `
NAVSPA-appen '${app}' bruker en eldre versjon av NAVSPA for eksportering.
Denne har ett kjent problem med unmounting av komponenten, og det er derfor anbefalt å oppdatere til nyeste versjon.
`.trim();
