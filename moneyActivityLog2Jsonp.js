const fs = require('fs');
const readline = require('readline');

const readInterface = readline.createInterface({
  input: fs.createReadStream('moneyActivity.log'),
  // output: process.stdout,
  console: false
});
const lines = [];
readInterface.on('line', function(line) {
  lines.push(line);
});
readInterface.on('close', () => {
  fs.writeFileSync('moneyActivity.jsonp', `
    window.data = [
      ${lines.join(",\n")}
    ];
  `);
});
