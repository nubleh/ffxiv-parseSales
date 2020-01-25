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
    console.log(time, money);
    fs.appendFileSync('./money.csv', `${time},${money}\n`, 'utf8');
  }catch(e){
    console.log(e.message)
  }
});
