let tags;
let colors;
let projects;

let tags_app, projects_app;

let filters = [];

let whiteList = [
  "Kinect"
]

let test_l;

let repos, lng, icon, readme;

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

let langs = []

function getRepos() {
  return $.ajax({
    url: "https://api.github.com/users/kivicode/repos",
    dataType: "json",
  }).done(function(rps) {
    repos = rps
    for (r in repos) {
      let project = {}
      let repo = repos[r]
      if (whiteList.includes(repo.name)) {
        $.when(getLangs(repo.name), getGitReadme(repo)).done(function(b, c) {
          if (Object.keys(lng).length > 0) {
            let url = "https://raw.githubusercontent.com/kivicode/" + "AndroidDetector" + "/master/icon.png"
            project["img"] = url
            project["name"] = repo.name;
            project["readme"] = readme;
            let langs = [];
            for (var i of Object.keys(lng).slice(0, Math.min(5, Object.keys(lng).length)).map(entry => entry)) {
              let freq = lng[i]
              let name = i
              langs.push([freq, name])
            }
            project["langs"] = langs;
            // getColorMap({
            //   "project": project
            // })
            console.log("AA");
            projects_test.push(project)
          }
        })
      }
    }
  });
}

function getGitIcon(repo) {
  return $.ajax({
    url: "https://raw.githubusercontent.com/kivicode/" + "AndroidDetector" + "/master/icon.png"
  }).done(function(icn) {
    icon = icn
  });
}

function getGitReadme(repo) {
  return $.ajax({
    url: "https://raw.githubusercontent.com/kivicode/" + repo.name + "/master/README.md"
  }).done(function(rm) {
    readme = rm;
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
  $.when(getRepos()).done(function() {

    $.when(loadColors()).done(function() {
      projects = projects_test;
      projects_app = new Vue({
        el: '#content-field',
        data: {
          projects: getFilteredProjects().length == 0 ? projects : getFilteredProjects()
        }
      });
      console.log("unnormalized");
      tags_app = new Vue({
        el: '#tags',
        data: {
          tags
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

function translateReadme(v) {
  return markdown.toHTML(v._props.project.readme);
}

function getColorMap(v) {
  let langs = v.project.langs;
  let total = 0;
  for (l of langs) {
    total += l[0];
  }
  let normalized = []
  for (l of langs) {
    let percent = parseInt(100 * (l[0] / total));
    if (percent > 5) {
      let nm = {}
      nm["name"] = l[1];
      nm["percent"] = percent;
      nm["color"] = colors[l[1]];
      normalized.push(nm);
    }
  }
  normalized.sort(function(a, b) {
    return b.percent - a.percent;
  })
  console.log("normalized");
  let out = '';
  let lastPercent = 0;
  for (n of normalized) {
    out += n['color'] + " " + lastPercent + "%, " + n['color'] + " " + (lastPercent + n['percent']) + '%, '
    lastPercent = n['percent']
  }
  out = out.slice(0, out.length - 2)

  return out;
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
        onclick: 'updateFilter("' + getName(this) + ');'
      }
    },
    props: {
      tag: Object
    }
  });


  Vue.component('project-component', {
    data() {
      return {
        src: getImg(this),
        name: getRepoName(this),
        hrefname: '#' + this._props.project.name,
        descriotion: translateReadme(this),
        style: {
          background: 'linear-gradient(to right, ' + getColorMap(this),
        },
      }
    },
    template: `
    <div id="projects" class="project">
      <div class="preview-img">
        <img :src="src" />
      </div>
      <div class="preview-title">
      <div class="preview-lang" :style="style"></div>
        <a class="button" :href="hrefname">{{ project.name }}</a>
      </div>
      <div :id="project.name" class="overlay">
      	<div class="popup">
      		<a class="close" href="#content-field">×</a>
      		<div class="content" v-html="descriotion">
      		</div>
      	</div>
      </div>
    </div>
    `,
    props: {
      project: Object
    }
  });
}