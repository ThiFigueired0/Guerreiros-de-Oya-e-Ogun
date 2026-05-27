import fs from 'fs';
console.log(Object.keys(process.env).filter(k => k.toLowerCase().includes('git') || k.toLowerCase().includes('token') || k.toLowerCase().includes('auth')));
