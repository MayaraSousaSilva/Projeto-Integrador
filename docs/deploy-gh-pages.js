// deploy-gh-pages.js
const fs = require('fs-extra'); // Instale: npm install fs-extra
const path = require('path');

const sourceDir = path.resolve(__dirname, 'root', 'frontend');
const destinationDir = path.resolve(__dirname, 'docs');

console.log(`Copiando frontend de: ${sourceDir}`);
console.log(`Para a pasta de deploy do GitHub Pages: ${destinationDir}`);

// Garante que a pasta de destino exista e esteja vazia
fs.emptyDirSync(destinationDir);

// Copia o conteúdo do frontend para a pasta docs
fs.copySync(sourceDir, destinationDir, { overwrite: true });

console.log('Cópia do frontend para a pasta docs/ concluída com sucesso!');

// Opcional: Se seu site usa caminhos absolutos como '/css/style.css'
// e o GitHub Pages o serve em uma subpasta (como nomedeusuario.github.io/repositorio/),
// você pode precisar ajustar a base URL no index.html.
// Para este projeto, como estamos usando paths relativos como 'css/style.css' ou 'pages/login.html'
// dentro dos HTMLs, isso geralmente não é necessário, mas é algo a observar.

console.log('Frontend pronto para deploy no GitHub Pages!');