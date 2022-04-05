# navspa-react-17-adapter

Adapter pakke for å bruke [NAVSPA](https://www.npmjs.com/package/@navikt/navspa) til å eksportere applikasjoner skrevet med react@17 eller tidligere.

```typescript
import NAVSPA from '@navikt/navspa';
import { React17Adapter } from '@navikt/navspa-react-17-adapter';

NAVSPA.setAdapter(new React17Adapter());
```