# ffxiv-parseSales
parse ACT logs and visualize your market and crafting activities

This script reads your filesystem to parse ACT logs.  
If you don't trust it to not fuck up your system, read the script and make sure i'm not doing anything suspicious.

# Is there a demo?

http://nubleh.github.io/ffxiv/parseSales/

# What do i need?

- nodejs

# How do i use it?

- Go to your ACT logs directory (`AppData\Roaming\Advanced Combat Tracker\FFXIVLogs`)
- Clone the git repo or download the scripts to `AppData\Roaming\Advanced Combat Tracker\FFXIVLogs\ffxiv-parseSales`
- (You can put this anywhere really, just edit `parseSales.js` to point it to where the logs are at)
- Open `parseSales.js` and look for `cols[3].indexOf('101E')`. Replace `101E` with your character id (or a substring of it)
- Run `node parseSales.js`
- This creates `activity.log` that looks like this:

```
...
{"time":1569281126693,"type":"money","money":136245265}
{"time":1569281126000,"type":"purchase","item":"durium nuggets","count":10}
{"time":1569281136999,"type":"money","money":136224499}
{"time":1569281136000,"type":"purchase","item":"star spinels","count":22}
{"time":1569281167557,"type":"money","money":136219599}
{"time":1569281167000,"type":"purchase","item":"chunks of Gyr Abanian alumen","count":14}
{"time":1569281175000,"type":"craft","item":"circle of gyuki leather","count":1}
...
```

- Run `node parseSalesConvert.js`
- This creates `activity.json` that looks like this: (this file is actually not used)

```
{
  "1567084775000": {
    "time": 1567084775000,
    "type": "sale",
    "item": "pair of facet bottoms of maiming HQ",
    "count": 1,
    "price": 220400
  },
  "1567086741000": {
    "time": 1567086741000,
    "type": "sale",
    "item": "facet bracelet of fending HQ",
    "count": 1,
    "price": 92150
  },
...
```

- It also creates `activity.jsonp` that looks like this:

```
window.data = {
  "1567084775000": {
    "time": 1567084775000,
    "type": "sale",
    "item": "pair of facet bottoms of maiming HQ",
    "count": 1,
    "price": 220400
  },
  "1567086741000": {
    "time": 1567086741000,
    "type": "sale",
    "item": "facet bracelet of fending HQ",
    "count": 1,
    "price": 92150
  },
...
```

- Open `parseSales.html` in your web browser

# Money only chart

- modify `parseMoney.js` to add your character id, replacing `'101E'`
- run `node parseMoney.js`
- run `node moneyActivityLog2Jsonp.js`
- open `moneyActivity.html`

# How do i stop the animation?

Click on the money

# Can i show more than 60 rows per column?

Yes, open `parseSales.html` and modify `numberOfRowsToShow`

# For some reason it's not showing data any earlier than Sep 14 2019

Open `parseSales.html` and modify `dataBegin`. Set it to 0 to remove this cutoff.

# Some data were not parsed from my ACT logs

Open the FFXIV settings in ACT and ensure `(DEBUG) Log all Network Packets` is enabled.  
Next, open `parseSales.js` and look for `cols[3].indexOf('101E')`. Replace `101E` with your character id (or a substring of it)

# How do i get my character id?

Open some of your ACT logs and look for lines that look like this

```
252|2019-10-20T23:48:44.1080000+09:00|00000128|101E____|101E____
```

The `101E____` string there is your character id.

