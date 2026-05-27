import fs from 'fs';
async function run() {
  const url = 'https://api.github.com/search/repositories?q=user:ThiFigueired0';
  const response = await fetch(url);
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Repos:', data.items?.map(r => r.full_name) || data);
}
run();
