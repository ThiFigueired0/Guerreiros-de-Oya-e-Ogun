const fs = require('fs');
let code = fs.readFileSync('src/components/PDFReader.tsx', 'utf8');

code = code.replace(/theme === 'dark' \? "bg-black" : theme === 'sepia' \? "bg-\[#efe5cd\]" : "bg-black\/40"/g, '"bg-[#0A192F]"');
code = code.replace(/theme === 'sepia' \? "text-brand-navy\/40" : "text-white\/40"/g, '"text-white/40"');
code = code.replace(/theme === 'sepia' \? "bg-white border border-black\/10 text-brand-navy" : "bg-black border border-white\/10 text-white"/g, '"bg-[#001F3F] border border-white/10 text-white"');
code = code.replace(/theme === 'sepia' \? "hover:bg-black\/5" : "hover:bg-white\/10"/g, '"hover:bg-white/10"');
code = code.replace(/theme === 'sepia' \? "bg-black\/10" : "bg-white\/20"/g, '"bg-white/20"');
code = code.replace(/theme === 'sepia' \? "bg-\[#efe5cd\] border-black\/10" : "bg-black\/90 border-white\/5 backdrop-blur-2xl"/g, '"bg-[#050B14]/90 border-white/10 backdrop-blur-2xl"');
code = code.replace(/theme === 'sepia' \? "text-brand-navy" : "text-white"/g, '"text-white"');
code = code.replace(/theme === 'sepia' \? "text-brand-navy\/50 hover:text-brand-navy" : "text-white\/40 hover:text-white"/g, '"text-white/40 hover:text-white"');

code = code.replace(/theme === 'sepia'\s*\?\s*"bg-white\/50 text-brand-navy placeholder:text-brand-navy\/30 border border-black\/5 focus:bg-white"\s*:\s*"bg-white\/5 text-white placeholder:text-white\/20 border border-white\/10 focus:bg-white\/10"/g, '"bg-white/5 text-white placeholder:text-white/20 border border-white/10 focus:bg-white/10"');

code = code.replace(/theme === 'sepia' \? "bg-white\/50 border-black\/10" : "bg-white\/5 border-white\/10"/g, '"bg-white/5 border-white/10"');
code = code.replace(/theme === 'sepia' \? "text-brand-navy placeholder:text-brand-navy\/30" : "text-white placeholder:text-white\/30"/g, '"text-white placeholder:text-white/30"');
code = code.replace(/theme === 'sepia' \? "bg-white\/30 border-black\/5 hover:bg-white\/50" : "bg-white\/5 border-white\/10 hover:bg-white\/10"/g, '"bg-white/5 border-white/10 hover:bg-white/10"');
code = code.replace(/theme === 'sepia' \? "bg-white\/30 border-black\/5" : "bg-white\/5 border-white\/10"/g, '"bg-white/5 border-white/10"');

code = code.replace(/theme === 'sepia' \? "hover:bg-brand-red\/10 text-brand-red\/70 hover:text-brand-red" : "hover:bg-brand-red\/20 text-brand-red"/g, '"hover:bg-brand-red/20 text-brand-red"');
code = code.replace(/theme === 'sepia' \? "text-brand-navy\/50" : "text-white\/40"/g, '"text-white/40"');
code = code.replace(/theme === 'sepia' \? "bg-\[#efe5cd\] border-black\/10" : "bg-black\/80 border-white\/10 backdrop-blur-2xl"/g, '"bg-[#050B14]/80 border-white/10 backdrop-blur-2xl"');
code = code.replace(/theme === 'sepia' \? "bg-black\/5 border-black\/10 text-brand-navy hover:bg-brand-copper hover:border-brand-copper hover:text-white" : "bg-white\/5 border-white\/10 text-white hover:bg-brand-copper hover:border-brand-copper"/g, '"bg-white/5 border-white/10 text-white hover:bg-brand-copper hover:border-brand-copper"');

code = code.replace(/theme === 'sepia' \? 'rgba\\(0,0,0,0\\.1\\)' : 'rgba\\(255,255,255,0\\.1\\)'/g, "'rgba(255,255,255,0.1)'");
code = code.replace(/theme === 'sepia' \? "text-brand-navy\/60" : "text-white\/40"/g, '"text-white/40"');
code = code.replace(/theme === 'sepia' \? "bg-transparent text-brand-navy" : "bg-transparent text-white"/g, '"bg-transparent text-white"');

code = code.replace(/const themeFilter = [^;]+;/s, "const themeFilter = 'none';");

fs.writeFileSync('src/components/PDFReader.tsx', code);
