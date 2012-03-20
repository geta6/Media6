$(window).on('PlayMedia', function (event, data) {

  var ms = data.ms;
  var target = data.target;
  var name = '';

  if (null != ms.media.play) {
    if (ms.media.play.self[0] == target) {
      return false;
    }
  }

  ms.media.play = ms.hashtype(target);
  var list = $('.playmedia');
  for (var i = 0; i < list.length; i++) {
    var ht = ms.hashtype(list[i]);
    if (ms.media.play.hash == ht.hash) {
      ms.media.next = ('undefined' != typeof(list[i+1]) ? ms.hashtype(list[i+1]) : null);
      name = $(list[i]).find('.name').html();
      break;
    }
  }

  $('.close').off('click');
  $('.close').on('click', function () {
    $(ms.media.play.self).removeClass('playing');
    ms.media.play = null;
    $('#media').fadeOut(ms.param.time * 2, function () {
      $('audio').attr({src:null}).remove();
      $('#media-audio').append($('<audio id="video" autoplay controls>')).hide();
      $('video').attr({src:null}).remove();
      $('#media-video').append($('<video id="video" autoplay controls>')).hide();
    });
  });

  $('#media').fadeIn(ms.param.time * 2, function () {
    switch (ms.media.play.type) {
      case 'audio/mp3':
        $('#media-audio h1').html(name);
        $('#media-audio').fadeIn(ms.param.time * 2, function () {
          $('audio').attr({ src : ms.media.play.path }).fadeIn(ms.param.time, function () {
            $('audio').on('ended', function () {
              $(window).trigger('EndMedia', { ms : ms, target : 'audio' });
            });
          });
        });
        break;
      case 'video/mp4':
        $('#media-video h1').html(name);
        $('#media-video').fadeIn(ms.param.time * 2, function () {
          $('video').attr({ src : ms.media.play.path }).fadeIn(ms.param.time * 2, function () {
            $('video').on('ended', function () {
              $(window).trigger('EndMedia', { ms : ms, target : 'video' });
            });
          });
        });
        break;
    }
  });

});