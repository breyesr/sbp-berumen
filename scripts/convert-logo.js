const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(process.cwd(), 'src/app/icon.svg');
const appleIconPath = path.join(process.cwd(), 'src/app/apple-icon.png');
const ogImagePath = path.join(process.cwd(), 'public/og-image.png');

async function convert() {
    try {
        const svgBuffer = fs.readFileSync(svgPath);

        // 1. Generate Apple Icon (180x180)
        await sharp(svgBuffer)
            .resize(180, 180)
            .png()
            .toFile(appleIconPath);
        console.log('Generated apple-icon.png');

        // 2. Generate OG Image (1200x630)
        // We center the logo in a 1200x630 canvas with a subtle padding
        await sharp({
            create: {
                width: 1200,
                height: 630,
                channels: 4,
                background: { r: 250, g: 250, b: 248, alpha: 1 } // Warm Alabaster
            }
        })
        .composite([{
            input: await sharp(svgBuffer).resize(400, 400).toBuffer(),
            gravity: 'center'
        }])
        .png()
        .toFile(ogImagePath);
        console.log('Generated og-image.png');

    } catch (err) {
        console.error('Conversion failed:', err);
    }
}

convert();
