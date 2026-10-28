// Product image band, shared by all chapter pages.
// An edge-to-edge row of images at their natural proportions that moves one tile every 3 seconds and loops endlessly.
// Markup: .car-band[data-carousel] > .car-track > figure.car-slide
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-carousel]').forEach(function (band) {
    var track = band.querySelector('.car-track');
    var originals = Array.prototype.slice.call(track.children);
    var n = originals.length;
    if (!n) return;

    // Two extra copies so the row never runs out while it loops.
    for (var c = 0; c < 2; c++) {
      originals.forEach(function (s) {
        var copy = s.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
      });
    }

    // Tiles keep their own proportions, so each step moves by that tile's offset.
    var i = 0;
    function place(animate) {
      track.style.transition = animate ? '' : 'none';
      track.style.transform = 'translateX(' + (-track.children[i].offsetLeft) + 'px)';
    }

    track.addEventListener('transitionend', function () {
      if (i >= n) { i -= n; place(false); }
    });

    var timer = null;
    function start() { if (!reduce && !timer) timer = setInterval(function () { i++; place(true); }, 3000); }
    function stop() { clearInterval(timer); timer = null; }

    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    window.addEventListener('resize', function () { place(false); });
    window.addEventListener('load', function () { place(false); });

    place(false);
    start();
  });
})();
