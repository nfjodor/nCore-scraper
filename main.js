import Crawler from './helpers/crawler';
import { pages as pagesConsole, message } from './helpers/console';
const currentYear = new Date().getFullYear();
const defaultOptions = {
  searchTerms: [currentYear - 1, currentYear],
  debug: false
};

export default class {
  constructor(options) {
    this.options = {
      ...defaultOptions,
      ...options
    };
    this.crawler = new Crawler({
      nCoreUser: this.options.user,
      nCorePass: this.options.pass,
      searchTerms: this.options.searchTerms,
      debug: this.options.debug
    });
  }

  async start(searchTerm = null) {
    if (searchTerm) {
      this.options.searchTerms.length = 0;
      this.options.searchTerms.push(searchTerm);
    }
    const hrstart = process.hrtime();
    if (this.options.debug) {
      message(`Scraping started at ${new Date()}`);
    }
    this.pages = await this.crawler.getPages();
    if (this.options.debug) {
      pagesConsole(this.pages);
      message('Now we are scraping movies, our scientists working hard!');
    }
    this.movies = await this.crawler.getMovies();
    return new Promise(resolve => {
      const hrend = process.hrtime(hrstart);
      if (this.options.debug) {
        message(
          `Found ${
            Object.keys(this.movies).length
          } unique movies that have imdb id. It took ${hrend[0]}s ${Math.round(
            hrend[1] / 1000000
          )}ms`
        );
      }
      resolve(this.movies);
    });
  }
}
