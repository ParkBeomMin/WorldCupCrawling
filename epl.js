const puppeteer = require('puppeteer');
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
    
const crawal = async(teamCode) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        // 전체클럽화면
        await page.goto(`https://www.premierleague.com/clubs`);
        await page.waitForSelector('#mainContent > div.clubIndex > div', { timeout: 1000 });

        const html = await page.$eval( "#mainContent", e => e.outerHTML );
        const $ = cheerio.load( html );
        const $clubList = $("#mainContent > div.clubIndex > div > div > div.indexSection > div > ul").children("li")
        let clubList = []
        $clubList.each(async function(i, elem) {
            const url = $(this).find('a.indexItem').attr('href')
            clubList.push(url)
        });


    for await (const club of clubList) {
        await getSquad(club)
    }

        await browser.close();
    } catch (error) {
        console.log(error);
    }
}

const getSquad = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const tmp = url.split('/')

    console.log(url.replace('overview', 'squad'));
    await page.goto(`https://www.premierleague.com${url.replace('overview', 'squad')}`);
    await page.waitForSelector('#mainContent > div.wrapper.col-12 > div > ul > li:last-child > a > header > img', { timeout: 5000 });
    setTimeout(async () => {
        const html = await page.$eval( "#mainContent", e => e.outerHTML );
        const $ = cheerio.load( html );
        const $playerList = $("#mainContent > div.wrapper.col-12 > div > ul").children("li")
        if(!fs.existsSync(`./assets/epl/${tmp[3]}`)) {
            console.log(`${tmp[3]} 폴더생성!!`)
            fs.mkdirSync(`./assets/epl/${tmp[3]}`)
          }
        $playerList.each(async function(i, elem) {
            console.log($(this).find('a > .squadPlayerHeader > img').attr('src'))
            console.log($(this).find('a > .squadPlayerHeader > .playerCardInfo > .name').text())
            const imgUrl = $(this).find('a > .squadPlayerHeader > img').attr('src')
            const player = $(this).find('a > .squadPlayerHeader > .playerCardInfo > .name').text()
            if(!imgUrl.includes('Photo-Missing')) {
                console.log('player', player);
                const img = await axios.get(imgUrl, {
                  responseType: 'arraybuffer'
                })
                
                fs.writeFileSync(`./assets/epl/${tmp[3]}/${player}.png`, img.data)
    
            }
        });
        await browser.close();
        
    }, 3000);
}
    
const start = async () => {
    await crawal()
}

start()