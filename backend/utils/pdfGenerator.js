// Auto-detect environment and load appropriate Puppeteer
let puppeteer = null;
let chromium = null;
let isLambda = false;

// Check if running in Lambda
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  isLambda = true;
  try {
    // Lambda environment - use puppeteer-core + chromium
    chromium = require('@sparticuz/chromium');
    puppeteer = require('puppeteer-core');
    console.log('🔧 Running in Lambda - using puppeteer-core + @sparticuz/chromium');
  } catch (err) {
    console.error('❌ Failed to load Lambda Puppeteer dependencies:', err.message);
  }
} else {
  // Local environment - use regular puppeteer
  try {
    puppeteer = require('puppeteer');
    console.log('🔧 Running locally - using puppeteer');
  } catch (err) {
    console.warn('⚠️ Puppeteer not available - PDF generation will be disabled');
  }
}

/**
 * Generate PDF from HTML content (works in both local and Lambda)
 * @param {string} html - HTML content to convert
 * @param {object} options - PDF options
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDF(html, options = {}) {
  if (!puppeteer) {
    throw new Error('Puppeteer is not available in this environment');
  }

  let browser = null;
  
  try {
    console.log('🚀 Launching browser...');
    
    // Launch browser based on environment
    if (isLambda) {
      // Lambda configuration with chromium
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      // Local configuration
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page = await browser.newPage();
    
    console.log('📄 Setting content...');
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000
    });

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      ...options
    });

    console.log('✅ PDF generated successfully');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

/**
 * Generate PDF from URL (works in both local and Lambda)
 * @param {string} url - URL to convert
 * @param {object} options - PDF options
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePDFFromURL(url, options = {}) {
  if (!puppeteer) {
    throw new Error('Puppeteer is not available in this environment');
  }

  let browser = null;
  
  try {
    console.log('🚀 Launching browser for URL PDF...');
    
    // Launch browser based on environment
    if (isLambda) {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }

    const page = await browser.newPage();
    
    console.log(`📄 Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false,
      margin: options.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      ...options
    });

    console.log('✅ PDF generated successfully');
    return pdfBuffer;
    
  } catch (error) {
    console.error('❌ PDF generation from URL error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Check if PDF generation is available
 * @returns {boolean}
 */
function isPDFGenerationAvailable() {
  return puppeteer !== null;
}

module.exports = {
  generatePDF,
  generatePDFFromURL,
  isPDFGenerationAvailable
};
