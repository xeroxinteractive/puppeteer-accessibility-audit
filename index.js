'use strict';

const path = require('path');
const puppeteer = require('puppeteer');
const protocolify = require('protocolify');

module.exports = (url, opts, cb) => {
  if (typeof opts !== 'object') {
      cb = opts;
      opts = {};
  }

  opts = opts || {};

  if (typeof cb !== 'function') {
      throw new TypeError('Callback required');
  }

  if (!(url && url.length > 0)) {
      throw new Error('Specify at least one URL');
  }

  url = protocolify(url);

  puppeteer.launch().then(async (browser) => 
  {
    try 
    {
      const page = await browser.newPage();
      
      if (opts.viewport) {
        await page.setViewport(opts.viewport);
      }
    
      await page.goto(url);
      await page.injectFile('node_modules/accessibility-developer-tools/dist/js/axs_testing.js');
      
      const {audit, report} = await page.evaluate(() => 
      {
        const auditConfig = new axs.AuditConfiguration();
        auditConfig.scope = document.body

        const results = axs.Audit.run(auditConfig);      

        const audit = results.map(function (result) {
          const DOMElements = result.elements;
          const message = '';

          if (DOMElements !== undefined) {
            for (let i = 0; i < DOMElements.length; i++) {
              const el = DOMElements[i];
              message += '\n';
              // Get query selector not browser independent. catch any errors and
              // default to simple tagName.
              try {
                message += axs.utils.getQuerySelectorText(el);
              } catch (err) {
                message += ' tagName:' + el.tagName;
                message += ' id:' + el.id;
              }
            }
          }

          return {
            code: result.rule.code,
            heading: result.rule.heading,
            result: result.result,
            severity: result.rule.severity,
            url: result.rule.url,
            elements: message
          };
        });

        const result = {
          audit: audit,
          report: axs.Audit.createReport(results)
        };

        return JSON.parse(JSON.stringify(result));      
      });

      cb(null, audit, report);

    } catch (error) {
      cb(error);
    }
    finally {
      await browser.close();
    }
  })
  .catch(async (error) => {
    cb(error);
  });
};
