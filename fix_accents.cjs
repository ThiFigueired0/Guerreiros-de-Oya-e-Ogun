const fs = require('fs');

const file = 'src/screens/Trabalhos.tsx';
let data = fs.readFileSync(file, 'utf8');

// TABS
data = data.replace(/bg-white\/\[0.08\] sm:bg-white\/\[0.06\] border border-white\/20 text-white shadow-lg shadow-black\/20/g, 'bg-white/[0.08] sm:bg-white/[0.06] border border-brand-gold/30 text-brand-gold shadow-lg shadow-brand-gold/10');
data = data.replace(/bg-white border-transparent text-brand-navy hover:bg-gray-200/g, 'bg-brand-gold border-transparent text-brand-navy hover:bg-brand-gold/90');

// MAIN BUTTONS (Simulator, Historico)
data = data.replace(/text-gray-300 group-hover:text-white/g, 'text-gray-400 group-hover:text-brand-gold');
data = data.replace(/bg-white\/5 group-hover:bg-white\/10/g, 'bg-white/5 group-hover:bg-brand-gold/10');
data = data.replace(/text-brand-navy group-hover:text-black/g, 'text-brand-navy group-hover:text-brand-navy');
data = data.replace(/bg-black\/\[0.02\] group-hover:bg-black\/10/g, 'bg-black/[0.02] group-hover:bg-brand-navy/10');

// TOTAL CARDS IN SIMULATOR
data = data.replace(/bg-white\/10 border-white\/20" : "bg-white\/10 border-white\/20/g, 'bg-brand-gold/10 border-brand-gold/20" : "bg-brand-navy/5 border-brand-navy/10');

// ICON CONTAINERS and SPECIFIC TEXT
data = data.replace(/"p-2 rounded-xl bg-white\/10 text-gray-300 shrink-0"/g, '"p-2 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0"');
data = data.replace(/"p-2 rounded-xl", settings.darkMode \? "bg-white\/10 text-gray-300"/g, '"p-2 rounded-xl", settings.darkMode ? "bg-brand-gold/20 text-brand-gold"');
data = data.replace(/"p-3 rounded-2xl flex flex-col items-center border", settings.darkMode \? "bg-white\/10 border-white\/20"/g, '"p-3 rounded-2xl flex flex-col items-center border", settings.darkMode ? "bg-brand-gold/10 border-brand-gold/20"');
data = data.replace(/"w-12 h-12 rounded-2xl flex items-center justify-center bg-white\/10"/g, '"w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-gold/10"');
data = data.replace(/"p-3 rounded-2xl bg-white\/10 text-gray-300 active:scale-95 transition-all border border-white\/20"/g, '"p-3 rounded-2xl bg-brand-gold/10 text-brand-gold active:scale-95 transition-all border border-brand-gold/20"');
data = data.replace(/bg-white\/10 text-gray-300/g, 'bg-brand-gold/20 text-brand-gold');
data = data.replace(/"bg-white\/\[0.08\] border-white\/30 text-gray-300/g, '"bg-white/[0.08] border-brand-gold/30 text-brand-gold');
data = data.replace(/"bg-\[#CD7F32\]\/10 border-white\/30 text-gray-300/g, '"bg-[#d4af37]/10 border-brand-gold/30 text-brand-gold');

// PRIMARY ACTIONS
data = data.replace(/"bg-brand-navy shadow-brand-navy\/20" : "bg-brand-navy shadow-brand-navy\/20"/g, '"bg-brand-gold shadow-brand-gold/20 text-brand-navy" : "bg-brand-navy shadow-brand-navy/20"');

// GENERAL TEXT REPLACEMENTS
data = data.replace(/text-gray-300/g, 'text-brand-gold');

// BORDERS
data = data.replace(/border-white\/50/g, 'border-brand-gold/50');
data = data.replace(/hover:border-white\/30 hover:-translate-y-\[2px\]"/g, 'hover:border-brand-gold/30 hover:-translate-y-[2px]"');
data = data.replace(/hover:border-white\/20"/g, 'hover:border-brand-gold/30"');
data = data.replace(/border border-white\/20 text-brand-navy/g, 'border border-gray-100 text-brand-navy');

fs.writeFileSync(file, data);
