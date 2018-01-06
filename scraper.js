// dependencies
const Crawler = require('crawler');
const fs = require('fs');
const $ = require('cheerio');
const querystring = require('querystring');
const readlineSync = require('readline-sync');

// base functions
function loadFile(filePath, newFileContent = '{}') {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, newFileContent);
    }
    newFileContent = fs.readFileSync(filePath, 'utf8')
    return newFileContent;
}
function userCheck(ncoreUser = {}, property) {
    if (!ncoreUser[property]) {
        ncoreUser[property] = readlineSync.question('What is your nCore ' + property + '? ')
    }
    return ncoreUser;
}
function saveTorrentsInfo(jsonPath, torrents = {}) {
    let imdbIds = [];
    Object.keys(torrents).map((objectKey, index) => {
        imdbIds.push(torrents[objectKey].imdbId);
    });
    fs.writeFileSync(jsonPath, JSON.stringify(imdbIds));
    console.log('\nIt\'s now safe to turn off your computer.');
}
function newQueryParams(mire = new Date().getFullYear(), oldal = 1) {
    return Object.assign({}, baseGetParams, { mire, oldal });
}
function newQueue(crawler, uri, qs = {}, isFile = false, callback) {
    crawler.queue({ uri, qs, isFile, callback });
}
function processTorrent(html = '', allTorrent = {}) {
    $(html).find('.box_torrent').each(function() {
        const $this = $(this);
        const $infoLink = $this.find('.infolink');
        const $link = $this.find('.torrent_txt a');
        const sizeUnit = $this.find('.box_meret2').text().replace(/[\d\.\ ]/g, '').toUpperCase();
        const urlObject = querystring.parse($link.attr('href'));
        const url = nCoreUrl + '?action=download&id=' + urlObject.id + '&key=' + ncoreUser.trackerId;
        const downloads = $this.find('.box_d2').text().length;
        const imdbId = $infoLink.length ? $infoLink.attr('href').match(/\w\w\d\d\d\d\d\d\d/g)[0] : null;
        let size = parseFloat($this.find('.box_meret2').text());

        if (sizeUnit === 'MB') { size = size / 1024 }
        if (sizeUnit === 'KB') { size = size / 1024 / 1024 }

        const torrent = { size, imdbId, downloads, url };

        if (imdbId && downloads >= 5) {
            if (allTorrent[imdbId]) {
                if (allTorrent[imdbId].size > torrent.size) {
                    allTorrent[imdbId] = torrent;
                }
            } else {
                allTorrent[imdbId] = torrent;
            }
        }
    });
}

// get or set nCore user data
const userDataPath = process.env.npm_package_config_userDataJsonPath;
let ncoreUser = JSON.parse(loadFile(userDataPath));
ncoreUser = userCheck(ncoreUser, 'username');
ncoreUser = userCheck(ncoreUser, 'password');
ncoreUser = userCheck(ncoreUser, 'trackerId');
fs.writeFileSync(userDataPath, JSON.stringify(ncoreUser));

// global and important variables
let isTorrentsDownloaded = false;
let torrentsSize = 0;
let allTorrent = {};
const torrentLogJsonPath = process.env.npm_package_config_torrentLogJsonPath;
const watchingYears = process.env.npm_package_config_watchingYears.split(', ');
const nCoreUrl = 'https://ncore.cc/torrents.php';
const allDownloadedTorrent = JSON.parse(loadFile(torrentLogJsonPath, '[]'));
const nCoreCookie = { Cookie: 'nick=' + ncoreUser.username + '; pass=' + ncoreUser.password + ';' };
const baseGetParams = {
    tipus: 'xvid_hun',
    miben: 'name',
    mire: null,
    oldal: 1
};
const downloadPath = process.env.npm_package_config_downloadPath;
if (!fs.existsSync(downloadPath)){
    fs.mkdirSync(downloadPath);
}

// define new crawler
const c = new Crawler({
    maxConnections: 10,
    encoding: null,
    headers: nCoreCookie,
    jQuery: false,
    callback: (error, res, done) => {
        if (error) {
            console.log(error);
        } else if (res.options.isFile) {
            const searchString = res.headers['content-disposition'] || '';
            const filename = (/filename=\"(.*)\"/g).exec(searchString)[1];
            fs.createWriteStream(downloadPath + filename).write(res.body);
            process.stdout.write('.');
        } else {
            processTorrent(res.body.toString('utf8'), allTorrent);
        }
        done();
    }
}).on('drain', function() {
    if (!isTorrentsDownloaded) {
        let torrentsNum = 0;
        isTorrentsDownloaded = true;
        console.log('DONE! Please wait while torrents are downloading... (This process takes a while.)');
        for (const i in allTorrent) {
            if (true || allDownloadedTorrent.indexOf(allTorrent[i].imdbId) === -1) {
                newQueue(c, allTorrent[i].url, null, true);
                torrentsSize += allTorrent[i].size;
                torrentsNum++;
            }
        }
        console.log('Torrents (' + torrentsNum + ') size: ~' + Math.round(torrentsSize) + ' GB');
    } else {
        saveTorrentsInfo(torrentLogJsonPath, allTorrent);
    }
});

// First of all, get all url to scrape
console.log('Finding torrents...');
for (const i in watchingYears) {
    newQueue(c, nCoreUrl, newQueryParams(watchingYears[i], 1), null, (error, res, done) => {
        if (error) {
            console.log(error);
        } else {
            const body = res.body.toString('utf8');
            if (body.indexOf('Nincs találat!') === -1) {
                const totalPages = body.match(/oldal\=.+?[^\D]*/g);
                const foundedPages = parseInt(totalPages[totalPages.length - 1].split('=')[1]) || 1;
                processTorrent(body, allTorrent);
                
                console.log('Search: ' + res.options.qs.mire + '');
                console.log('Found ' + foundedPages + ' pages');
                console.log('============' + Array(String(foundedPages).length + 1).join('='));

                if (foundedPages > 1) {
                    for (let j = 2; j <= foundedPages; j++) {
                        newQueue(c, nCoreUrl, newQueryParams(res.options.qs.mire, j));
                    }
                }
            }
        }
        done();
    });
}
