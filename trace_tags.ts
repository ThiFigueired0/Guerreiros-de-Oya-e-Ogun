import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

let stack = [];
let regex = /<\/?([a-zA-Z0-9_.-]+)(\s[^>]*)?>/g;
let match;
while ((match = regex.exec(content)) !== null) {
    let fullMatch = match[0];
    let tagName = match[1];
    
    // Ignore self closing
    if (fullMatch.endsWith('/>')) continue;
    
    // Ignore br, hr, img, input
    if (['br', 'hr', 'img', 'input', 'span', 'path', 'svg', 'a', 'p', 'h2', 'h3', 'h4', 'button', 'br'].includes(tagName)) continue;

    if (fullMatch.startsWith('</')) {
        let top = stack.pop();
        if (top && top.name !== tagName) {
            console.log(`ERROR Mismatch! Opened ${top.name} at id ${top.id}, but closing ${tagName} at ${match.index}`);
            // don't abort, just log
        }
    } else {
        stack.push({ name: tagName, id: match.index, line: content.substring(0, match.index).split('\n').length });
    }
}
if (stack.length > 0) {
    console.log("Unclosed tags remaining:", stack.map(s => s.name + " at line " + s.line));
} else {
    console.log("All tags balanced.");
}
