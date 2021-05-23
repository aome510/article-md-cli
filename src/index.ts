#!/usr/bin/env node


import TurndownService from "turndown";
import parse from "./lib";
import yargsParser from "yargs-parser";

const {
    _: [url]
} = yargsParser(process.argv.slice(2));

(async () => {

    const turndownService = new TurndownService({
        "codeBlockStyle": "fenced",
    });

    try {
        const article = await parse(url, turndownService);
        console.log(JSON.stringify(article));
    } catch (err) {
        console.error(err);
    }
})();
