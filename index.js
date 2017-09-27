'use strict';

const path = require('path');
const puppeteer = require('puppeteer');
const protocolify = require('protocolify');

class PuppeteerAccessibilityAudit {
  
  constructor() {
    this.options = {
      puppeteerConfig: {
        timeout: 5000 // 5 seconds
      },
      auditScopeSelector: "body"
    };
    this.browser = null;
    this.externalBrowserInstance = false;  
  }

  async launch(opts) {
    this.options = Object.assign({}, this.options, opts);

    if (this.options.browser) {
      this.browser = options.browser;
      this.externalBrowserInstance = true;
    }

    if (!this.browser) {
      this.browser = await puppeteer.launch(this.options.puppeteerConfig);
    }
  } 

  async audit(url) {
    if (!this.browser) {
      throw new Error('You must called the `launch` method first to start puppeteer');
    }

    if (!(url && url.length > 0)) {
      throw new Error('Specify at least one URL');
    }

    const page = await this.browser.newPage();

    try 
    {
      url = protocolify(url);
      
      if (this.options.viewport) {
        await page.setViewport(this.options.viewport);
      }
    
      try {
        await page.goto(url);
      }
      catch (err) {
        return {
          code: "PUPPETEER_LOAD_ERROR",
          heading: `Unable to load page: ${err.message}`,
          result: "NA",
          severity: "WARNING",
          url: url,
          elements: ""
        };
      }
      
      await page.injectFile('node_modules/accessibility-developer-tools/dist/js/axs_testing.js');
      
      const {audit, report} = await page.evaluate((options) => 
      {
        const auditConfig = new axs.AuditConfiguration();
        auditConfig.scope = document.querySelector(options.auditScopeSelector);

        const results = axs.Audit.run(auditConfig);      

        const audit = results.map(function (result) {
          let DOMElements = result.elements;
          let message = '';

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

        const output = {
          audit: audit,
          report: axs.Audit.createReport(results)
        };

        return JSON.parse(JSON.stringify(output));      
      }, this.options);

      return { audit, report }

    } catch (error) {
      throw error;
    }
    finally {
      await page.close();
    }
  }

  async destroy() {
    if (!this.externalBrowserInstance && this.browser) {
      await this.browser.close();
    }

    this.browser = null;
    this.externalBrowserInstance = false;
  }
}

module.exports = new PuppeteerAccessibilityAudit();