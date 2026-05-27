import fs from 'fs';

async function run() {
  const url = 'https://codeload.github.com/ThiFigueired0/Guerreiros-de-Oya-e-Ogun/zip/5a8549e233d355ff96a68daa63ffdea677800afd';
  console.log('Downloading from', url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync('backup.zip', buffer);
  console.log('Downloaded backup.zip');
}
run().catch(console.error);
