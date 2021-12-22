#!/usr/bin/env node

import yargsParser from "yargs-parser";
import { parse, initTurndownService, Article } from "./lib";

const version = "0.2.1";

async function main(): Promise<Article | null> {
  const {
    _: [url],
    format,
  } = yargsParser(process.argv.slice(2));

  if (url === undefined) {
    console.log(`
    article_md v${version} - a CLI tool for a web article into readable text
    Usage:
      $ article_md $URL [--format=markdown(default)|html]
`);
    return null;
  }

  const turndownService = initTurndownService();
  const article = await parse(url, turndownService, format);

  return article;
}

main()
  .then((article) => {
    if (article) {
      console.log(JSON.stringify(article, null, 2));
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
