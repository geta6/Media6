$(window).on('ContentRequest', function (event, ms) {

  if ($('#authenticate').size()) {

    $('.back').attr({ href : '#' }).addClass('disable');
    $('.sort').hide();

    ms.huds.on('Please sign in.');
    setTimeout(function () {
      ms.huds.off();
    }, 720);

    $('#authenticate').on('submit', function (event) {
      event.preventDefault();
      ms.huds.on('Sending...');
      $.ajax({
        url : '/sign/in',
        type : 'POST',
        data : { user : $('#user').val(), pass : $('#pass').val() },
        error : function () {
          ms.huds.on('Auth failure.<br>Please retry.');
          setTimeout(function () {
            ms.huds.off();
          }, 1200);
        },
        success : function (data) {
          ms.huds.on('Auth success!');
          setTimeout(function () {
            ms.huds.on('Loading...');
            $('#authenticate').remove();
            if ('' == location.hash) {
              location.href = '#/media';
            } else {
              location.href = '#';
            }
          }, 1200);
        }
      });
    });

  } else {

    ms.huds.on('Loading...');

    ms.media = {
      play : null,
      prev : null,
      next : null
    }

    var $c = $('#content');
    $c.fadeTo(ms.param.time * 2, 0, function () {
      ms.param.path = location.hash.substr(1);
      if ('' == ms.param.path) {
        ms.param.path = '/media';
      }
      $.ajax({
        url   : '/data' + ms.param.path,
        type  : 'POST',
        cache : true,
        error : function () {},
        complete : function (data) {
          if (401 == data.status) {
            $c.html($(data.responseText).find('#authenticate'));
            $(window).trigger('ContentPrepared', ms);
          } else {
            var data = JSON.parse(data.responseText);
            $c.html(data.html);
            $(window).trigger('ContentPrepared', ms);
          }
        }
      });
    });

  }
});
