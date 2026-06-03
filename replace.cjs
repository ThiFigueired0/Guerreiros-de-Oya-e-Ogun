const fs = require('fs');
const file = 'src/screens/Trabalhos.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/hover:border-amber-500\/30/g, 'hover:border-white\/20');
data = data.replace(/hover:border-brand-copper\/30/g, 'hover:border-brand-navy\/30');
data = data.replace(/bg-brand-copper shadow-brand-copper\/20/g, 'bg-brand-navy shadow-brand-navy\/20');
data = data.replace(/text-brand-copper/g, 'text-gray-300');
data = data.replace(/border-brand-copper\/50/g, 'border-white\/50');
data = data.replace(/border-brand-copper\/30/g, 'border-white\/30');
data = data.replace(/border-brand-copper\/20/g, 'border-white\/20');
data = data.replace(/border-brand-copper\/10/g, 'border-white\/10');
data = data.replace(/border-brand-copper/g, 'border-gray-500');
data = data.replace(/bg-brand-copper\/5/g, 'bg-white\/5');
data = data.replace(/bg-brand-copper\/10/g, 'bg-white\/10');
data = data.replace(/bg-brand-copper\/20/g, 'bg-white\/10');
data = data.replace(/bg-brand-copper\/30/g, 'bg-white\/20');
data = data.replace(/bg-amber-500\/10/g, 'bg-white\/10');
data = data.replace(/bg-amber-500\/20/g, 'bg-white\/10');
data = data.replace(/text-amber-500/g, 'text-white');
data = data.replace(/bg-brand-copper text-white/g, 'bg-brand-navy text-white');
data = data.replace(/bg-brand-copper/g, 'bg-white');

fs.writeFileSync(file, data);
