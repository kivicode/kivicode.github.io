function goToContent() {
  $('html,body').animate({
      scrollTop: $(".projects-part").offset().top
    },
    'slow');
}