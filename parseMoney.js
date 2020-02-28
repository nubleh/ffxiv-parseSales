
const fs = require('fs');
const readline = require('readline');

const filesPath = '../'; // path to AppData\Roaming\Advanced Combat Tracker\FFXIVLogs

const files = fs.readdirSync(filesPath).filter(fileName => fileName.match(/\d{8}/)).sort((fileA, fileB) => {
  const fileADate = fileA.match(/_(\d{8})/);
  const fileBDate = fileB.match(/_(\d{8})/);
  if (parseInt(fileADate[2]) > parseInt(fileBDate[2])) {
    return 1;
  }
  if (parseInt(fileADate[2]) < parseInt(fileBDate[2])) {
    return -1;
  }
  if (parseInt(fileADate[1]) > parseInt(fileBDate[1])) {
    return 1;
  }
  if (parseInt(fileADate[1]) < parseInt(fileBDate[1])) {
    return -1;
  }
  return 0;
});
const logs = files.filter(i => i.match(/^Network/));

console.log(logs);

const fileName = 'moneyActivity.log';
let data = {};
fs.writeFileSync(fileName, '', 'utf8'); // empty the log file before we start appending
let currentIndex = 0;
read(currentIndex);
let maxMoney = 0;

function read(index) {
  if (!logs[index]) {
    console.log('Finished reading logs');
    return;
  }
  const path = `${filesPath}${logs[index]}`;

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
      date.setSeconds(0);
      date.setMilliseconds(0);
      date.setMinutes(0);
      const time = date.getTime();
      const money = parseInt(cols[15], 16);

      if (money > 999999999) {
        return;
      }
      if (money > maxMoney) {
        maxMoney = money;
      } else if (money > 0.5 * maxMoney) {
        const timeKey = date.toString();
        // safeguard to exclude badly parsed data
        // (i know i won't suddenly spend 50% of my money in one go)
        if (!data[timeKey]) {
          data[timeKey] = true;
          const newData = {
            time,
            type: 'money',
            money,
            dateString: getDateString(date),
          };
          save(newData);
        }
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
  fs.appendFileSync(fileName, JSON.stringify(newData) + "\n", 'utf8');
}
function pad(a) {
  let output = a + '';
  while(output.length < 2) {
    output = '0' + output;
  }
  return output;
}
function getDateString(date) {
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}