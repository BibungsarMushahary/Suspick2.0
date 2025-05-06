function checkDOMFeatures(html) {
    const reasons = [];
    let score = 0;
  
    const scriptCount = (html.match(/<script/gi) || []).length;
    if (scriptCount > 100) {
      score += 2;
      reasons.push("Excessive number of script tags");
    }
  
    const inlineSuspicious = html.includes("onerror") || html.includes("eval(");
    if (inlineSuspicious) {
      score += 2;
      reasons.push("Suspicious inline script or eval usage");
    }
  
    return { score, reasons };
  }
  
  // ✅ Export it as default so app.js can import it as `dom`
  export default {
    checkDOMFeatures
  };
  