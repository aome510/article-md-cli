#!/usr/bin/env node

import TurndownService from "turndown";
import parse from "./lib";
import yargsParser from "yargs-parser";
import { isNull, isUndefined } from "util";

function isCodeBlock(node: TurndownService.Node): boolean {
  return (
    node.nodeName === "PRE" &&
    !isNull(node.firstChild) &&
    node.firstChild.nodeName === "CODE"
  );
}

async function main(): Promise<void> {
  const {
    _: [url],
  } = yargsParser(process.argv.slice(2));

  if (isUndefined(url)) {
    throw new Error("please specify a valid URL to run the command");
  }

  const turndownService = new TurndownService().addRule("escaped_code", {
    filter: function(node) {
      return (
        isCodeBlock(node) ||
        (node.nodeName === "CODE" &&
          !isNull(node.parentNode) &&
          node.parentNode.nodeName !== "PRE")
      );
    },
    replacement: function(content, node) {
      // implementation below is based on https://github.com/domchristie/turndown/blob/master/src/commonmark-rules.js#L111
      const code = turndownService.escape(content);
      if (isCodeBlock(node) && !isNull(node.firstElementChild)) {
        const className = node.firstElementChild.getAttribute("class") || "";
        const matches = /language-(\S+)/.exec(className);
        const language = (matches && matches.length > 1 && matches[1]) || "";

        const fenceInCodeRegex = new RegExp("^`{3,}", "gm");

        let fenceSize = 3;
        let match: RegExpExecArray | null;
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match && match[0] && match[0].length >= fenceSize) {
            fenceSize = match[0].length + 1;
          }
        }

        const fence = Array(fenceSize + 1).join('`');

        return `

${fence}${language}
    ${code.replace(/\n/g, "\n    ")}
${fence}

`;
      }
      return code;
    },
  });

  const article = await parse(url, turndownService);
  console.log(JSON.stringify(article));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
