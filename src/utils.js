const { lastIndexOf, map, pipe, endsWith, filter } = require('ramda');
const fs = require('fs').promises;

exports.forEachAsync = async function (cb, list) {
    for (const item of list) {
        await cb(item);
    }
};

exports.fileName = function (file) {
    const index = lastIndexOf('/', file);
    return file.slice(index + 1);
};

exports.getReportFiles = async function () {
    const files = await fs.readdir('./reportes');
    return pipe(
        map((m) => `./reportes/${m}`),
        filter((f) => endsWith('.pdf', f))
    )(files);
};

exports.saveReport = (filename, data) => fs.writeFile(`./reportes/${filename}`, data);
