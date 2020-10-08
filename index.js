const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fromUnixTime = require('date-fns/fromUnixTime');
const { utcToZonedTime, format } = require('date-fns-tz')
const API_URL = process.env.API_URL;

const scape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.cathaybk.com.tw/cathaybk/personal/deposit-exchange/rate/currency-billboard/?indexwidget');
  // page.on('console', msg => {
  //   for (let i = 0; i < msg.args().length; ++i)
  //     console.log(`${i}: ${msg.args()[i]}`);
  //   }
  // );
  const [usd, gbp] = await page.$$eval('tr', trs => {
    let gbp, usd;
    trs.forEach(tr => {
      if (/US Dollars/.test(tr.innerText)) {
        usd = tr;
      }
      if (/Pound Sterling/.test(tr.innerText)) {
        gbp = tr;
      }
    });
    const gbpp = gbp ? gbp.querySelector('td:nth-child(2) font').innerText : '';
    const usdp = usd ? usd.querySelector('td:nth-child(2) font').innerText : '';
    return [usdp, gbpp];
  });

  const text = `usd: ${usd}, gbp: ${gbp}`;
  console.log(text);

  await browser.close();
  return text;
};

const postMessage = async (text) => {
  if (!API_URL) {
    console.warn('not given API_URL, skip posting to slack');
    return;
  }
  const response = await fetch(API_URL, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({ text }) // body data type must match "Content-Type" header
  });
  return response;
};

let lastTimestamp = 0;

const job = async () => {
  now = new Date();
  nowUnix = fromUnixTime(now / 1000);
  const timeZone = 'Asia/Taipei';
  const zonedDate = utcToZonedTime(nowUnix, timeZone);
  const hour = format(zonedDate, 'H', { timeZone });
  const diff = hour > 9 && hour < 19 ? 1000*60*2 : 1000*60*30;
  await postMessage(await scape());
  lastTimestamp = new Date().getTime();
  setTimeout(job, diff);
}

job();
