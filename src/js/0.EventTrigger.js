$(function () {
  var ms = new MediaStoker;

  $(window).trigger('ContentRequest', ms);

  $(window).on('hashchange', function () {
    $(window).trigger('ContentRequest', ms);
  });

  $(document).on('click', '.playmedia', function () {
    var self = this;
    $('.playmedia').removeClass('playing');
    $(this).addClass('playing');
    $(window).trigger('PlayMedia', {ms:ms, target:self});
  });

  $('.sort').on('click', function () {
    $('#navsort').slideToggle(ms.param.time * 2);
  });

  $(window).trigger('SessionHandler', ms);

  $('#signout').on('click', function (event) {
    event.preventDefault();
    ms.huds.on('Sending...');
    $.ajax({
      url : '/sign/out',
      type : 'POST',
      error : function () {
        ms.huds.on('Sign out failure.<br>Please retry.');
        setTimeout(function () {
          ms.huds.off();
        }, 1200);
      },
      success : function (data) {
        ms.huds.on('Signed out.<br>Reloading...');
        setTimeout(function () {
          if ('' == location.hash) {
            location.href = '#/media';
          } else {
            location.href = '#';
          }
        }, 1200);
      }
    });
  });

});


var MediaStoker = function () {
  var self = this;

  this.media = {
    play : null,
    prev : null,
    next : null
  }

  this.hashtype = function (e) {
    e = $(e);
    return {
      'self' : e,
      'hash' : e.attr('data-hash'),
      'type' : e.attr('data-type'),
      'path' : e.attr('data-hash') + '?type=' + e.attr('data-type')
    }
  }

  this.param = {
    time : 120,
    sort : {
      date : false,
      name : false
    },
    trigger : function () {
      $(window).trigger('SettleDown', self);
    }
  };

  this.huds = {
    on : function (msg) {
      $('#huds').html(msg);
      $('#hud').fadeIn(self.param.time);
    },
    off : function () {
      $('#hud').fadeOut(self.param.time * 2, function () {
        $('#huds').html('');
      });
    }
  };

  $(window).on('resize scroll', function () {
    $(window).trigger('LazyLoadQueue', event.type);
  })

  this.lazy = {
    elements : [],
    loaded : 0,
    height : 0,
    scroll : 0,
    threshold : 50,
    forceload : function () {
      $(window).off('LazyLoadQueue');
      for (var i = 0; i < this.elements.length; i++) {
        var target = this.elements[i];
        if (false == target.done) {
          target.done = true;
          this.loaded++;
          target.tag.style.opacity = 0;
          target.tag.src = target.tag.getAttribute('data-original');
          target.tag.setAttribute('data-loaded', 'true');
          target.tag.onload = function() {
            this.style.opacity = 1;
          }
        }
      }
    },
    update : function (type) {
      if (this.loaded >= this.elements.length) {
        $(window).off('LazyLoadQueue');
        return false;
      } else if ('scroll' == type) {
        this.scroll = $(window).scrollTop();
      } else if ('resize' == type) {
        this.height = $(window).height();
      }
      var thl = this.scroll + this.height + this.threshold;
      var thr = this.scroll - this.threshold;
      for (var i = 0; i < this.elements.length; i++) {
        var target = this.elements[i];
        if (false == target.done) {
          if (thl > target.top && target.top > thr) {
            target.done = true;
            this.loaded++;
            target.tag.style.opacity = 0;
            target.tag.src = target.tag.getAttribute('data-original');
            target.tag.setAttribute('data-loaded', 'true');
            target.tag.onload = function() {
              this.style.opacity = 1;
            }
          }
        }
      }
    },
    initialize : function (elem) {
      $(window).off('LazyLoadQueue');
      this.elements = [];
      this.loaded   = 0;
      this.height   = $(window).height();
      this.scroll   = $(window).scrollTop();
      return document.getElementsByTagName(elem);
    },
    attach : function (elem) {
      var elems = this.initialize(elem);
      var count = 0;
      for (var i = 0; i < elems.length; i++) {
        var tag  = elems[i];
        var top  = $(tag).offset().top;
        var done = $(elems[i]).attr('data-loaded');
        if ('false' == done) {
          this.elements[count] = {
            tag  : tag,
            top  : top,
            done : false
          };
          count++;
        }
      }
      this.update();
      var that = this;
      $(window).on('LazyLoadQueue', function (event, type) {
        that.update(type);
      });
    }
  };
}
