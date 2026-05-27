import fs from 'fs';
async function run() {
  const htmlUrl = 'https://guerreiros-de-oya-e-ogunv1-h8tswxh4r.vercel.app/';
  const htmlRes = await fetch(htmlUrl);
  const html = await htmlRes.text();
  console.log(html);
}
run();
