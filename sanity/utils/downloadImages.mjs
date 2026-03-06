import fs from 'fs';
import path from 'path';
import axios from 'axios';

const JSON_PATH = 'C:/webdev/sang-logium/app/components/features/homepage/product-spotlights-dump/focal_utopia_dump.json';
const TARGET_DIR = 'C:/webdev/sang-logium/app/components/features/homepage/product-spotlights-dump/focal_utopia_dump_images';

async function downloadImage(url, folder) {
    if (!url) return;

    const fileName = path.basename(new URL(url).pathname);
    const filePath = path.join(folder, fileName);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
    }
}

async function run() {
    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
    const imageUrls = [];

    if (data.image?.asset?.url) {
        imageUrls.push(data.image.asset.url);
    }

    if (Array.isArray(data.gallery)) {
        data.gallery.forEach(item => {
            if (item.asset?.url) imageUrls.push(item.asset.url);
        });
    }

    console.log(`Starting download of ${imageUrls.length} images...`);

    for (const url of imageUrls) {
        await downloadImage(url, TARGET_DIR);
        console.log(`Downloaded: ${path.basename(url)}`);
    }

    console.log('All downloads complete.');
}

run();