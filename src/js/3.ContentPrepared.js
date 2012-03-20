$(window).on('ContentPrepared', function (event, ms) {

  var cd = ms.param.path.split('/');
  if ('undefined' != typeof(cd[2])) {
    $('#sidebar li').removeClass('selected');
    $('a[href="#/' + cd[1] + '/' + cd[2] + '"]').parent().addClass('selected');
  }
  cd.pop();
  if (1 < cd.length) {
    $('.back').attr({ href : '#' + cd.join('/') }).removeClass('disable');
  } else {
    $('.back').attr({ href : '#' }).addClass('disable');
  }

  if ($('#isotope').size()) {
    $('.sort').fadeIn(ms.param.time, function () {
      $('#isotope').isotope({
        itemSelector  : '.row',
        getSortData   : {
          name : function ($elem) { return $elem.attr('data-name') },
          date : function ($elem) { return $elem.attr('data-date') }
        }
      }, ms.param.trigger);
    });
  } else {
    $('.sort, #navsort').fadeOut(ms.param.time, function () {
      ms.param.trigger();
    });
  }

  $(window).trigger('ResetSessionParam');

});
