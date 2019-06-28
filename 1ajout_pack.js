'use strict';

const puppeteer = require('puppeteer');
const {COUNTRIES} = require('./CLDR_dataset')
const {COUNTRYCODE} = require('./CLDR_dataset')
require('events').EventEmitter.prototype._maxListeners = Infinity;
const faker = require('faker')
let argv = require('minimist')(process.argv.slice(2));

let URL = argv.URL || 'http://localhost/prestashop_devbranch/admin-dev';
let EMAIL = argv.LOGIN || 'demo@prestashop.com';
let PASSWORD = argv.PASSWD || 'prestashop_demo';
let LOCALIZATION = argv.LOCALIZATION || "kr";
let PRICE = argv.PRICE || "69999.98";
let HOME = ["kb", "xn", "tb"]

const importLoc = async (browser, page, ccode) => {
	const subtabhref = await page.$eval('#subtab-AdminParentLocalization' + ' a.link[href]', ({ href }) => href);
  await page.goto(subtabhref, { waitUntil: 'networkidle0' });
	const langcode = await page.evaluate(
		() => Array.from(document.body.querySelectorAll("select#import_localization_pack_iso_localization_pack[name='import_localization_pack[iso_localization_pack]'] [value]"), ({ value }) => value)
		);
	const country = await page.$eval("#import_localization_pack_iso_localization_pack[name='import_localization_pack[iso_localization_pack]']", option => option.innerText);
	await page.select("#import_localization_pack_iso_localization_pack", ccode)
	await page.click("[name='import_localization_pack'] button.btn")
	await page.waitFor(".alert.alert-success[role='alert']")
	console.log("successfull");
	return country
}

const setPrices = async (browser, page, ccode) => {
	const subtabhref = await page.$eval('#subtab-AdminProducts' + ' a.link[href]', ({ href }) => href);
  await page.goto(subtabhref, { waitUntil: 'networkidle0' });
	await page.click("[data-product-id='19'] img", { waitUntil: 'domcontentloaded' })
	await page.waitForSelector("#form-nav #tab_step2.nav-item [href='#step2']", {visible: true})
	await page.click("#form-nav #tab_step2.nav-item [href='#step2']")
	await page.waitForSelector("#select2-form_step2_id_tax_rules_group-container", {visible: true})
	await page.click("#select2-form_step2_id_tax_rules_group-container")
	await page.keyboard.type(ccode);
  await page.keyboard.press('Enter')
	await page.click("#form_step2_price", {clickCount: 2})
  await page.type('#form_step2_price', PRICE)
	await page.click("#submit[value='Save']")
	await page.goto(subtabhref, { waitUntil: 'networkidle0' });
}

const checkPrice = async (browser, page) => {
	const productpreview = await page.$eval("[data-product-id='19'] .text-right .btn-group-action .btn-group a.product-edit.dropdown-item[href]", ({ href }) => href);
  await page.goto(productpreview, { waitUntil: 'networkidle0' });
	const optionvalue = await page.$eval("#_desktop_currency_selector [aria-labelledby='currency-selector-label'] option", option => option.innerText);
	console.log(optionvalue);
	await page.click("#_desktop_currency_selector [aria-labelledby='currency-selector-label']")
	await page.click("#_desktop_currency_selector [aria-labelledby='currency-selector-label'] option :contains('BRL R$')")
//	const pricevalue = await page.$eval(".current-price [itemprop='price']", span => span.innerText);
	console.log(pricevalue);
	//await page.waitFor(5000)
}

const run = async () => {
	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()
	await page.setViewport({ width: 1500, height: 2400 })
	await page.goto(URL, { waitUntil: 'networkidle0' });
	await page.type('#email', EMAIL)
	await page.type('#passwd', PASSWORD)
	await page.click('#submit_login')
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
	console.log(COUNTRIES[12]);
	console.log(COUNTRYCODE[12]);
  const importLocalization = await importLoc(browser, page, COUNTRYCODE[10])
	const changePrice = await setPrices(browser, page, COUNTRYCODE[10])
	const gocheckProduct = await checkPrice(browser, page)
  browser.close()
}

run()
  .then(value => {
    console.log("--------End Of Script :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
