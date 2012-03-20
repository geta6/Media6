$(window).on('SessionHandler', function (e, ms) {

  var dateasc = ms.param.sort.date;
  var nameasc = ms.param.sort.name;

  $(window).on('ResetSessionParam', function (event, data) {
    dateasc = ms.param.sort.date;
    nameasc = ms.param.sort.name;
  });

  $('#byname').on('click', function () {
    ms.huds.on('Sorting...');
    $('#navsort').slideToggle(ms.param.time * 2);
    $('#isotope').isotope({
      sortBy : 'name',
      sortAscending : nameasc
    }, ms.param.trigger);
    nameasc = !nameasc;
    dateasc = ms.param.sort.date;
    setTimeout(function () {
        ms.huds.off();
    }, 3000);
  });

  $('#bydate').on('click', function () {
    ms.huds.on('Sorting...');
    $('#navsort').slideToggle(ms.param.time * 2);
    $('#isotope').isotope({
      sortBy : 'date',
      sortAscending : dateasc
    }, ms.param.trigger);
    nameasc = ms.param.sort.name;
    dateasc = !dateasc;
    setTimeout(function () {
        ms.huds.off();
    }, 3000);
  });

});
