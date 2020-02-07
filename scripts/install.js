/* eslint-disable no-console */
const path = require('path');
const { promisify } = require('util');
const eos = promisify(require('end-of-stream'));
const pump = require('pumpify');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const root = require('rootrequire');

const libheifDir = path.resolve(root, 'libheif');
const libheif = path.resolve(libheifDir, 'libheif.js');
const libheifLicense = path.resolve(libheifDir, 'LICENSE');

const version = 'v1.6.2';

const base = `https://github.com/catdad-experiments/libheif-emscripten/releases/download/${version}`;
const lib = `${base}/libheif.js`;
const license = `${base}/LICENSE`;

const responseStream = async url => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`failed response: ${res.status} ${res.statusText}`);
  }

  return res.body;
};

(async () => {
  await fs.ensureDir(libheifDir);

  await eos(pump(await responseStream(lib), fs.createWriteStream(libheif)));
  await eos(pump(await responseStream(license), fs.createWriteStream(libheifLicense)));
})().then(() => {
  console.log(`fetched libheif ${version}`);
}).catch(err => {
  console.error(`failed to fetch libheif ${version}\n`, err);
  process.exitCode = 1;
});
