const puppeteer = require('puppeteer');
const dayjs = require('dayjs')
const axios = require('axios')
const wxConfig = require('./config/wx')
setInterval(async () => {
    let currentTime = dayjs(new Date()).format('HH:mm')
    console.log(currentTime)
    /*每天10点执行一次*/
    if (currentTime !== '10:00') {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], timeout: 50000 })
        const browserWSEndpoint = browser.wsEndpoint();
        browser.disconnect();
        // 使用节点来重新建立连接
        const browser2 = await puppeteer.connect({ browserWSEndpoint });
        let page = await browser2.newPage()
        await page.goto('https://sports.sohu.com/s/cba', { timeout: 0 });
        const newsContent = await page.evaluate(() => {
            let ele = document.getElementsByClassName('news-list')[0]
            return {
                content: ele ? ele.innerText : '暂无新闻'
            }
        })
        // console.log('url:', newsUrl.url)
        // await page.goto(newsUrl.url, { timeout: 0, waitUntil: 'load' });
        // const newsContent = await page.evaluate(() => {
        //     let ele = document.getElementsByClassName('quote-content')[0]
        //     return {
        //         content: ele.innerText
        //     }
        // });
        let data = {
            msgtype: 'text',
            text: {
                content: newsContent.content
            }
        }
        await browser2.close()
        console.log('新闻内容:', data)
        axios.post(wxConfig.wxWebhook, data)
    }
}, 1000 * 60);



