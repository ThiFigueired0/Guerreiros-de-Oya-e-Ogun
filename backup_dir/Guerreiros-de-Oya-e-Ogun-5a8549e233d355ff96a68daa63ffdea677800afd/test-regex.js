const entities = [
  'oxalá', 'iemanjá', 'oxum', 'ogum', 'xangô', 'iansã', 'oxóssi', 'obaluaiê', 'omulu', 'nanã', 'exu', 'pombagira', 'pomba gira', 'caboclo', 'preto velho', 'preta velha', 'erê', 'zé pelintra', 'oxumaré', 'logun edé', 'obá', 'ewa', 'ossain', 'iroko', 'zambi', 'olorun', 'umbanda', 'candomblé', 'olodumaré', 'olodumare'
];
const sortedEntities = entities.sort((a, b) => b.length - a.length);

const r = new RegExp(`(?<=^|[^a-zA-ZÀ-ÿ\\*])(${sortedEntities.join('|')})(?=[^a-zA-ZÀ-ÿ\\*]|$)`, 'gi');
console.log("Replaced:", "oxalá e iemanjá e **ogum** e zé pelintra. Também umbanda e candomblé! olodumare. *exu*".replace(r, '**$1**'));
