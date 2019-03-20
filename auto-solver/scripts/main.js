let myList = ''
let headers, solves;

String.prototype.replaceAll = function(search, replace) {
  return this.split(search).join(replace);
}

function run() {
  addLog('Send an ajax request');
  setTimeout(function() {
    addLog('Waiting for an answer')
  }, 1000);
  axios({
    method: 'post',
    url: 'https://api.flex.io/v1/me/pipes/plnflh84j2g3/run?api_key=zzhzbhfkcntndqtxmsyj',
    headers: {
      Authorization: 'Bearer {token}'
    }
  }).then(response => {
    myList = response.data;
    myList = Object.keys(myList).map(function(key) {
      return [Number(key), myList[key]];
    });
    var table = document.getElementById('out');
    let iter = 0;
    for (var i of myList) {
      let text = prepare(JSON.stringify(i[1])).replaceAll('\\n', '<br>').replaceAll('\\t', '&nbsp;&nbsp;&nbsp;&nbsp;');
      console.log(text);
      table.innerHTML += (iter > 0 ? '<hr>' : '') + text;
      iter++;
    }
    addLog('Answer got');
  }).catch(response => {})
}

function prepare(txt) {
  let out = txt;
  out = out.replace('{\"', '').replace('\"}', '');
  task = out.split('\":\"')[0];
  solve = out.split('\":\"')[1]
  return '<tr><th>' + task.replace('\"') + '</th><th>' + solve + '</th></tr>';
}

function getDate() {
  var currentdate = new Date();
  return currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
}

function addLog(text) {
  var logger = document.getElementById('log');
  logger.innerHTML += '[Log ' + getDate() + '] ' + text + '<br>';
}