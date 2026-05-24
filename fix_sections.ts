import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('</section>') && i > 313 && i < 640) {
        lines[i] = lines[i].replace('</section>', '</motion.section>');
    }
    if (lines[i].includes('<section ') && i == 639) { // Line 640 is index 639
        lines[i] = lines[i].replace('<section ', '<motion.section variants={itemVariants} ');
    }
    if (lines[i].includes('<section ') && i == 850) { // Line 851 is index 850
        lines[i] = lines[i].replace('<section ', '<motion.section variants={itemVariants} ');
    }
    if (lines[i].includes('</section>') && i == 1104) {
        lines[i] = lines[i].replace('</section>', '</motion.section>');
    }
}
fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
