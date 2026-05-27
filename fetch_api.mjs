import fs from 'fs';
async function run() {
  const url = 'https://api.github.com/repos/ThiFigueired0/Guerreiros-de-Oya-e-Ogun';
  const response = await fetch(url);
  console.log('Status:', response.status);
  const data = await response.text();
  console.log('Data:', data.substring(0, 500));
}
run();
