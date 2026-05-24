import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Find all matches for motion.div opening and closing
const iter = content.matchAll(/<(\/?)motion\.div\b[^>]*>/g);
let divCount = 0;
for (const match of iter) {
    if (match[1] === '/') {
        divCount--;
    } else {
        divCount++;
    }
    console.log(`${match.index} : count = ${divCount} : ${match[0]}`);
}

// Same for motion.section
const iter2 = content.matchAll(/<(\/?)motion\.section\b[^>]*>/g);
let sectionCount = 0;
for (const match of iter2) {
    if (match[1] === '/') {
        sectionCount--;
    } else {
        sectionCount++;
    }
    console.log(`SECTION ${match.index} : count = ${sectionCount} : ${match[0]}`);
}

