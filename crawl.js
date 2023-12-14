const { JSDOM } = require("jsdom");

function normalizeURL(url) {
  const urlObj = new URL(url);
  let fullPath = `${urlObj.host}${urlObj.pathname}`;
  if (fullPath.length > 0 && fullPath.slice(-1) === "/") {
    fullPath = fullPath.slice(0, -1);
  }
  return fullPath;
}

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

async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  // currentURL should be on same domain as baseURL, if not then return pages
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  // get a normalized version of the currentURL
  const normalizedCurrentURL = normalizeURL(currentURL);

  // if the pages object already has an entry for the normalizedCurrentURL increment the count and return the pages object
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  // if pages obj does not have entry of url then add normalizedCurrentURL make it 1
  pages[normalizedCurrentURL] = 1;

  console.log(`Actively crawling: ${currentURL}`);

  // fetch and parse the html of the currentURL
  console.log(`crawling ${currentURL}`);
  try {
    const resp = await fetch(currentURL);
    if (resp.status > 399) {
      console.log(`HTTP error, status code: ${resp.status}`);
      return pages;
    }
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`non-html response: ${contentType}`);
      return pages;
    }
    const html = await resp.text();
  } catch (err) {
    console.log(err.message);
  }

  // extract the links from the html
  const nextURLs = getURLsFromHTML(htmlBody, baseURL);

  for (const nextURL of nextURLs) {
    // recursively crawl the pages
    pages = await crawlPage(baseURL, nextURL, pages);
  }
  return pages;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
