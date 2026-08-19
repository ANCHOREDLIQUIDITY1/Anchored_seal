const fs = require('fs');
const { execSync } = require('child_process');

// Install marked if not present
try {
  require.resolve('marked');
} catch (e) {
  console.log('Installing marked for markdown conversion...');
  execSync('npm install marked --no-save', { stdio: 'inherit' });
}

const { marked } = require('marked');

const mdFile = 'chapter_3_methodology.md';
const htmlFile = 'chapter_3_methodology.html';

console.log(`Reading ${mdFile}...`);
const markdown = fs.readFileSync(mdFile, 'utf8');

// Parse markdown to HTML
console.log('Converting to HTML...');
let htmlContent = marked.parse(markdown);

// marked puts mermaid blocks in <pre><code class="language-mermaid">...</code></pre>
// Mermaid needs them in <div class="mermaid">...</div> or <pre class="mermaid">...</pre>
htmlContent = htmlContent.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, '<div class="mermaid">$1</div>');

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chapter 3 - Methodology</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
    <style>
        body {
            box-sizing: border-box;
            background-color: #ffffff !important;
            color: #24292f !important;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        @media print {
            body { margin: 0; padding: 0; max-width: none; }
            .markdown-body { padding: 0; }
            img { max-width: 100% !important; page-break-inside: avoid; }
            .mermaid { page-break-inside: avoid; }
            h1, h2, h3 { page-break-after: avoid; }
        }
    </style>
</head>
<body class="markdown-body">
    ${htmlContent}
    
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
`;

fs.writeFileSync(htmlFile, htmlTemplate);
console.log(`Successfully generated ${htmlFile}!`);
console.log(`\nTo get your PDF:`);
console.log(`1. Open ${htmlFile} in Google Chrome or Edge.`);
console.log(`2. Wait 1-2 seconds for the flowcharts to render.`);
console.log(`3. Press Ctrl+P (or right-click -> Print).`);
console.log(`4. Set Destination to "Save as PDF" and check "Background graphics" if needed.`);
console.log(`5. Click Save!`);
