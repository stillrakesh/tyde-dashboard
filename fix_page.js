const fs = require('fs');
let code = fs.readFileSync('app/page.js', 'utf8');
code = code.replace(/initialTab/g, "'overview'");
fs.writeFileSync('app/page.js', code);
console.log('Fixed initialTab');
