const reference = require("../data/image-quality-reference.json");

function pick(obj) {
  for (let key in obj) {
    return obj[key];
  }
  throw new Error("Empty object");
}

const qualities = [];
for (let q = 10; q <= 100; q += 5) {
  qualities.push(q);
}

const html = `<!doctype html>
<head>
  <title>AVIF and WebP image quality settings</title>
</head>
<link rel="preload" as="fetch" href="./data/image-quality-reference.json" crossorigin>
<link rel="preload" as="fetch" href="./data/image-quality.json" crossorigin>
<link rel="stylesheet" href="./styles.css"/>
<script defer src="./ui.js"></script>
<link type="image/png" rel="icon" href="https://www.industrialempathy.com/img/favicon/favicon-192x192.png?hash=2089033c93">
<body>
<article>
<h2>AVIF and WebP quality settings picker</h2>

<p>
  This tool allows picking the right quality setting for encoding AVIF and 
  WebP images such that their quality matches the quality of a JPEG of a given
  quality setting. By default the tool will <b>automatically</b> pick the quality
  setting such that the visual difference (as determined by 
  <a href="https://github.com/kornelski/dssim" target="_blank">dssim</a>) is no worse 
  than the JPEG is from the source image.
</p>

<p>For additional context and detail, <a href="https://www.industrialempathy.com/posts/avif-webp-quality-settings/">check out my accompanying blog post.</a></p>

<h3>Image options</h3>
<select id="sample" aria-label="Sample image" onchange="loadImages()">
${Object.keys(reference).map((sample) => {
  const name = sample.replace("./quality-samples/", "");
  return `<option ${
    name == "sample1.jpg" ? "selected" : ""
  } value="${sample}">${name}</option>`;
})}
</select>
<select id="width" aria-label="Image width" onchange="loadImages()">
${Object.keys(pick(reference)).map((sample) => {
  return `<option ${
    sample == "640" ? "selected" : ""
  } value="${sample}">${sample}px width</option>`;
})}
</select>
<select id="quality" aria-label="JPEG reference quality setting" onchange="loadImages()">
${Object.keys(pick(pick(reference))).map((sample) => {
  return `<option ${
    sample == "60" ? "selected" : ""
  } value="${sample}">${sample} JPEG quality</option>`;
})}
</select>
<select id="format" aria-label="Image format" onchange="loadImages()">
${Object.keys(pick(pick(pick(reference)))).map((sample) => {
  return `<option value="${sample}">${sample.toUpperCase()}</option>`;
})}
</select>
<select id="formatQuality" aria-label="Format quality" onchange="loadImages()">
  <option value="BEST">Best match for JPEG quality</option>
  ${qualities.map((sample) => {
    return `<option value="${sample}">Quality ${sample}</option>`;
  })}
</select>
<select id="dpi" aria-label="DPI" onchange="loadImages()">
  <option value="1">1x DPI</option>
  <option selected value="2">2x DPI</option>
  <option value="3">3x DPI</option>
</select>
<div id="output" style="display:none" aria-live="polite">
  <h3 id="images">Images</h3>
  <table aria-labelledby="images">
    <tr>
      <th id="referenceHeader"></th>
      <th id="formatHeader"></th>
    </tr>
    <tr>
      <td id="referenceImage" aria-label="Reference image"></td>
      <td id="formatImage" aria-label="Image with selected options"></td>
    </tr>
  </table>
  <dl>
    <dt>Size reduction compared to JPEG</dt>
    <dd id="sizeReduction"></dd>
    <dt>DSSIM similarity to source image</dt>
    <dd id="dssim"></dd>
  </dl>
</div>
<p>
  <a href="https://www.industrialempathy.com/" target="_top">Made by Malte Ubl</a>
</p>
</article>
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-141920860-1"></script>
<script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'UA-141920860-1');</script>
</body>`;

require("fs").writeFileSync("./index.html", html);
