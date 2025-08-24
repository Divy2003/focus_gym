/**
 * Generates HTML for viewing a PDF with options to open in new tab or download
 * @param {Object} options - Configuration options
 * @param {string} options.title - Title of the diet plan
 * @param {string} options.viewUrl - URL to view the PDF
 * @param {string} options.downloadUrl - URL to download the PDF
 * @param {string} options.id - Diet plan ID
 * @returns {string} HTML string for the PDF viewer
 */
const generatePDFViewerHTML = ({ title, viewUrl, downloadUrl, id }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Diet Plan - ${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: Arial, sans-serif; 
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header { 
      margin-bottom: 20px; 
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }
    .links { 
      margin: 15px 0; 
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .links a { 
      display: inline-block;
      padding: 8px 16px; 
      background: #4CAF50; 
      color: white; 
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.3s;
      font-size: 14px;
      border: none;
      cursor: pointer;
    }
    .links a:hover {
      background: #3d8b40;
    }
    .links a.secondary {
      background: #f0f0f0;
      color: #333;
    }
    .links a.secondary:hover {
      background: #e0e0e0;
    }
    iframe { 
      width: 100%; 
      min-height: 70vh; 
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fafafa;
    }
    .error { 
      display: none;
      color: #d32f2f; 
      padding: 16px; 
      background: #ffebee; 
      border: 1px solid #ef9a9a; 
      border-radius: 4px;
      margin-top: 15px;
    }
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 15px;
      }
      .links {
        flex-direction: column;
      }
      .links a {
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <div class="links">
        <a href="${viewUrl}" target="_blank" rel="noopener noreferrer">
          Open in New Tab
        </a>
        <a href="${downloadUrl || `/api/diet/${id}/download`}" class="secondary">
          Download PDF
        </a>
        <a href="/diet-plans" class="secondary">
          Back to Plans
        </a>
      </div>
    </div>
    
    <iframe 
      src="${viewUrl}" 
      title="${title} - Diet Plan"
      onerror="document.querySelector('.error').style.display='block'"
      onload="document.querySelector('.error').style.display='none'"
    >
      <div class="error">
        Your browser does not support PDFs. Please download the PDF to view it: 
        <a href="${downloadUrl || `/api/diet/${id}/download`}">Download PDF</a>
      </div>
    </iframe>
    
    <div class="error" style="display:none;">
      There was an error loading the PDF. Please try 
      <a href="${viewUrl}" target="_blank" rel="noopener noreferrer">opening it in a new tab</a> 
      or <a href="${downloadUrl || `/api/diet/${id}/download`}">downloading it</a>.
    </div>
  </div>
  
  <script>
    // Add a small delay to handle potential slow loading
    setTimeout(() => {
      const iframe = document.querySelector('iframe');
      const errorDiv = document.querySelector('.error');
      
      // Check if iframe loaded successfully
      try {
        if (iframe.contentDocument.body.innerHTML.trim() === '') {
          errorDiv.style.display = 'block';
        }
      } catch (e) {
        errorDiv.style.display = 'block';
      }
    }, 2000);
  </script>
</body>
</html>
`;
};

module.exports = { generatePDFViewerHTML };
