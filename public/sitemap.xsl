<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Summerland Estates Sitemap</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: #f7f3ee;
            color: #1d2018;
          }
          .container {
            max-width: 960px;
            margin: 0 auto;
            background: #fff;
            border-radius: 24px;
            border: 1px solid #e8dfd3;
            padding: 32px;
            box-shadow: 0 24px 80px rgba(74,73,63,0.08);
          }
          h1 {
            font-size: 1.75rem;
            margin: 0 0 8px;
            font-weight: 600;
          }
          p { margin: 0 0 24px; color: #6d6d6d; }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          th, td {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #ede8e2;
          }
          th {
            background: #f5efe7;
            font-weight: 600;
            color: #4a4a3f;
          }
          tr:hover td { background: #faf8f5; }
          a { color: #6d7662; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .meta { color: #8a8279; font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Summerland Estates Sitemap</h1>
          <p class="meta">This XML sitemap is intended for search engines. Total URLs: <xsl:value-of select="count(s:urlset/s:url)" />.</p>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td>
                    <a href="{s:loc}">
                      <xsl:value-of select="s:loc" />
                    </a>
                  </td>
                  <td><xsl:value-of select="s:lastmod" /></td>
                  <td><xsl:value-of select="s:changefreq" /></td>
                  <td><xsl:value-of select="s:priority" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
