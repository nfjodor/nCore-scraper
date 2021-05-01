# nCore-scraper

This is a small tool to get movie infomrations from biggest hungarian torrent site.

# Get started

## Install

```sh
$ npm install ncore-scraper
```

## Basic usage

```js
const nCoreScraper = require("ncore-scraper");

const options = {
    user: 'YourNcoreUserName',
    pass: 'YourHashedNcorePass',
    searchTerms: ['Back to the future'],
    debug: true
};

const scraper = new nCoreScraper(options);

scraper.start().then(movieList => {
    console.log(movieList);
});
```

## Options reference
You can pass these options to the nCoreScraper() constructor if you want to change default props.

### Required options
 * `options.user`: [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type), Your ncore username.
 * `options.pass` : [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type), Your hashed ncore password.

#### Get hashed ncore password
To get hashed password, you need to login to site with "Lower security". This means the backend generates a key, that you can use for login.

<p align="center">
    <img src="https://gist.githubusercontent.com/nfjodor/dc2ceece26b866451238779518c7a9fc/raw/54da831ed4404502ca033e1742e29f64c2438c6e/ncore-login.png">
</p>

After login you can find the pass cookie in browser's developer toolbar.

<p align="center">
    <img src="https://gist.githubusercontent.com/nfjodor/dc2ceece26b866451238779518c7a9fc/raw/54da831ed4404502ca033e1742e29f64c2438c6e/ncore-cookie.png">
</p>

### Optional options
 * `options.debug`: [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type), Your ncore username. (Default false)
 * `options.searchTerms` : Array, List of movie searching terms. You can use it for watch a movie release or a year, to get informations from newly released movies etc. (Default last 2 years e.g. [2018, 2019])

## Class:nCoreScraper
### nCoreScraper.start
This is a promise. You can start the scraping with this method, after that, you will get a list of movies.
This method has an optional argument, the `searchTerm`. If you pass a string param, the scraper will use that instead of default.

The data you will get is an object of objects. The Object structure is the following:
```js
[imdbId]: {
    [lang(`hu` or `en`)]: {
        [quality(`sd` or `hd`)]: {
            [torrentId]: {
                id: String,
                imdbId: String,
                name: String,
                lang: String,
                quality: String,
                size: Number,
                downloads: Number,
                downloadUrl: String
            }
        }
    }
}
```

#### Movie informations
 * `id`: String, torrent id.
 * `imdbId`: String, imdb id.
 * `name`: String, name of torrent.
 * `lang`: String, language of torrent. It can be `hu` or `en`.
 * `quality`: String, quality of torrent. It can be `sd` or `hd`.
 * `size`: Number, size of torrent in gigabyte. It is a float number.
 * `downloads`: Number, download count of movie. It can be between `1` and `5`
 * `downloadUrl`: String, download url of torrent file.

#### Example:
```js
{
    tt0088763: {
        hu: {
            sd: {
                torrentId: {
                    id: 'torrentId',
                    imdbId: 'tt0088763',
                    name: 'Back.To.The.Future.I',
                    lang: 'hu',
                    quality: 'sd',
                    size: 1.67,
                    downloads: 5,
                    downloadUrl: 'http://torrent-download.url' 
                }
            },
            hd: {
                torrentId: {
                    id: 'torrentId',
                    imdbId: 'tt0088763',
                    name: 'Back.To.The.Future.I',
                    lang: 'hu',
                    quality: 'hd',
                    size: 9.47,
                    downloads: 5,
                    downloadUrl: 'http://torrent-download.url' 
                }
            }
        },
        en: {
            sd: {
                torrentId: {
                    id: 'torrentId',
                    imdbId: 'tt0088763',
                    name: 'Back.To.The.Future.I',
                    lang: 'en',
                    quality: 'sd',
                    size: 1.77,
                    downloads: 5,
                    downloadUrl: 'http://torrent-download.url' 
                }
            },
            hd: {
                torrentId: {
                    id: 'torrentId',
                    imdbId: 'tt0088763',
                    name: 'Back.To.The.Future.I',
                    lang: 'en',
                    quality: 'hd',
                    size: 8.12,
                    downloads: 5,
                    downloadUrl: 'http://torrent-download.url' 
                }
            }
        }
    }
}
```
