
const path = require('path');
const fs = require('fs');

const argv = require('minimist')(process.argv.slice(2));
const Jimp = require('jimp');

let {
  cols,
  rows,
  skipStart,
  skipEnd,
  outPrefix,
  outFolder,
  file
} = argv;

if(!file) {
  console.error('Must pass in a --file to slice and dice.');
  process.exit(0);
}

const fileExt = path.extname(file);

if(!cols) cols = 1;
if(!rows) rows = 1;
if(!skipStart) skipStart = 0;
if(!skipEnd) skipEnd = 0;
if(!outFolder) outFolder = process.cwd() + '/' + path.basename(file, fileExt);

console.log(`Slicing ${file} into ${cols} column(s) and ${rows} row(s), skipping ${skipStart} at the start and ${skipEnd} at the end...`);
console.log(`Result files will be placed in ${outFolder} and prefixed with ${outPrefix || 'nothing'}`);

if(!fs.existsSync(outFolder)) fs.mkdirSync(outFolder);

Jimp.read(file)
  .then(async image => {
    const imageWidth = image.bitmap.width / cols;
    const imageHeight = image.bitmap.height / rows;

    const totalImages = cols * rows;

    console.log(`W: ${image.bitmap.width} H: ${image.bitmap.height} IW: ${imageWidth} IH: ${imageHeight}`);

    for(let y = 0; y < rows; y++) {
      for(let x = 0; x < cols; x++) {
        const curIndex = (y * cols) + x;
        const fileName = `${outPrefix ? outPrefix + '-' : ''}${curIndex}${fileExt}`;

        if(curIndex < skipStart || curIndex >= totalImages - skipEnd) {
          console.log(`Skipping image ${curIndex}`);
          continue;
        }

        console.log(`Splitting image #${curIndex}`);
        const clone = image.clone();

        clone.crop(imageWidth * x, imageHeight * y, imageWidth, imageHeight);
        clone.write(`${outFolder}/${fileName}`);
      }
    }
  })
  .catch(err => {
    console.error(err);
  });