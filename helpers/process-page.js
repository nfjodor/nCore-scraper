const querystring = require("querystring");
const { NCORE_KEY_REGEX, NCORE_URL } = require("../constants");

let ncoreKey = "";

const getImdbId = ($row) => {
  const $infoLink = $row.find(".infolink");
  const imdbIdArray = $infoLink.length
    ? $infoLink.attr("href").match(/tt\d{7}/g)
    : null;
  return imdbIdArray ? imdbIdArray[0] : null;
};

const getId = ($row) => {
  const urlObject = querystring.parse($row.find(".torrent_txt a").attr("href"));
  return urlObject.id;
};

const getDownloadUrl = (id) => {
  return `${NCORE_URL}?action=download&id=${id}&key=${ncoreKey}`;
};

const getDownloadCount = ($row) => {
  return $row.find(".box_d2").text().length;
};

const getSize = ($row) => {
  const sizeUnit = $row
    .find(".box_meret2")
    .text()
    .replace(/[\d\.\ ]/g, "")
    .toLowerCase();

  let size = parseFloat($row.find(".box_meret2").text());

  if (sizeUnit === "mb" || sizeUnit === "mib") {
    size = size / 1024;
  }
  if (sizeUnit === "kb" || sizeUnit === "kib") {
    size = size / 1024 / 1024;
  }

  return size;
};

const getQualityAndLanguage = ($row) => {
  return $row.find(".box_alap_img img").attr("alt").toLowerCase().split("/");
};

const getName = ($row) => {
  return $row.find(".tabla_szoveg a").attr("title");
};

module.exports = ($, movieListObject, isDebug) => {
  if (!ncoreKey) {
    ncoreKey = NCORE_KEY_REGEX.exec($.html())[0];
  }
  $(".box_torrent").each(function () {
    const $row = $(this);
    const imdbId = getImdbId($row);
    if (!imdbId) {
      return true;
    }
    const id = getId($row);
    const name = getName($row);
    const size = getSize($row);
    const downloadUrl = getDownloadUrl(id);
    const downloads = getDownloadCount($row);
    const qualityAndLanguage = getQualityAndLanguage($row);
    const quality = qualityAndLanguage[0];
    const lang = qualityAndLanguage[1];

    movieListObject[imdbId] = movieListObject[imdbId] || {};
    const torrent = movieListObject[imdbId];

    torrent[lang] = torrent[lang] || {};
    torrent[lang][quality] = torrent[lang][quality] || {};
    torrent[lang][quality][id] = torrent[lang][quality][id] || {
      id,
      imdbId,
      name,
      lang,
      quality,
      size,
      downloads,
      downloadUrl,
    };
  });
  if (isDebug) {
    process.stdout.write(".");
  }
  return movieListObject;
};
