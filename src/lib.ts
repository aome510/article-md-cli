import axios from "axios";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import fs from "fs";

export type Article = {
  content: string;
  link: string;
  title: string;
  author: string;
};

export function initTurndownService(): TurndownService {
  const turndownService = new TurndownService({
    codeBlockStyle: "fenced",
  }).addRule("code_block", {
    filter: function(node) {
      return node.nodeName == "PRE";
    },
    replacement: function(content, node) {
      const code = turndownService.escape(node.textContent || content);
      const fence = "```";

      return `

${fence}
    ${code.replace(/\n/g, "\n    ")}
${fence}

`;
    },
  });

  return turndownService;
}

export async function parse(
  link: string,
  turndownService: TurndownService,
  format: string,
): Promise<Article> {
  let rawData = "";
  // check the link is a local file or not
  if(fs.existsSync(link)) {
    // I think I going to add a encoding option: --encoding=utf8
    rawData = fs.readFileSync(link, 'utf8');
  } else {
    rawData = (await axios.get(link))?.data;
  }
  const doc = new JSDOM(rawData);
  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (article === null) {
    throw new Error(`failed to parse article from the link: ${link}`);
  }

  let content;
  if (format == "html") {
    content = article.content;
  } else {
    content = turndownService.turndown(article.content);
  }
  return {
    content,
    link,
    title: article.title,
    author: article.byline,
  };
}
