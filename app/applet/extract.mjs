import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('Unzipping...');
execSync('npx -y extract-zip-cli backup.zip -d backup_dir', { stdio: 'inherit' });
console.log('Listing backup_dir:');
console.log(fs.readdirSync('backup_dir'));
