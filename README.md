# Puppeteer Accessibility Audit

Lightweight library for performing accessibility audits of URL's or files using [Chrome Accessibility Tools](https://www.npmjs.com/package/accessibility-developer-tools)

Utilises [GoogleChrome/puppeteer](https://github.com/GoogleChrome/puppeteer) and [GoogleChrome/accessibility-developer-tools](https://github.com/GoogleChrome/accessibility-developer-tools).

## Installation

```shell
npm install --save-dev puppeteer-accessibility-audit
```
or
```shell
yarn add --dev puppeteer-accessibility-audit
```

## Usage

```javascript
const paa = require('puppeteer-accessibility-audit');

// Launch puppeteer to begin auditing
await paa.launch();

// Audit the supplied file and return the result
let paaResult = await paa.audit("test-file.html", opts);

// This is important to terminate any running chromium processes
await paa.destroy();
```

`audit()` will return an object with two properties

* `audit`: An array containing every failure of that file
* `report`: Contains the result of [`axs.Audit.createReport`](https://github.com/GoogleChrome/accessibility-developer-tools#creating-a-useful-error-message)

## Config

Config can be supplied to `paa.launch()`

* `puppeteerConfig` is passed to: [puppeteer.launch](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions)
* `viewport` is passed to: [page.setViewport](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetviewportviewport)
* `auditScopeSelector` is used to target the audit and is passed to a `document.querySelector`. 

For example

```javascript
await paa.launch({
  puppeteerConfig: {
    timeout: 5000,
    headless: false
  },
  viewport: {
    width: 1920,
    height: 1080
  },
  auditScopeSelector: "#content"
});
```

## Credits

Lots of copy and pasting of [a11y](https://github.com/addyosmani/a11y) by [Addy Osmani](https://github.com/addyosmani)