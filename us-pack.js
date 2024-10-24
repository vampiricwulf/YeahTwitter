/*
This script generates Firefox version of the extension and packs Chrome and Firefox versions to zip files.
Node.js v16.6.1 recommended.
*/

const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');


console.log("Creating userscript...");
let manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
let rosetta = fs.readFileSync('./fonts/rosetta.woff', 'base64');
let fullCode = fs.readFileSync('./us.js', 'utf8')
    .replaceAll('${manifest.version}', manifest.version)
    .replaceAll('{{font_url}}', rosetta);

// Embed images due to CSP
const embeddedImages = ['yeah_moom_on32.png', 'yeah_moom_off32.png', 'loading.svg'];
for(let img of embeddedImages) {
    fullCode += `\nYEAH_images['${img}'] = 'data:${img.endsWith('.svg') ? 'image/svg+xml' : 'image/png'};charset=utf-8;base64,${fs.readFileSync(`./images/${img}`, 'base64')}'`
}

for(let i in manifest.content_scripts) {
    let script = manifest.content_scripts[i];
    for(let j in script.js) {
        let code = fs.readFileSync(script.js[j], 'utf8')
            .replaceAll('fetch(', 'GM_fetch(')
            .replace(/chrome\.runtime\.getURL\('(.+?)'\)/gm, "'https://raw.githubusercontent.com/vampiricwulf/YeahTwitter/main/$1'");

        for(let img of embeddedImages) {
            code = code.replaceAll(`'https://raw.githubusercontent.com/vampiricwulf/YeahTwitter/main/images/${img}'`, `YEAH_images['${img}']`);
        }

        fullCode += `\n\n// ${script.js[j]}\n` + code;
    }
}

fs.writeFileSync('./build/userscript.js', fullCode);
});
