import axios from "axios";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type Article = {
  url: string;
  content: string;
  title: string;
  author: string;
  date_published: string | null;
  word_count: number;
};

function isCodeBlock(node: TurndownService.Node): boolean {
  return (
    node.nodeName === "PRE" &&
    node.firstChild !== null &&
    node.firstChild.nodeName === "CODE"
  );
}

export function initTurndownService(): TurndownService {
  const turndownService = new TurndownService().addRule("escaped_code", {
    filter: function (node) {
      return (
        isCodeBlock(node) ||
        (node.nodeName === "CODE" &&
          node.parentNode !== null &&
          node.parentNode.nodeName !== "PRE")
      );
    },
    replacement: function (content, node) {
      // implementation below is based on https://github.com/domchristie/turndown/blob/master/src/commonmark-rules.js#L111
      const code = turndownService.escape(node.textContent || content);

      if (isCodeBlock(node) && node.firstElementChild !== null) {
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

        const fence = Array(fenceSize + 1).join("`");

        return `

${fence}${language}
    ${code.replace(/\n/g, "\n    ")}
${fence}

`;
      }
      return code;
    },
  });

  return turndownService;
}

export async function parse(
  url: string,
  turndownService: TurndownService
): Promise<Article> {
  const response = await axios.get(url);
  const doc = new JSDOM(response.data);
  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (article === null) {
    throw new Error(`failed to parse article from the url: ${url}`);
  }

  // simple "word_count" hack
  const word_count = (article.textContent.match(/[\w]+/g) ?? []).length;

  const content = turndownService.turndown(article.content);
  return {
    content,
    url,
    word_count,
    title: article.title,
    author: article.byline,
    date_published: null,
  };
}
