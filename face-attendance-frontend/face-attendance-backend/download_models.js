const fs = require('fs');
const https = require('https');
const path = require('path');

const models = [
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
    'ssd_mobilenetv1_model-shard2',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const outputDir = path.join(__dirname, 'models_weights');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

models.forEach(file => {
    const fileUrl = baseUrl + file;
    const filePath = path.join(outputDir, file);

    const fileStream = fs.createWriteStream(filePath);
    https.get(fileUrl, function (response) {
        response.pipe(fileStream);
        fileStream.on('finish', function () {
            fileStream.close();
            console.log(`Downloaded ${file}`);
        });
    }).on('error', function (err) {
        fs.unlink(filePath);
        console.error(`Error downloading ${file}: ${err.message}`);
    });
});
