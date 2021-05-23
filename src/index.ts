#!/usr/bin/env node

import TurndownService from "turndown";
import parse from "./lib";

(async () => {

    const turndownService = new TurndownService({
        "codeBlockStyle": "fenced",
    });

    try {
        // const article = await parse("https://aturon.github.io/blog/2016/08/11/futures/", turndownService);
        const article = await parse("https://theta.eu.org/2021/03/08/async-rust-2.html", turndownService);
        console.log(JSON.stringify(article));
    } catch (err) {
        console.error(err);
    }
})();
