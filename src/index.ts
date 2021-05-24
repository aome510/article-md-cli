#!/usr/bin/env node

import TurndownService from "turndown";
import parse from "./lib";
import yargsParser from "yargs-parser";

function isCodeBlock(node: TurndownService.Node): boolean {
  return (
    node.nodeName === "PRE" &&
    node.firstChild &&
    node.firstChild.nodeName === "CODE"
  );
}

async function main(): Promise<void> {
  const {
    _: [url],
  } = yargsParser(process.argv.slice(2));

  const turndownService = new TurndownService().addRule("escaped_code", {
    filter: function (node) {
      return (
        isCodeBlock(node) ||
        (node.nodeName === "CODE" &&
          node.parentNode &&
          node.parentNode.nodeName !== "PRE")
      );
    },
    replacement: function (content, node, options) {
      // implementation below is based on https://github.com/domchristie/turndown/blob/master/src/commonmark-rules.js#L111
      const code = turndownService.escape(content);
      if (isCodeBlock(node)) {
        const className = node.firstElementChild.getAttribute("class") || "";
        const language = (/language-(\S+)/.exec(className) || [null, ""])[1];

        const fenceChar = options.fence.charAt(0);
        const fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");

        let fenceSize = 3;
        let match: RegExpExecArray;
        while ((match = fenceInCodeRegex.exec(code))) {
          if (match[0].length >= fenceSize) {
            fenceSize = match[0].length + 1;
          }
        }

        const fence = Array(fenceSize + 1).join(fenceChar);

        return (
          "\n\n" +
          fence +
          language +
          "\n    " +
          code.replace(/\n/g, "\n    ") +
          "\n" +
          fence +
          "\n\n"
        );
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
