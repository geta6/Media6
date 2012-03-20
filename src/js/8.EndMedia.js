$(window).on('EndMedia', function (event, data) {

  var ms = data.ms;
  var target = data.target;

  $(ms.media.play.self).removeClass('playing');
  
  if ('audio' == target) {
    $('audio').off('ended');
    if (null == ms.media.next) {
      $('audio').fadeOut(ms.param.time, function () {
        $('#media').slideUp(ms.param.time * 2);
      });
    } else {
      $(ms.media.next.self).addClass('playing');
      $(window).trigger('PlayMedia', { ms:ms, target:ms.media.next.self });
    }
  } else if ('video' == target) {
    $('video').off('ended');
    if (null == ms.media.next) {
      $('video').fadeOut(ms.param.time, function () {
        $('#media-video').fadeOut(ms.param.time, function () {
          $('#media').slideUp(ms.param.time * 2);
        });
      });
    } else {
      $(ms.media.next.self).addClass('playing');
      $(window).trigger('PlayMedia', { ms:ms, target:ms.media.next.self });
    }
  }
});