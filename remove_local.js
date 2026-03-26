const fs = require('fs');
const files = fs.readdirSync(__dirname);

files.forEach(f => {
    if (f !== 'server.js' && f !== 'README.md' && (f.endsWith('.html') || f.endsWith('.js'))) {
        let content = fs.readFileSync(f, 'utf8');
        if (content.includes('')) {
            content = content.replace(/http:\/\/localhost:3000/g, '');
            fs.writeFileSync(f, content);
            console.log('Fixed:', f);
        }
    }
});
