# Valg Valgomat Algoritme

> Regn ut avstanden mellom et parti og en valogmat-besvarelse.

Regner ut avstanden mellom påstand-standpunktene til et parti og en valgomat-besvarelse.

## Usage

```js
import { closeness } from "@nrk/valg-valgomat-algoritme";

let partiStandpunkt = {
  "1": { value: 1 },
  "2": { value: -1 }
};

let brukerSvar = {
  "1": { value: 0 },
  "2": { value: -2 }
};

let avstand = closeness(partiStandpunkt, brukerSvar); // => 0.75
```

## API

```js
import { closeness } from "@nrk/valg-valgomat-algoritme";
```

### let avstand = closeness(parti, bruker);

Tar inn to sett med svar, et fra et parti og et fra en bruker.

Begge svarene er på samme form:
```js
{
  [statementId: String]: { value: -2 | -1 | 0 | 1 | 2 }
}
```

Parti-svaret vil bli validert etter følgende regler:
- Kan ikke ha svar `0` for noen påstander
- Må ha svar `-2 | -1 | 1 | 2` for alle påstander

Bruker-svaret vil bli validert etter følgende regler:
- Må ha svar `-2 | -1 | 0 | 1 | 2` for alle påstander
- Kan ikke ha svar på en påstand som partiet ikke har besvart

Output vil være et tall mellom `0` og `1` som sier noe om hvor nære de to svarene er i henhold til algoritmen.

## Installation

```sh
npm install @nrk/valg-valgomat-algoritme
```

## See also

- [valg-valgomat](https://github.com/nrkno/valg-valgomat)

## License

UNLICENSED
