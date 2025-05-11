const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, '../public/favicon.ico');
const outputDir = path.join(__dirname, '../public');

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les icônes pour chaque taille
sizes.forEach(size => {
  sharp(inputIcon)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(info => console.log(`Génération de l'icône ${size}x${size} réussie`))
    .catch(err => console.error(`Erreur lors de la génération de l'icône ${size}x${size}:`, err));
});
