'use strict';

const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = Infinity;
const faker = require('faker')
let argv = require('minimist')(process.argv.slice(2));

let URL = argv.URL || 'http://localhost/prestashop_1.7.5.1/oldinstall';
let EMAIL = argv.LOGIN || 'demo@prestashop.com';
let PASSWORD = argv.PASSWD || 'prestashop_demo';

const getAllLang = async (browser, page) => {
	await page.goto(URL, { waitUntil: 'networkidle0' });
	const langcode = await page.evaluate(
    () => Array.from(document.body.querySelectorAll("select#langList[name='language'] [value]"), ({ value }) => value)
    );
	const country = await page.$eval("#langList[name='language']", option => option.innerText);
	console.log(langcode)
	console.log(country)
	return langcode
}

/*
const function2 = async (browser, page) => {
	await page.goto(URL, { waitUntil: 'networkidle0' });
  return EMAIL
}
*/

const run = async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()

  const langList = await getAllLang(browser, page)
//	console.log(langList)
//	const exec2 = await function2(browser, page)

  browser.close()
}

run()
  .then(value => {
    console.log("--------End Of Script :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
