import fs from 'fs';
import path from 'path';

const sourceDir = './backup_dir/Guerreiros-de-Oya-e-Ogun-5a8549e233d355ff96a68daa63ffdea677800afd';

try {
  fs.rmSync('./src', { recursive: true, force: true });
  fs.rmSync('./public', { recursive: true, force: true });
  
  fs.cpSync(path.join(sourceDir, 'src'), './src', { recursive: true });
  if (fs.existsSync(path.join(sourceDir, 'public'))) {
    fs.cpSync(path.join(sourceDir, 'public'), './public', { recursive: true });
  }
  if (fs.existsSync(path.join(sourceDir, 'index.html'))) {
    fs.copyFileSync(path.join(sourceDir, 'index.html'), './index.html');
  }
  if (fs.existsSync(path.join(sourceDir, 'package.json'))) {
    fs.copyFileSync(path.join(sourceDir, 'package.json'), './package.json');
  }
  if (fs.existsSync(path.join(sourceDir, 'vite.config.ts'))) {
    fs.copyFileSync(path.join(sourceDir, 'vite.config.ts'), './vite.config.ts');
  }

  console.log('Restoration complete!');
} catch (e) {
  console.error(e);
}
