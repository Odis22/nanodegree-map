$(document).ready(function() {
  $("#menu").on('click', function() {
      $("#mobile-list").toggle();
    });
    setTimeout(function() {
      $('#default').trigger('click');
    }, 1000);
  });
