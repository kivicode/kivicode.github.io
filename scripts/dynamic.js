let tags;
let colors;
let projects;

let tags_app, projects_app;

let filters = [];


function loadTags() {
  return $.ajax({
    url: "../data/tags.json",
    dataType: "json",
  }).done(function(d) {
    tags = d;
  });
}
let test_l;

let repos, lng, icon;

let projects_test = []

function generateGitHubProjects() {
  $.when(getRepos()).done(function(a) {
    for (r in repos) {
      let project = {}
      let repo = repos[r]
      $.when(getLangs(repo.name)).done(function(b) {
        if (Object.keys(lng).length > 0) {
          let url = "https://raw.githubusercontent.com/kivicode/" + "AndroidDetector" + "/master/icon.png"
          project["img"] = url
          project["name"] = repo.name;
          let langs = [];
          // let sliced = lng.slice(0, Math.min(4, Object.keys(lng).length));
          for (var i of Object.keys(lng).slice(0, Math.min(5, Object.keys(lng).length)).map(entry => entry)) {
            let freq = lng[i]
            let name = i
            langs.push([freq, name])
          }
          projects_test.push(project)
        }
      })
    }
    return projects_test;
  })
}

function getRepos() {
  return $.ajax({
    url: "https://api.github.com/users/kivicode/repos",
    dataType: "json",
  }).done(function(rps) {
    repos = rps
    for (r in repos) {
      let project = {}
      let repo = repos[r]
      $.when(getLangs(repo.name)).done(function(b) {
        if (Object.keys(lng).length > 0) {
          let url = "https://raw.githubusercontent.com/kivicode/" + "AndroidDetector" + "/master/icon.png"
          project["img"] = url
          project["name"] = repo.name;
          let langs = [];
          // let sliced = lng.slice(0, Math.min(4, Object.keys(lng).length));
          for (var i of Object.keys(lng).slice(0, Math.min(5, Object.keys(lng).length)).map(entry => entry)) {
            let freq = lng[i]
            let name = i
            langs.push([freq, name])
          }
          projects_test.push(project)
        }
      })
    }
  });
}

function getGitIcon(repo) {
  return $.ajax({
    url: "https://raw.githubusercontent.com/kivicode/" + "AndroidDetector" + "/master/icon.png"
  }).done(function(icn) {
    console.log(icn);
    icon = icn
  });
}

function getLangs(name) {
  return $.ajax({
    url: "https://api.github.com/repos/kivicode/" + name + "/languages",
    dataType: "json",
  }).done(function(l) {
    lng = l
  });
}

function loadColors() {
  return $.ajax({
    url: "../data/colors.json",
    dataType: "json",
  }).done(function(d) {
    colors = d;
  });
}

function loadProjects() {
  return $.ajax({
    url: "../data/projects.json",
    dataType: "json",
  }).done(function(d) {
    projects = d;
  });
}

function getFilteredProjects() {
  let result = []
  if (projects != undefined) {
    for (proj of projects) {
      if (filters.some(r => proj.tags.includes(r))) {
        result.push(proj)
      }
    }
  }
  return result;
}

function render() {
  $.when(loadTags(), loadColors()).done(function() {
    tags_app = new Vue({
      el: '#tags',
      data: {
        tags
      }
    });

    $.when(getRepos()).done(function() {
      projects = projects_test;
      projects_app = new Vue({
        el: '#content-field',
        data: {
          projects: getFilteredProjects().length == 0 ? projects : getFilteredProjects()
        }
      });
    });
  });
}


function updateFilter(id) {
  if (id != "") {
    let tag = document.getElementById(id);
    if (filters.indexOf(id.toLowerCase()) == -1) {
      tag.style.cssText = "background-color: orange;";
      filters.push(id.toLowerCase())
    } else {
      tag.style.cssText = ""
      let index = filters.indexOf(id.toLowerCase());
      filters.splice(index)
    }
  }

  let filt = getFilteredProjects();
  projects_app.projects = filt;
  console.log(filt.length, filters.length)
  if (filt.length == 0 && filters.length > 0) {
    projects_app.projects = [];
  } else if (filt.length == 0 && filters.length == 0) {
    projects_app.projects = projects;
  }
}


function getColor(v) {
  return colors[v.tag.color];
}

function getImg(v) {
  return v.project.img;
}

function getName(v) {
  return v.tag.name;
}

function getRepoName(v) {
  return v._props.project.name.match(/[A-Z, _][a-z]+/g).join(' ');
}

function generate() {
  Vue.component('tag-component', {
    template: `
      <div onselectstart="return false" class="tag" :onclick="onclick" :id="id">
      <div class="tag-color" :style="style"></div>
      <a onselectstart="return false">{{ tag.name }}</a>
      </div>
    `,
    data() {
      return {
        style: {
          background: getColor(this),
        },
        id: getName(this),
        onclick: 'updateFilter("' + getName(this) + '")'
      }
    },
    props: {
      tag: Object
    }
  });


  Vue.component('project-component', {
    template: `
    <div id="projects" class="project">
      <div class="preview-img">
        <img :src="src" />
      </div>
      <div class="preview-title">
        <a class="button" :href="hrefname">{{ project.name }}</a>
      </div>

      <div :id="project.name" class="overlay">
      	<div class="popup">
      		<h3>{{ name }}</h3>
      		<a class="close" href="#content-field">×</a>
      		<div class="content">
      			Thank to pop me out of that button, but now i'm done so you can close this window.
      		</div>
      	</div>
      </div>
    </div>
    `,
    data() {
      return {
        src: getImg(this),
        name: getRepoName(this),
        hrefname: '#' + this._props.project.name
      }
    },
    props: {
      project: Object
    }
  });
}