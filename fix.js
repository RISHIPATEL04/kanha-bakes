const fs = require('fs');
const files = fs.readdirSync(__dirname);

for (const file of files) {
  if (file.endsWith('.html')) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('src="auth.js"')) {
       console.log('Fixing', file);
       fs.writeFileSync(file, text.replace(/src="auth\.js"/g, 'src="client-auth.js"'));
    }
  }
}
// Also replace it in menu.html, login.html... wait, any html file will be fixed.
console.log('Done!');
