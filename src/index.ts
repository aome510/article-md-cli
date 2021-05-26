#!/usr/bin/env node

import yargsParser from "yargs-parser";
import { parse, initTurndownService, Article } from "./lib";

async function main(): Promise<Article> {
  const {
    _: [url],
  } = yargsParser(process.argv.slice(2));

  if (url === undefined) {
    throw new Error("please specify a valid URL to run the command");
  }

  const turndownService = initTurndownService();
  const article = await parse(url, turndownService);

  return article;
}

main()
  .then((article) => {
    console.log(JSON.stringify(article, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
