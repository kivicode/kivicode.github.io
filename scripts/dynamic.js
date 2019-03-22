let tags;
let generated = false;

function loadTags() {
  return $.ajax({
    url: "../data/tags.json",
    dataType: "json",
  }).done(function(d) {
    tags = d;
  });
}

function render() {
  $.when(loadTags()).done(function(a1) {
    let vue = new Vue({
      el: '#tags',
      data: {
        tags
      }
    });
  })
}

function generate() {

  Vue.component('tag-component', {
    template: `
      <div class="tag">
      <a>{{ tag.name }}</a>
      </div>
    `,
    props: {
      tag: Object
    }
  });
}