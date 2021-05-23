import axios from "axios";
import cheerio from "cheerio";
import TurndownService from "turndown";

type Article = {
    url: String,
    content: string,
    title: string,
    author: string,
    date_published: string,
    word_count: number,
}

export default async function parse(url: string, turndownService: TurndownService): Promise<Article> {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const body = turndownService.escape($('body').html());
    const content = turndownService.turndown(body);
    const title = $('title').text();
    return {
        content, title, url, author: "", date_published: "", word_count: 0
    };
}
