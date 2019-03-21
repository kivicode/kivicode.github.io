function toTitle(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

var apps = []

for (var project of document.getElementsByClassName('project')) {
  // console.log(project.id);
  apps.push(new Vue({
    el: '#' + project.id,
    data: {
      title: toTitle(project.id.toString().split('project_')[1].replace('-', ' '))
    }
  }))
}