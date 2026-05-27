import fs from 'fs';
async function run() {
  const url = 'https://github.com/ThiFigueired0/Guerreiros-de-Oya-e-Ogun';
  const response = await fetch(url);
  console.log('Status:', response.status);
}
run();
