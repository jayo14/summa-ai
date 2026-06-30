(() => {
  const result = {};

  // 1. Get CSS custom properties from :root
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = {};
  for (let i = 0; i < rootStyles.length; i++) {
    const prop = rootStyles[i];
    if (prop.startsWith('--')) {
      cssVars[prop] = rootStyles.getPropertyValue(prop).trim();
    }
  }
  result.cssVariables = cssVars;

  // 2. Get unique colors and font-families from all elements
  const colors = new Set();
  const bgColors = new Set();
  const borderColors = new Set();
  const fontFamilies = new Set();
  const fontSizes = {};
  const fontWeights = {};
  const lineHeights = {};
  const letterSpacings = {};

  const all = document.querySelectorAll('*');
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') colors.add(cs.color);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(cs.backgroundColor);
    if (cs.borderColor && cs.borderColor !== 'rgba(0, 0, 0, 0)') borderColors.add(cs.borderColor);
    if (cs.fontFamily) fontFamilies.add(cs.fontFamily);
    if (cs.fontSize) fontSizes[cs.fontSize] = (fontSizes[cs.fontSize] || 0) + 1;
    if (cs.fontWeight) fontWeights[cs.fontWeight] = (fontWeights[cs.fontWeight] || 0) + 1;
    if (cs.lineHeight) lineHeights[cs.lineHeight] = (lineHeights[cs.lineHeight] || 0) + 1;
    if (cs.letterSpacing) letterSpacings[cs.letterSpacing] = (letterSpacings[cs.letterSpacing] || 0) + 1;
  }

  result.colors = [...colors];
  result.backgroundColors = [...bgColors];
  result.borderColors = [...borderColors];
  result.fontFamilies = [...fontFamilies];
  result.fontSizes = fontSizes;
  result.fontWeights = fontWeights;
  result.lineHeights = lineHeights;
  result.letterSpacings = letterSpacings;

  // 3. Get key elements styles
  const keySelectors = ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'nav', 'header', 'footer'];
  const keyStyles = {};
  for (const sel of keySelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const cs = getComputedStyle(el);
      keyStyles[sel] = {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
      };
    }
  }
  result.keyElementStyles = keyStyles;

  // 4. Get all loaded stylesheets' href
  const sheets = [];
  for (const sheet of document.styleSheets) {
    try { sheets.push(sheet.href || 'inline'); } catch (e) { sheets.push('blocked'); }
  }
  result.stylesheets = sheets;

  // 5. Get page fonts loaded via link tags
  const fontLinks = [];
  document.querySelectorAll('link[rel=stylesheet], link[rel=preconnect]').forEach(l => {
    if (l.href && (l.href.includes('font') || l.href.includes('googleapis') || l.href.includes('gstatic'))) {
      fontLinks.push(l.href);
    }
  });
  result.fontLinks = fontLinks;

  return JSON.stringify(result, null, 2);
})()
