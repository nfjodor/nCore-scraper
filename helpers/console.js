const printSeparator = separatorLength => {
  console.log(`${Array(separatorLength + 1).join('=')}`);
};
export const pages = watchingSearchTerms => {
  Object.keys(watchingSearchTerms).forEach(searchTerm => {
    const pageCount = watchingSearchTerms[searchTerm];
    const searchTermString = `Search term: ${searchTerm}`;
    const foundString = `Found ${pageCount} pages`;
    console.log(searchTermString);
    console.log(foundString);
    printSeparator(foundString.length);
  });
};

export const message = (message = '') => {
  if (message.length) {
    process.stdout.write('\n');
    printSeparator(message.length + 2);
    console.log(` ${message} `);
    printSeparator(message.length + 2);
    process.stdout.write('\n');
  }
};
