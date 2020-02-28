const fs = require('fs');
const copy = require('copy');

fs.rmdirSync('./_build', { recursive: true });
copy(['./src/**/*', './src/**/.*'], './_build', () => {
  console.log('done');
});
