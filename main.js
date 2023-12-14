const process = require("process");

function main() {
  const args = process.argv.slice(2); // Removes the first two elements

  if (args.length < 1) {
    console.error("Error: Too few arguments");
    process.exit(1);
  } else if (args.length > 1) {
    console.error("Error: Too many arguments");
    process.exit(1);
  }

  const baseURL = args[0];

  // Your CLI logic here for the case of exactly 1 argument
  console.log("Crawler starting at: ", baseURL);
}

main();
