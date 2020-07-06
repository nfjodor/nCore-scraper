const Crawler = require("crawler");
const {
  PAGE_COUNT_REGEX,
  SEARCH_TYPE,
  SEARCH_CATEGORIES,
  SEARCH_IN,
  NCORE_URL,
} = require("../constants");
const processPage = require("./process-page");

const currentYear = new Date().getFullYear();
const searchBaseParams = {
  tipus: SEARCH_TYPE,
  kivalasztott_tipus: SEARCH_CATEGORIES,
  miben: SEARCH_IN,
};

const defaultOptions = {
  ncoreUrl: NCORE_URL,
  searchTerms: [currentYear - 1, currentYear],
  searchBaseParams,
  debug: false,
};

function crawler(options) {
  this.options = {
    ...defaultOptions,
    ...options,
  };
  this.watchingSearchTerms = {};
  this.movieList = {};
  this.crawler = new Crawler({
    maxConnections: 8,
    headers: {
      Cookie: `nick=${this.options.nCoreUser}; pass=${this.options.nCorePass};`,
    },
  });
}

crawler.prototype.queue = function (callback, mire = null, oldal = 1) {
  this.crawler.queue({
    uri: this.options.ncoreUrl,
    qs: {
      ...this.options.searchBaseParams,
      mire,
      oldal,
    },
    callback,
  });
};

crawler.prototype.getPages = function () {
  return new Promise((resolve) => {
    this.options.searchTerms.forEach((year) => {
      this.queue((err, res, done) => {
        const pagesRawArray = res.$.html("#pager_top a").match(
          PAGE_COUNT_REGEX
        ) || ["=1"];
        this.watchingSearchTerms[res.options.qs.mire] = parseInt(
          pagesRawArray.pop().split("=").pop()
        );
        done();
      }, year);
    });
    this.crawler.on("drain", () => {
      resolve(this.watchingSearchTerms);
    });
  });
};

crawler.prototype.getMovies = async function () {
  if (!Object.keys(this.watchingSearchTerms).length) {
    await this.getPages();
  }
  return new Promise((resolve) => {
    Object.keys(this.watchingSearchTerms).forEach((year) => {
      for (let page = 0; page < this.watchingSearchTerms[year]; page++) {
        this.queue(
          (err, res, done) => {
            processPage(res.$, this.movieList, this.options.debug);
            done();
          },
          year,
          page
        );
      }
    });
    this.crawler.on("drain", () => {
      if (this.options.debug) {
        process.stdout.write("\n");
      }
      resolve(this.movieList);
    });
  });
};

module.exports = crawler;
