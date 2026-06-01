import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Splash screen blur animation fix
content = content.replace(
  /<motion\.div\s*\n*\s*animate={{ \n*\s*opacity: \[0.3, 0.6, 0.3\],\n*\s*scale: \[0.9, 1.1, 0.9\]\n*\s*}}\n*\s*transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}\n*\s*className="absolute -inset-10 bg-gradient-to-br from-brand-copper\/30 to-brand-gold\/20 rounded-full blur-2xl"\n*\s*\/>/gs,
  '<div className="absolute -inset-10 bg-gradient-to-br from-brand-copper/30 to-brand-gold/20 rounded-full blur-2xl animate-pulse" />'
);

// Specifically replace the one in splash screen if the above didn't catch it
content = content.replace(
  /<motion\.div[^>]*className="([^"]*blur-[23]xl[^"]*)"[^>]*animate={{[^>]*scale[^>]*}}[^>]*transition={{[^>]*}}[^>]*\/>/gs,
  '<div className="$1 animate-pulse" />'
);

fs.writeFileSync('src/App.tsx', content);
console.log('Fixed App.tsx blurs');
