const fs = require('fs');
const readline = require('readline');

const data = {};

const path = './activity.log';
const readInterface = readline.createInterface({
  input: fs.createReadStream(path),
  console: false
});
readInterface.on('line', function(line) {
  const lineData = JSON.parse(line);
  if (lineData.item && lineData.item.match(/for .* gil/)) {
    // npc bought items
    return;
  }
  if (lineData.item) {
    // rename plurals
    lineData.item = lineData.item.replace('chunks of', 'chunk of')
      .replace(' ', ' HQ')
      .replace('', 'HQ')
      .replace('bottles of', 'bottle of')
      .replace('bundles of', 'bundle of')
      .replace('bolts of', 'bolt of')
      .replace(/skins$/, 'skin')
      .replace(/skins HQ$/, 'skin HQ')
      .replace(/logs$/, 'log')
      .replace(/logs HQ$/, 'log HQ')
      .replace(/ingots$/, 'ingot')
      .replace(/ingots HQ$/, 'ingot HQ')
      .replace(/cocoons$/, 'cocoon')
      .replace(/cocoons HQ$/, 'cocoon HQ')
      .replace(/nuggets$/, 'nugget')
      .replace(/nuggets HQ$/, 'nugget HQ')
      .replace(/bolls$/, 'boll')
      .replace(/bolls HQ$/, 'boll HQ')
      .replace('bunches of', 'bunch of')
      .replace('fragments of', 'fragment of')
      .replace('handfuls of', 'handful of')
      .replace('lengths of', 'length of')
      .replace('loops of', 'loop of')
      .replace('lumps of', 'lump of')
      .replace('phials of', 'phial of')
      .replace('pieces of', 'piece of')
      .replace('pots of', 'pot of')
      .replace('spindles of', 'spindle of')
      .replace('sprigs of', 'sprig of')
      .replace('squares of', 'square of')
      .replace('pinches of', 'pinch of')
      .replace('onyxes', 'onyx')
      .replace('celestines', 'celestine')
      .replace('sapphires', 'sapphire')
      .replace('spinels', 'spinel')
      .replace('circles of', 'circle of');
  }
  data[lineData.time] = lineData;
});
readInterface.on('close', () => {
  const json = JSON.stringify(data, null, 2);
  const jsonp = `window.data = ${json}`;
  fs.writeFileSync('./activity.json', json, 'utf8');
  fs.writeFileSync('./activity.jsonp', jsonp, 'utf8');
  console.log('finished.');
});