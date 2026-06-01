import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Replace continuous scale animations on blur elements with static divs to improve performance
content = content.replace(
  /<motion\.div\s*className="([^"]*blur-[^"]*)"\s*animate={{.*?}}\s*transition={{.*?}}\s*\/>/gs,
  '<div className="$1 opacity-60 pointer-events-none" />'
);

content = content.replace(
  /<motion\.div\s+className="([^"]*blur-[^"]*)"\n\s*animate={{.*?}}\n\s*transition={{.*?}}\n\s*\/>/gs,
  '<div className="$1 opacity-60 pointer-events-none" />'
);

// Specifically for Home.tsx
content = content.replace(
  /<motion\.div[^>]*className="([^"]*blur-2xl[^"]*)"[^>]*animate={{[^>]*}}[^>]*transition={{[^>]*}}[^>]*\/>/gs,
  '<div className="$1 opacity-60 pointer-events-none" />'
);

content = content.replace(
  /<motion\.div[^>]*className="([^"]*blur-3xl[^"]*)"[^>]*animate={{[^>]*}}[^>]*transition={{[^>]*}}[^>]*\/>/gs,
  '<div className="$1 opacity-60 pointer-events-none" />'
);

fs.writeFileSync('src/screens/Home.tsx', content);
console.log('Fixed Home.tsx blurs');
