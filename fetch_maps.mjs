import fs from 'fs';
async function run() {
  const cssUrl = 'https://guerreiros-de-oya-e-ogunv1-h8tswxh4r.vercel.app/assets/index.css'; // Just testing paths. Vercel Vite dist usually has index-[hash].css and index-[hash].js
  const htmlUrl = 'https://guerreiros-de-oya-e-ogunv1-h8tswxh4r.vercel.app/';
  const htmlRes = await fetch(htmlUrl);
  const html = await htmlRes.text();
  console.log('HTML length:', html.length);
  
  // Find JS assets
  const jsMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
  if (jsMatch) {
    const jsUrl = 'https://guerreiros-de-oya-e-ogunv1-h8tswxh4r.vercel.app' + jsMatch[1];
    console.log('Found JS:', jsUrl);
    const jsRes = await fetch(jsUrl);
    const jsCode = await jsRes.text();
    console.log('JS map comment:', jsCode.slice(-100));
    
    // Check for source map
    const mapUrl = jsUrl + '.map';
    const mapRes = await fetch(mapUrl);
    console.log('Map status:', mapRes.status);
    if(mapRes.ok) {
       console.log('Source maps are available!');
    } else {
       console.log('No source maps.');
    }
  } else {
    console.log('No JS assets found in HTML.');
  }
}
run();
