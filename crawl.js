const { JSDOM } = require("jsdom");

/**
 * Normalizes a given URL string.
 *
 * The function parses the input URL string into a URL object.
 * It then constructs a normalized URL string consisting of the host and the pathname of the URL.
 *
 * @param {string} url - The URL string to be normalized.
 * @return {string} The normalized URL, combining the host and the pathname, excluding the trailing slash if present.
 *
 * Example Usage:
 * normalizeURL("https://blog.example.dev/path"); // Returns "blog.example.dev/path"
 */

function normalizeURL(url) {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.length > 0 && fullPath.slice(-1) === "/") {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath;
}

/**
 *
 * This function parses an HTML string to extract all hyperlink URLs. It then normalizes these URLs,
 * converting any relative URLs to absolute URLs based on a provided base URL.
 *
 * @param {string} htmlBody - The HTML string from which URLs are to be extracted.
 * @param {string} baseURL - The root URL of the website being crawled.
 * @return {string[]} An array of absolute URLs extracted from the HTML string.
 *
 * Example Usage:
 * getURLsFromHTML('<a href="/path">Link</a>', 'https://example.com');
 * // Returns ['https://example.com/path']
 */

function getURLsFromHTML(htmlBody, baseURL) {
  const dom = new JSDOM(htmlBody);
  const links = dom.window.document.querySelectorAll("a");
  const urls = [];

  for (const link of links) {
    // Check if the href is a relative URL
    if (link.href.startsWith("https:") || link.href.startsWith("/")) {
      urls.push(new URL(link.href, baseURL).href);
    } else {
      continue;
    }
  }

  return urls;
}

/**
 * Recursively crawls web pages starting from a base URL, within the same domain.
 *
 * The function fetches web pages, extracts and follows links, keeping track of how many times each page is encountered.
 *
 * @param {string} baseURL - The base URL of the site to crawl, Used to ensure we only crawl within this domain.
 * @param {string} currentURL - The current URL to be crawled. Initially, this is the base URL, but it changes as the function recursively crawls other pages.
 * @param {Object} pages - An object to keep track of the number of times each page (normalized URL) is encountered during the crawl.
 *
 * How it works:
 * 1. The function first checks if the currentURL is within the same domain as the baseURL. If not, it returns the current 'pages' object, as it's not intended to crawl external domains.
 * 2. It normalizes the currentURL to a consistent format (using the 'normalizeURL' function).
 * 3. If the normalized URL already exists in the 'pages' object, its count is incremented. Otherwise, a new entry is created with a count of 1 (or 0 if it's the base URL).
 * 4. The function then fetches the HTML content of the currentURL, handling HTTP errors and non-HTML content.
 * 5. It extracts all the URLs from the fetched HTML content (using the 'getURLsFromHTML' function) and recursively crawls each URL.
 * 6. Finally, it returns the updated 'pages' object containing the count of each crawled page.
 *
 *
 * Example Usage:
 * crawlPage('https://example.com', 'https://example.com', {});
 */

async function crawlPage(baseURL, currentURL, pages) {
  // Create URL objects for baseURL and currentURL for easy parsing and comparison
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  // Check if the currentURL is within the same domain as the baseURL; if not, return the current state of 'pages'
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  // get a normalized version of the currentURL
  const normalizedCurrentURL = normalizeURL(currentURL);

  // If the normalized URL already exists in the 'pages' object, its count is incremented.
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  // if pages obj does not have entry of url then a new entry is created with a count of 1
  pages[normalizedCurrentURL] = 1;

  console.log(`Actively crawling: ${currentURL}`);

  // fetch and parse the html of the currentURL
  console.log(`crawling ${currentURL}`);

  // Initialize a variable to hold the HTML content of the currentURL
  let html = "";

  try {
    // Fetch the content of the current URL
    const resp = await fetch(currentURL);

    // If the response status code indicates an error (400+), log the error and return 'pages'
    if (resp.status > 399) {
      console.log(`HTTP error, status code: ${resp.status}`);
      return pages;
    }

    // Get the content type of the response and check if it is HTML; if not, log the error and return 'pages'
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`non-html response: ${contentType}`);
      return pages;
    }

    // If the response is HTML, read the response body as text
    html = await resp.text();
  } catch (err) {
    console.log(err.message);
  }

  // extract the links from the html
  const nextURLs = getURLsFromHTML(html, baseURL);

  // Iterate over each URL found in the current page
  for (const nextURL of nextURLs) {
    // recursively crawl the pages
    pages = await crawlPage(baseURL, nextURL, pages);
  }

  // Return the updated 'pages' object with counts of how often each page was encountered
  return pages;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
