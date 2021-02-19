const { promisify } = require("util");
const sharp = require("sharp");
const stat = promisify(require("fs").stat);
const exists = promisify(require("fs").exists);
const execFile = promisify(require("child_process").execFile);

const DATA = require("../data/image-quality.json");
const SAMPLE_PATH = "./quality-samples";

async function getFilename(input, format, width, quality, extension) {
  const prefix = input
    .replace(`${SAMPLE_PATH}/`, "")
    .replace(/\.\w+$/, "")
    .replace(/\W/g, "-");
  return `${SAMPLE_PATH}/${prefix}-${width}-${format}-${quality}.${extension}`;
}

async function makeImage(input, format, width, quality) {
  const filename = await getFilename(input, format, width, quality, format);

  if (!(await imageExists(filename))) {
    await sharp(input)
      .rotate() // Manifest rotation from metadata
      .resize(width)
      [format]({
        quality,
        reductionEffort: 6,
      })
      .toFile(filename);
  }
  if (format == "png") {
    return {
      filename,
      png: filename,
    };
  }
  const png = await getFilename(input, format, width, quality, "png");
  if (!(await imageExists(png))) {
    await sharp(filename).png().toFile(png);
  }
  return {
    filename,
    png,
  };
}

async function imageExists(filename) {
  if (!(await exists(filename))) {
    return false;
  }
  const stats = await stat(filename);
  if (stats.size == 0) {
    return false;
  }
  return true;
}

async function getImageData(input, referenceFile, format, width, quality) {
  const image = await makeImage(input, format, width, quality);
  const stats = await stat(image.filename);
  const dssim = parseFloat(
    (await execFile("dssim", [referenceFile, image.png])).stdout.split(/\t/)[0]
  );
  return {
    size: stats.size,
    dssim,
  };
}

function print(input, format, width, quality, info) {
  const data = [format, width, quality, info.size, info.dssim, input];
  console.log(data.join("\t"));
}

async function testImage(filename) {
  DATA[filename] = DATA[filename] || {};
  for (let width of [160, 320, 640, 1280, 1920]) {
    DATA[filename][width] = DATA[filename][width] || {};
    const referenceFile = (await makeImage(filename, "png", width, 100))
      .filename;
    const promises = [];
    for (let format of ["webp", "jpeg", "avif"]) {
      DATA[filename][width][format] = DATA[filename][width][format] || {};
      let i = 0;
      for (let quality = 10; quality <= 100; quality += 5) {
        const existingData = DATA[filename][width][format][quality];
        if (existingData) {
          print(filename, format, width, quality, existingData);
          continue;
        }
        const p = getImageData(filename, referenceFile, format, width, quality);
        p.then((info) => {
          DATA[filename][width][format][quality] = info;
          print(filename, format, width, quality, info);
        });
        promises.push(p);
        if (i++ % 5 == 0) {
          // Reduce concurrency a bit to avoid crashing the computer.
          await Promise.all(promises);
        }
      }
    }
    await Promise.all(promises);
  }
}

async function run() {
  const promises = [];
  for (let input of [
    `${SAMPLE_PATH}/sample0.jpg`,
    `${SAMPLE_PATH}/sample1.jpg`,
    `${SAMPLE_PATH}/sample2.jpg`,
    `${SAMPLE_PATH}/sample3.jpg`,
  ]) {
    promises.push(testImage(input));
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    console.error(e.stack);
    return;
  }
  require("fs").writeFileSync(
    "./data/image-quality.json",
    JSON.stringify(DATA, null, " ")
  );
}

console.log(
  ["format", "width", "quality", "size", "dssim", "filename"].join("\t")
);
run();
