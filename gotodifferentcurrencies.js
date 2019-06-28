'use strict';

const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = Infinity;
const faker = require('faker')
let argv = require('minimist')(process.argv.slice(2));

let URL = argv.URL || 'http://localhost/prestashop_1.7.5.1/en/';

const getListLanguages = async (browser, page) => {
	await page.goto(URL, { waitUntil: 'networkidle0' }).catch(e => console.error(e));
	await page.waitForSelector("#_desktop_language_selector ul.dropdown-menu.hidden-sm-down a");
	const languagesList = await page.evaluate(
		() => Array.from(document.body.querySelectorAll("#_desktop_language_selector ul.dropdown-menu.hidden-sm-down a"), ({ href }) => href)
	);
  return languagesList
}

const tryEachLanguage = async (browser, page, languages) => {
	for (const language of languages) {
		await page.goto(language, { waitUntil: 'networkidle0' }).catch(e => console.error(e));
		const languageTitle = await page.$eval("#_desktop_language_selector ul.dropdown-menu.hidden-sm-down .current", a => a.innerText);
		console.log(languageTitle);
		await page.waitForSelector("[data-id-product='1']");
		await page.click("[data-id-product='1']", { waitUntil: 'networkidle2' });
		const checkHttpReq = await HttpReqChecker(browser, page)
		const getListOfCurrencies = await getListCurrencies(browser, page)
		const selectEachCurrencie = await tryEachCurrencie(browser, page, getListOfCurrencies)
	}
  return languages
}

const getListCurrencies = async (browser, page) => {
	await page.waitForSelector("#_desktop_currency_selector ul.dropdown-menu.hidden-sm-down a");
	const currenciesList = await page.evaluate(
		() => Array.from(document.body.querySelectorAll("#_desktop_currency_selector ul.dropdown-menu.hidden-sm-down a[title]"), ({ title }) => title)
	);
  return currenciesList
}

const tryEachCurrencie = async (browser, page, currencies) => {
	for (const currencie of currencies) {
		await page.waitForSelector("#_desktop_currency_selector button[data-toggle='dropdown']");
		await page.click("#_desktop_currency_selector button[data-toggle='dropdown']", { waitUntil: 'domcontentloaded' });
		await page.waitForSelector("ul a[title='" + currencie + "']");
		await page.click("ul a[title='" + currencie + "']", { waitUntil: 'domcontentloaded' });
		const checkHttpReq = await HttpReqChecker(browser, page)
		const checkPrice = await PriceChecker(browser, page, currencie)
	}
  return currencies
}

const PriceChecker = async (browser, page, currencie) => {
	await page.waitForSelector(".current-price [itemprop='price']");
	const pricevalue = await page.$eval(".current-price [itemprop='price']", span => span.innerText);
	console.log(currencie + ": " + pricevalue);
}

const HttpReqChecker = async (browser, page) => {
	page.on('response', response => {
		if(response.status().toString().startsWith("4") || response.status().toString().startsWith("5")) {
			const urlStatus = ["--HTTP CODE--", response.status(),"URL:" ,response.url(), "From:", href];
			throw ('page error catched:'+ urlStatus)
		}
	});
}

const run = async () => {
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()

	///*-------User Agent Param------
	const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
  const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
  await page.setUserAgent(chromeUserAgent);
  await page.setExtraHTTPHeaders({
		'accept-language': 'en-US,en;q=0.8'
  });
	//----------------------------*/

	await page.setViewport({ width: 1500, height: 2400 })
  const getListOfLanguages = await getListLanguages(browser, page)
	const selectEachLanguage = await tryEachLanguage(browser, page, getListOfLanguages)
	/*
	const getListOfCurrencies = await getListCurrencies(browser, page)
	const selectEachCurrencie = await tryEachCurrencie(browser, page, getListOfCurrencies)
	*/
  browser.close()
}

run()
  .then(value => {
    console.log("--------End Of Script :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
