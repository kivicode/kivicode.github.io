function go_to_content() {
  $('html,body').animate({
      scrollTop: $(".content").offset().top
    },
    'slow');
}