$(window).on('SettleDown', function (event, ms) {

  $('html, body').animate({ scrollTop : 0 }, ms.param.time * 2);

  $('#media').hide();

  $('#content').fadeTo(ms.param.time * 2, 1, function () {
    ms.huds.off();
    ms.lazy.attach('img');
  });

});
