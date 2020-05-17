const fs = require('fs').promises;
const pdf = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const { lastIndexOf, map, pipe, endsWith, filter, includes } = require('ramda');
const { forEachAsync, fileName, saveReport, getReportFiles } = require('./utils');

async function scratchPage(month) {
    try {
        const resp = await axios.get('https://www.argentina.gob.ar/coronavirus/informe-diario/' + month + '2020', {
            responseType: 'arraybuffer',
        });

        return resp.data;
    } catch {}
}

function getLinks(html) {
    const $ = cheerio.load(html);
    const links = $('.downloads a').get();

    return links.map((m) => m.attribs.href);
}

async function getPdfContent(url) {
    const resp = await axios.get(url, {
        responseType: 'arraybuffer',
    });

    return resp.data;
}

exports.download = async function (month) {
    const html = await scratchPage(month);

    if (!html) {
        console.error('No page found for the month of:', month);
        process.exit(1);
    }

    const links = getLinks(html);

    console.log('Links found:', links);

    const existingReports = map((m) => fileName(m), await getReportFiles());

    await forEachAsync(async (link) => {
        const reportName = fileName(link);

        if (includes(reportName, existingReports)) {
            console.log('Report found:', reportName);

            return;
        }

        console.log('Downloading report:', reportName);

        const pdf = await getPdfContent(link);
        await saveReport(reportName, pdf);
    }, links);
};
