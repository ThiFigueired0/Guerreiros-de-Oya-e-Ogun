const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens', 'settings');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/bg-\[#1A1A1A\] border-gray-800/g, 'bg-[#161616]/80 backdrop-blur-md border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]');
  content = content.replace(/dark:bg-\[#1A1A1A\]/g, 'dark:bg-[#161616]/80 dark:backdrop-blur-md dark:border-white/5');
  
  fs.writeFileSync(filePath, content);
}

console.log("Updated!");
