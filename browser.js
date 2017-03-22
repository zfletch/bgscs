(function () {
  $('#puzzle tr').each(function() {
    var $tr = $(this);
    $tr.find('td').each(function() {
      var $td = $(this);
      var $input = $td.find('input');

      if (!$td.hasClass('deadCell')) {
        $input.val($input.attr('name'));
      }
    });
  });
})();
