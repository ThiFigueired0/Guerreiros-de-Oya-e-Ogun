import https from 'https';
https.get('https://raw.githubusercontent.com/danielstuart14/CSS_FOG_ANIMATION/master/fog1.png', (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
});
