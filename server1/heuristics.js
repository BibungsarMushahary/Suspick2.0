const fs = require('fs');

const rules = JSON.parse(fs.readFileSync('./rules.json', 'utf-8')).rules;

function analyzeHeuristics(html) {
  let score = 0;
  let reasons = [];

  for (let rule of rules) {
    const regex = new RegExp(rule.pattern, 'gi');
    if (regex.test(html)) {
      score += rule.score;
      reasons.push(rule.reason);
    }
  }

  return { score, reasons };
}

module.exports = { analyzeHeuristics };
