const fs = require('fs');
const file = 'src/screens/Trabalhos.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/hover:border-white\/20 hover:-translate-y-\[2px\]"/g, 'hover:border-brand-gold/30 hover:-translate-y-[2px]"');
data = data.replace(/hover:border-white\/20 text-white"/g, 'hover:border-brand-gold/30 text-white"');

fs.writeFileSync(file, data);
