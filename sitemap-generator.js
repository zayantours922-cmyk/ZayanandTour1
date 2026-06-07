const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Define all your static routes here
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/round-tours', changefreq: 'daily', priority: 0.9 },
  { url: '/packages', changefreq: 'weekly', priority: 0.8 },
  { url: '/vehicle', changefreq: 'weekly', priority: 0.8 },
  { url: '/drivers', changefreq: 'weekly', priority: 0.7 },
  { url: '/reviews', changefreq: 'weekly', priority: 0.7 },
  { url: '/contact', changefreq: 'weekly', priority: 0.8 },
];

async function generateSitemap() {
  try {
    const sitemap = new SitemapStream({ 
      hostname: 'https://www.toursguidesrilanka.com' 
    });
    
    const writeStream = createWriteStream(
      path.join(__dirname, 'public', 'sitemap.xml')
    );
    
    sitemap.pipe(writeStream);
    
    // Write each link to the sitemap
    links.forEach(link => sitemap.write(link));
    
    sitemap.end();
    
    await streamToPromise(sitemap);
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

generateSitemap();