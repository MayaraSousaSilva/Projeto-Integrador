const fs = require('fs-extra');
const path = require('path');

const sourceFrontendDir = path.resolve(__dirname, 'root', 'frontend'); // Pasta 'frontend' completa
const destinationDir = path.resolve(__dirname, 'docs'); // Pasta de destino raiz do Pages

console.log(`Preparando deploy do frontend para GitHub Pages...`);
console.log(`Copiando conteúdo de: ${sourceFrontendDir}`);
console.log(`Para a pasta de deploy do GitHub Pages: ${destinationDir}`);

// Garante que a pasta de destino exista e esteja vazia
fs.emptyDirSync(destinationDir);

// COPIA O CONTEÚDO DA PASTA 'public' (que contém index.html) DIRETAMENTE PARA 'docs/'
// O 'index.html' estará diretamente em 'docs/index.html'
fs.copySync(path.join(sourceFrontendDir, 'public'), destinationDir, { overwrite: true });

// COPIA O CONTEÚDO DA PASTA 'src' PARA 'docs/src/'
// Isso garante que 'pages/', 'css/', 'js/' estarão em 'docs/src/'
fs.copySync(path.join(sourceFrontendDir, 'src'), path.join(destinationDir, 'src'), { overwrite: true });

console.log('Cópia do frontend para a pasta docs/ concluída com sucesso!');
console.log('Frontend pronto para deploy no GitHub Pages!');