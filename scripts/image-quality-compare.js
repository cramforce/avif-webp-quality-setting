const data = require("../data/image-quality.json");

for (let filename in data) {
  for (let width in data[filename]) {
    const formats = data[filename][width];
    for (let refQuality of [50, 60, 70, 80]) {
      const ref = formats.jpeg[refQuality];
      for (let format of ["webp", "avif"]) {
        for (let quality in formats[format]) {
          const info = formats[format][quality];
          if (
            info.dssim <= ref.dssim ||
            Math.abs(info.dssim - ref.dssim) <= 0.0005
          ) {
            console.log(
              [
                width,
                refQuality,
                format,
                quality,
                `${Math.round((info.size / ref.size) * 100)}%`,
                filename,
              ].join("\t")
            );
            break;
          }
        }
      }
    }
  }
}
