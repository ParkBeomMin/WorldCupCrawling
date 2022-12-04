
const teamCodes = [4764, 4778, 4739, 4751, 4729, 23120, 8022, 8111, 6736, 37314, 7317, 4705, 4476, 4711, 4717, 6355, 4699, 4698, 4702, 4713, 4715, 4704, 4703, 4481, 4781, 4724, 4748
, 4819, 4757, 4725, 4752, 4756]

  const puppeteer = require('puppeteer');
  const cheerio = require("cheerio");
  const axios = require("axios");
  const fs = require("fs");

  const crawal = async(teamCode) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`https://m.sports.naver.com/qatar2022/nation/index?teamCode=${teamCode}&tab=players`);
      await page.waitForSelector('#content > div.Nation_container__3DUHA > div.Nation_main_section__2KTbB > div.NationSquad_nation_squad__8P_7Z > ul:nth-child(3)', { timeout: 1000 });
  
      const html = await page.$eval( "#content", e => e.outerHTML );
      const nation = await page.evaluate(() => {
        return document.querySelector('.NationInfo_nation__3vsJj').innerHTML;
      });
      const $ = cheerio.load( html );
      const $bodyList = $("ul.NationSquad_player_list__3ISuK").children("li")
      if(!fs.existsSync(`./${nation}`)) {
        console.log(`${nation} 폴더생성!!`)
        fs.mkdirSync(`./${nation}`)
      }
      $bodyList.each(async function(i, elem) {
                    console.log($(this).find('div.NationSquad_player_image__2VcVW img').attr('src'))
                    const imgUrl = $(this).find('div.NationSquad_player_image__2VcVW img').attr('src')
                    const player = $(this).find('div.NationSquad_name_box__1xqL0 .NationSquad_name__2n74U').text()
                    console.log('player', player);
                    const img = await axios.get(imgUrl, {
                      responseType: 'arraybuffer'
                    })
                    
                    fs.writeFileSync(`${nation}/${player}.png`, img.data)
                });
      await browser.close();
    } catch (error) {
      console.log(error);
    }
  }

const start = async () => {
  for await (const teamCode of teamCodes) {
    console.log('teamCode =>', teamCode)
     await crawal(teamCode)
  }
}

start()