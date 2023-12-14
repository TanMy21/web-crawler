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

async function crawlPage(currentURL) {
  // fetch and parse the html of the currentURL
  console.log(`crawling ${currentURL}`);
  try {
    const resp = await fetch(currentURL);
    if (resp.status > 399) {
      console.log(`Got HTTP error, status code: ${resp.status}`);
      return;
    }
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`Got non-html response: ${contentType}`);
      return;
    }
    console.log(await resp.text());
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
