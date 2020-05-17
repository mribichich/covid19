const fs = require('fs').promises;
const pdf = require('pdf-parse');
const { lastIndexOf, map, pipe, endsWith, filter, includes } = require('ramda');
const { forEachAsync, fileName, getReportFiles } = require('./utils');
const { program } = require('commander');
const { download } = require('./download');

const readReportContent = async (file) => {
    const data = await fs.readFile(file);
    return pdf(data);
};

const provinces = [
    'Buenos Aires',
    'Ciudad de Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
];

async function printPerProvince(month) {
    const files = await getReportFiles();

    await forEachAsync(async (file) => {
        const date = /(\d{2}-\d{2}-\d{2})/.exec(fileName(file))[0];

        const data = await readReportContent(file);

        console.log(date + '\n');

        provinces.forEach((f) => {
            const x = new RegExp(`^-?\\s*${f} (\\d*)\\** \\| (\\d*)\\**`, 'gm').exec(data.text);

            console.log(f + ': ' + x.slice(1));
        });

        console.log('\n');
    }, files);
}

async function printRecovered(month) {
    const files = await getReportFiles();

    await forEachAsync(
        async (file) => {
            const date = /(\d{2}-\d{2}-\d{2})/.exec(fileName(file))[0];

            const data = await readReportContent(file);

            console.log(date + '\n');

            const x = new RegExp(`total de altas es de ([\\d.]*) personas`, 'gm').exec(data.text);

            console.log('Altas: ' + x);

            console.log('\n');
        },
        filter((f) => includes('matutino', f), files)
    );
}

program
    .command('download <month>')
    .description('download all the reports for a month')
    .action((month) => {
        download(month);
    });

program
    .command('printProvince')
    .description('print all the reports for a month')
    .action((month) => {
        printPerProvince(month);
    });

program
    .command('printRecovered')
    .description('print all the recovered reports for a month')
    .action((month) => {
        printRecovered(month);
    });

program.parse(process.argv);
