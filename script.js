window.requestAnimationFrame =
  window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function () {
    return function (callback, element) {
      var lastTime = element.__lastTime;
      if (lastTime === undefined) {
        lastTime = 0;
      }
      var currTime = Date.now();
      var timeToCall = Math.max(1, 33 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      element.__lastTime = currTime + timeToCall;
    };
  })();

window.isDevice =
  /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
  );

var loaded = false;
var init = function () {
  if (loaded) return;
  loaded = true;

  var mobile = window.isDevice;
  var koef = mobile ? 0.5 : 1;
  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  var width = (canvas.width = koef * innerWidth);
  var height = (canvas.height = koef * innerHeight);

  var rand = Math.random;
  var heartPosition = function (rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(
        15 * Math.cos(rad) -
        5 * Math.cos(2 * rad) -
        2 * Math.cos(3 * rad) -
        Math.cos(4 * rad)
      ),
    ];
  };

  var scaleAndTranslate = function (pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  };

  // Handle resizing of the canvas
  window.addEventListener("resize", function () {
    width = canvas.width = koef * innerWidth;
    height = canvas.height = koef * innerHeight;
  });

  // Generate heart shape points
  var pointsOrigin = [];
  var traceCount = mobile ? 20 : 50;
  var dr = mobile ? 0.3 : 0.1;
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));

  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  var pulse = function (kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + width / 2,
        ky * pointsOrigin[i][1] + height / 2,
      ];
    }
  };

  var particles = [];
  for (var i = 0; i < heartPointsCount; i++) {
    var x = rand() * width;
    var y = rand() * height;
    particles[i] = {
      vx: 0,
      vy: 0,
      R: 2,
      speed: rand() + 5,
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      f:
        "hsla(0," +
        ~~(40 * rand() + 60) +
        "%," +
        ~~(60 * rand() + 20) +
        "%,.3)",
      trace: Array.from({ length: traceCount }, () => ({ x: x, y: y })),
    };
  }

  var config = {
    traceK: 0.4,
    timeDelta: 0.01,
  };

  var time = 0;
  var loop = function () {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    // Create smooth background effect by reducing opacity incrementally
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, width, height);

    // Animate particles
    particles.forEach(function (u) {
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);

      // Update particle target
      if (length < 10) {
        if (rand() > 0.95) u.q = ~~(rand() * heartPointsCount);
        else {
          if (rand() > 0.99) u.D *= -1;
          u.q += u.D;
          u.q %= heartPointsCount;
          if (u.q < 0) u.q += heartPointsCount;
        }
      }

      // Apply velocity and update trace
      u.vx += (-dx / length) * u.speed;
      u.vy += (-dy / length) * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;

      // Smooth out the trail
      for (var k = 0; k < u.trace.length - 1; ) {
        var T = u.trace[k];
        var N = u.trace[++k];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }

      // Render the trail
      ctx.fillStyle = u.f;
      u.trace.forEach(function (point) {
        ctx.fillRect(point.x, point.y, 1, 1);
      });
    });

    window.requestAnimationFrame(loop, canvas);
  };

  // Fade canvas after 6 seconds
  setTimeout(function () {
    var fadeOut = setInterval(function () {
      canvas.style.opacity = parseFloat(canvas.style.opacity || 1) - 0.05;
      if (parseFloat(canvas.style.opacity) <= 0) {
        clearInterval(fadeOut);
        displayMessage();
      }
    }, 100);
  }, 6000);

  // Display Happy Birthday message with 2 paragraphs
  function displayMessage() {
    var messageContainer = document.createElement("div");
    messageContainer.style.position = "absolute";
    messageContainer.style.top = "50%";
    messageContainer.style.left = "50%";
    messageContainer.style.marginTop = "100px";
    messageContainer.style.transform = "translate(-50%, -50%)";
    messageContainer.style.fontSize = "38px";
    messageContainer.style.color = "red";
    messageContainer.style.fontWeight = "500";
    messageContainer.style.textAlign = "center";
    messageContainer.style.zIndex = "10";
    messageContainer.style.maxWidth = "600px";

    // First paragraph
    var paragraph1 = document.createElement("p");
    paragraph1.textContent =
      "Wishing you the happiest of birthdays! May your day be filled with love, joy, and wonderful surprises. I'm so grateful to have you in my life, and I hope this year brings you all the success and happiness you deserve.";

    // Second paragraph
    var paragraph2 = document.createElement("p");
    paragraph2.textContent =
      "May all your dreams come true, and may you continue to shine brightly in everything you do. Enjoy every moment of this special day, and here's to a fantastic year ahead! Happy Birthday!";

    // Append paragraphs to the container
    messageContainer.appendChild(paragraph1);
    messageContainer.appendChild(paragraph2);

    // Append the message to the body
    document.body.appendChild(messageContainer);
  }

  loop();
};

// Initialize when document is ready
if (
  document.readyState === "complete" ||
  document.readyState === "loaded" ||
  document.readyState === "interactive"
) {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init, false);
}
