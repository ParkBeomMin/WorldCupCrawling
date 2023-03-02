const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

const crawal = async (teamCode) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        // 전체클럽화면
        await page.goto(`https://www.premierleague.com/clubs`);
        await page.waitForSelector("#mainContent > div.clubIndex > div", {
            timeout: 1000,
        });

        const html = await page.$eval("#mainContent", (e) => e.outerHTML);
        const $ = cheerio.load(html);
        const $clubList = $(
            "#mainContent > div.clubIndex > div > div > div.indexSection > div > ul"
        ).children("li");
        let clubList = [];
        if (!fs.existsSync(`./assets/eplClub`)) {
            fs.mkdirSync(`./assets/eplClub`);
        }
        $clubList.each(async function (i, elem) {
            const clubName = $(this)
                .find("a > .indexInfo > .nameContainer > .clubName")
                .text();
            const imgUrl = $(this)
                .find("a > .indexBadge > span > img")
                .attr("src");
            console.log("clubName", clubName);
            console.log("imgUrl", imgUrl);

            const img = await axios.get(imgUrl, {
                responseType: "arraybuffer",
            });
            fs.writeFileSync(`./assets/eplClub/${clubName}.png`, img.data);
        });
        await browser.close();
    } catch (error) {
        console.log(error);
    }
};

const start = async () => {
    await crawal();
};

start();
