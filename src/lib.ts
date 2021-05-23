import axios from "axios";
import cheerio from "cheerio";
import TurndownService from "turndown";

type Article = {
    content: string,
    title: string,
}

export default async function parse(url: string, turndownService: TurndownService): Promise<Article> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const body = turndownService.escape($('body').html());
    const content = turndownService.turndown(body);
    const title = $('title').text();
    return {
        content, title
    };
}
