const puppeteer = require('puppeteer');
const fs = require('fs');

const crawPage = 'https://blog.csdn.net/rank/list/total';

(async function crawler () {
  // 浏览器实例
  const browser = await puppeteer.launch({
    headless: 'new',
    slowMo: 100,
    defaultViewport: {
      width: 960,
      height: 540
    }
  });

  // 打开一个tab页面
  const page = await browser.newPage();
  // 加载目标页，在 500ms 内没有任何网络请求才算加载完成
  await page.goto(crawPage, {
    waitUntil: 'networkidle0'
  });

  // 无头浏览器的dom环境，获取页面数据
  const authorList = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll(".floor-rank-total .floor-rank-total-item").forEach((ele) => {
      const rank = ele.querySelector(".total-content .number").innerText;
      const title = ele.querySelector(".total-box dd a").innerText;
      const fans = ele.querySelector(".total-box dt span:nth-child(1)").innerText;
      list.push({
        '排名': rank,
        '作者': title,
        '粉丝': fans,
      });
    });
    return list;
  });

  fs.writeFile('./csdnAuthor.json', JSON.stringify(authorList), function (err, data) {
    if (err) {
      throw err
    }
    console.log('文件保存成功')
  });

  await page.close();

})()