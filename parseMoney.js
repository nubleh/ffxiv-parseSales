
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

const historyFilepath = 'moneyActivityHistory.json';
const history = (() => {
  try {
    return JSON.parse(fs.readFileSync(historyFilepath, 'utf8'));
  } catch(e) {
    console.log(e);
    return {};
  }
})();
const jsonPPath = './moneyActivity.jsonp';
const cacheDir = './cache/';
if(!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

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
    console.log('Finished reading logs, now compiling data');
    compile();
    return;
  }
  const filename = logs[index];
  const path = `${filesPath}${filename}`;

  const stats = fs.statSync(path);
  if (stats.size === history[filename]) {
    console.log(filename + ' unchanged.');
    currentIndex++;
    read(currentIndex);
    return;
  }
  history[filename] = 0;
  fs.writeFileSync(historyFilepath, JSON.stringify(history, null, 2));
  const cachePath = cacheDir + filename + '.cache.log';
  fs.writeFileSync(cachePath, '', 'utf8');

  console.log('reading ' + filename + ' ' + (index + 1) + '/' + logs.length);
  let dataBuffer = {};
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
      date.setMinutes(15 * Math.floor(date.getMinutes() / 15));
      const time = date.getTime();
      const money = parseInt(cols[15], 16);

      if (money > 999999999) {
        return;
      }
      if (money > maxMoney) {
        maxMoney = money;
      } else if (money > 0.5 * maxMoney) {
        // safeguard to exclude badly parsed data
        // (i know i won't suddenly spend 50% of my money in one go)
        const timeKey = date.toString();
        dataBuffer = {
          data: {
            time,
            type: 'money',
            money,
            dateString: getDateString(date),
          },
          cachePath,
        };
        if (!data[timeKey]) {
          data[timeKey] = true;
          fs.appendFileSync(cachePath, JSON.stringify(dataBuffer.data) + "\n", 'utf8');
        }
      }
    }

  });

  readInterface.on('close', () => {
    console.log('finished ' + logs[index]);
    fs.appendFileSync(dataBuffer.cachePath, JSON.stringify({
      ...dataBuffer.data,
      time: dataBuffer.data.time + 1,
    }) + "\n", 'utf8');
    history[filename] = stats.size;
    fs.writeFileSync(historyFilepath, JSON.stringify(history, null, 2));
    currentIndex++;
    read(currentIndex);
  });
}

function compile() {
  const cacheFiles = fs.readdirSync(cacheDir).filter(fileName => fileName.match(/\d{8}/)).sort((fileA, fileB) => {
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
  fs.writeFileSync(jsonPPath, '');
  fs.appendFileSync(jsonPPath, "window.data=[\n", 'utf8');
  compileFile(cacheFiles, 0);
}

function compileFile(cacheFiles, index) {
  const filePath = cacheDir + cacheFiles[index];
  if (!cacheFiles[index]) {
    fs.appendFileSync(jsonPPath, "];\n", 'utf8');
    return;
  }
  const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath),
    console: false
  });
  readInterface.on('line', function(line) {
    fs.appendFileSync(jsonPPath, line + ",\n", 'utf8');
  });
  readInterface.on('close', function(line) {
    compileFile(cacheFiles, index + 1);
  });
}
// function saveWithCache(newData, filename, logpath) {
//   const { size } = fs.statSync(logpath);
//   if (history[filename] === size) {
//     return;
//   }
//   const cachePath = './cache/' + filename + '.cache.log';
//   fs.appendFileSync(cachePath, JSON.stringify(newData) + "\n", 'utf8');
//   history[filename] = size;
//   fs.writeFileSync(historyFilepath, JSON.stringify(history, null, 2));

//   const cacheExists = fs.existsSync(cachePath);
//   if (!cacheExists) {
//     saveToCache(newData, cachePath);
//     return;
//   }
  
//   const { size } = fs.statSync(cachePath);
//   const oldSize = history[filename];
//   if (!oldSize || size !== oldSize) {
//     saveToCache(newData, cachePath);
//     return;
//   }
//   fs.writeFileSync(cachePath, '', 'utf8');
// }

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