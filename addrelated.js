
const addrelated = async (browser, page) => {
	const subtabhref = await page.$eval('#subtab-AdminProducts' + ' a.link[href]', ({ href }) => href);
  await page.goto(subtabhref, { waitUntil: 'networkidle0' });
	await page.click("[data-product-id='19'] img", { waitUntil: 'domcontentloaded' })

	await page.select("#form_step1_type_product", "1")

	await page.waitFor(5000)

	await page.waitForSelector("#related-product #add-related-product-button[type='button']")
  await page.click("#related-product #add-related-product-button[type='button']", { waitUntil: 'domcontentloaded' })

	await page.waitForSelector(".search.search-with-icon input#form_step1_related_products", {visible: true})
	await page.click(".search.search-with-icon input#form_step1_related_products", { waitUntil: 'domcontentloaded' })
	await page.keyboard.type("t-shirt");
	await page.waitForSelector("div.tt-menu.tt-open", {visible: true})
//	await page.waitFor(5000)
	await page.click("#related-product #related-content .search.search-with-icon .tt-menu.tt-open .tt-dataset.tt-dataset-3")
//	await page.click("#related-product #related-content .search.search-with-icon .tt-menu.tt-open .tt-dataset.tt-dataset-3 img")
//	await page.click("div.tt-menu.tt-open")
	//console.log(pricevalue);
	await page.waitFor(5000)
}
