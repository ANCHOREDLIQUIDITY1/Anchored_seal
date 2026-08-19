const fs = require('fs');
const mdFile = 'chapter_3_methodology.md';
let markdown = fs.readFileSync(mdFile, 'utf8');

// The base artifact dir is C:/Users/USER/.gemini/antigravity-ide/brain/01fb6df7-2302-4a84-b91d-9e86e9100364
const prefix = 'file:///C:/Users/USER/.gemini/antigravity-ide/brain/01fb6df7-2302-4a84-b91d-9e86e9100364/';

// Replace Landing Page
markdown = markdown.replace(/!\[Landing Page Interface\]\(.+?\)/, `![Landing Page Interface](${prefix}landing_page_real.png)`);

// Replace Dashboard
markdown = markdown.replace(/!\[Dashboard Interface\]\(.+?\)/, `![Dashboard Interface](${prefix}dashboard_real.png)`);

// Replace Agreement Creation
markdown = markdown.replace(/!\[Agreement Creation Interface\]\(.+?\)/, `![Agreement Creation Interface](${prefix}agreements_real.png)`);

// Replace Signing Interface (since we took templates, let's just use it as a placeholder or replace it with templates)
markdown = markdown.replace(/!\[Signing Interface\]\(.+?\)/, `![Templates Interface](${prefix}templates_real.png)`);
// Change the caption for the last one too
markdown = markdown.replace(/\*Figure 3.4: Signature Pad Modal allowing draw, type, and upload functionalities.\*/, '*Figure 3.4: Templates interface showing predefined document structures.*');

fs.writeFileSync(mdFile, markdown);
console.log('Markdown images updated!');
