import fs from 'fs';
async function run() {
  const url = 'https://api.github.com/users/thiagosilv184/repos';
  const response = await fetch(url);
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Repos:', data.map?.(r => r.name) || data);
}
run();
