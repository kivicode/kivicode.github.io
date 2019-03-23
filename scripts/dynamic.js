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
  $.when(loadTags(), loadColors(), loadProjects()).done(function(a1, a2, a3) {
    tags_app = new Vue({
      el: '#tags',
      data: {
        tags
      }
    });

    projects_app = new Vue({
      el: '#content-field',
      data: {
        projects: getFilteredProjects().length == 0 ? projects : getFilteredProjects()
      }
    });
  });
}


function updateFilter(id) {
  if (id != "") {
    let tag = document.getElementById(id);
    if (filters.indexOf(id.toLowerCase()) == -1) {
      tag.style.cssText = "background-color: rgb(255, 236, 130);";
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
    projects_app.projects = projects;;
  }
  // if (filters.length == 0) {
  //   projects_app.projects = [];
  // }

}


function getColor(v) {
  return colors[v.tag.color];
}

function getImg(v) {
  return "../images/projects/" + v.project.img;
}

function getName(v) {
  return v.tag.name;
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
        <a> {{ project.name }}</a>
      </div>
    </div>
    `,
    data() {
      return {
        src: getImg(this)
      }
    },
    props: {
      project: Object
    }
  });
}