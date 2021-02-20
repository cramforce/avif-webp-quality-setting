const aspectRatios = {
  "./quality-samples/sample0": 320 / 180,
  "./quality-samples/sample1": 320 / 480,
  "./quality-samples/sample2": 320 / 480,
  "./quality-samples/sample3": 320 / 480,
};

function $(id) {
  return document.getElementById(id);
}

function val(id) {
  const select = $(id);
  return select.options[select.selectedIndex].value;
}

async function getData() {
  return {
    reference: await (
      await fetch("./data/image-quality-reference.json")
    ).json(),
    info: await (await fetch("./data/image-quality.json")).json(),
  };
}

function updateDimensions() {
  if (parent != window) {
    parent.postMessage(
      {
        height: document.body.offsetHeight,
      },
      "*"
    );
  }
}

const dataPromise = getData();

async function loadImages() {
  const data = await dataPromise;
  const sample = val("sample");
  const width = val("width");
  const quality = val("quality");
  const format = val("format");
  const dpi = parseFloat(val("dpi"));
  const fileBase = sample.replace(/\.\w+$/, "");
  const referenceUrl = `${fileBase}-${width}-jpeg-${quality}.jpeg`;
  const realHeight = Math.round(parseInt(width) / aspectRatios[fileBase] / dpi);
  const realWidth = Math.round(width / dpi);
  $("referenceHeader").textContent = `JPEG image at quality ${quality}`;
  $(
    "referenceImage"
  ).innerHTML = `<img width="${realWidth}" height=${realHeight} src="${referenceUrl}">`;

  const best = data.reference[sample][width][quality][format];

  const formatQuality =
    val("formatQuality") == "BEST" ? best.quality : val("formatQuality");
  const info = data.info[sample][width][format][formatQuality];
  const ref = data.info[sample][width]["jpeg"][quality];
  $("sizeReduction").textContent = `${
    100 - Math.round((info.size / ref.size) * 100)
  }%`;
  $("dssim").textContent = info.dssim;

  const formatUrl = `${fileBase}-${width}-${format}-${formatQuality}.${format}`;
  $(
    "formatHeader"
  ).textContent = `${format.toUpperCase()} image at quality ${formatQuality}`;
  $(
    "formatImage"
  ).innerHTML = `<img width="${realWidth}" height=${realHeight} src="${formatUrl}" onerror="alert('Your browser may not yet support ${format.toUpperCase()} images.')">`;
  $("output").style.display = "block";
  updateDimensions();
}

loadImages();

window.onresize = updateDimensions;
