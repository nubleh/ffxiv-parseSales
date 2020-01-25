const fs = require('fs');
const readline = require('readline');
fs.writeFileSync('./money.csv', '', 'utf8'); // empty the log file before we start appending

const readInterface = readline.createInterface({
  input: fs.createReadStream('./activity.log'),
  console: false
});
readInterface.on('line', function(line) {
  try {
    const data = JSON.parse(line);
    if (data.type !== 'money') {
      return;
    }
    const { time, money } = data;
    const date = new Date(time);
    const outputLine = `${`${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`},${money}\n`;
    console.log(outputLine);
    fs.appendFileSync('./money.csv', outputLine, 'utf8');
  }catch(e){
    console.log(e.message)
  }
});

function pad(a) {
  let output = a + '';
  while(output.length < 2) {
    output = '0' + output;
  }
  return output;
}