import fs from 'fs';
async function run() {
  const url = 'https://api.github.com/users/ThiFigueired0';
  const response = await fetch(url);
  console.log('Status:', response.status);
  const text = await response.text();
  console.log('User info:', text);
}
run();
