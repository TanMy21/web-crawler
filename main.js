const process = require("process");
const { crawlPage } = require("./crawl");
const { printReport } = require("./report");

/**
 * This function processes command-line arguments, initiates the crawling process from a given base URL,
 * and then prints a report of the crawled pages.
 */
async function main() {
  // Extract command-line arguments, excluding the first two elements (node path and script path)
  const args = process.argv.slice(2);

  // Check if the number of arguments is less than 1
  if (args.length < 1) {
    console.error("Error: Too few arguments");
    process.exit(1);
  } else if (args.length > 1) {
    // Check if there are more than 1 arguments provided
    console.error("Error: Too many arguments");
    process.exit(1);
  }

  // treat the argument as the baseURL for the crawler
  const baseURL = args[0];

  // Your CLI logic here for the case of exactly 1 argument
  console.log("Crawler starting at: ", baseURL);

  // Initiate the crawling process from the baseURL, passing an empty object to track visited pages
  const pages = await crawlPage(baseURL, baseURL, {});

  // Print a report of the pages crawled and their visit count
  printReport(pages);
}

main();
