
const fs = require('fs');
const readline = require('readline');

const files = fs.readdirSync('../'); // path to AppData\Roaming\Advanced Combat Tracker\FFXIVLogs
const logs = files.filter(i => i.match(/^Network/));

console.log(logs);

let data = {};
fs.writeFileSync('./activity.log', '', 'utf8'); // empty the log file before we start appending
let currentIndex = 0;
read(currentIndex);
let maxMoney = 0;

function read(index) {
  if (!logs[index]) {
    console.log('Finished reading logs');
    return;
  }
  const path = `../${logs[index]}`;

  console.log('reading ' + logs[index] + ' ' + index + '/' + logs.length);
  const readInterface = readline.createInterface({
      input: fs.createReadStream(path),
      // output: process.stdout,
      console: false
  });
  readInterface.on('line', function(line) {
    const cols = line.split('|');

    if (
      cols[0] === '252'
      && cols[2] === '00000050'
      && line.indexOf('7D0') !== -1
      && cols[3].indexOf('101E') !== -1 // your 8 hex digit character id
    ) {
      const date = new Date(cols[1]);
      const time = date.getTime();
      const money = parseInt(cols[15], 16);
      if (money > maxMoney) {
        maxMoney = money;
      } else if (money > 0.5 * maxMoney) {
        // safeguard to exclude badly parsed data
        // (i know i won't suddenly spend 50% of my money in one go)
        const newData = {
          time,
          type: 'money',
          money,
        };
        save(newData);
      }
    }

    if (cols[2] === '0047') {
      // sale
      const date = new Date(cols[1]);
      const time = date.getTime();
      const msg = cols[4];
      const params = msg.match(/(The)?(.*)(.*) you put up for sale in the (.*) markets (has|have) sold for (.*) gil \(after fees\)\./);
      if (params) {
        const count = parseInt(params[2]) || 1;
        const item = params[3];
        const location = params[4];
        const price = parseInt(params[6].replace(/\D/g, ''));
        // console.log('  sale:', time, count, item, price);
        const newData = {
          time,
          type: 'sale',
          item,
          count,
          price,
        };
        save(newData);
      }
    }

    if ((cols[2] === '08c2' || cols[2] === '0842') && cols[4].indexOf('You synthesize') !== -1) {
      // craft
      const date = new Date(cols[1]);
      const time = date.getTime();
      const msg = cols[4];
      const params = msg.match(/You synthesize (.*)(.*)\./);
      if (params) {
        const count = parseInt(params[1]) || 1;
        const item = params[2];
        // console.log('  craft:', time, count, item);
        const newData = {
          time,
          type: 'craft',
          item,
          count,
        };
        save(newData);
      }
    }

    if (cols[2] === '0039' && cols[4].indexOf('You purchase') !== -1) {
      // craft
      const date = new Date(cols[1]);
      const time = date.getTime();
      const msg = cols[4];
      const params = msg.match(/You purchase (.*)(.*)\./);
      if (params) {
        const count = parseInt(params[1]) || 1;
        const item = params[2];
        const newData = {
          time,
          type: 'purchase',
          item,
          count,
        };
        save(newData);
      }
    }

  });

  readInterface.on('close', () => {
    console.log('finished ' + logs[index]);
    currentIndex++;
    read(currentIndex);
  });
}

function save(newData){
  fs.appendFileSync('./activity.log', JSON.stringify(newData) + "\n", 'utf8');
}