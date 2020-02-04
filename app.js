const piTwo = 2 * Math.PI;
const circleWidth = 4;
const speed = 2;
const minRadius = 5;
const minAge = -10;
const circles = [];

let textIntro = 300;
let lastUpdate = 0;
let canvas;
let ctx;
let width;
let height;

window.onload = function() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');

  update(0);

  window.requestAnimationFrame(loop);
};

window.onpointerdown = function(e) {
  const circle = createCircle(e.clientX, e.clientY);

  let ignore = false;
  circles.forEach(c => {
    if (this.isTouching(c, circle)) ignore = true;
  });

  if (!ignore) circles.push(circle);
};

window.oncontextmenu = function(e) {
  e.preventDefault();
};

function loop(timestamp) {
  if (timestamp > lastUpdate + 16) {
    update(timestamp - lastUpdate);
    render();
    lastUpdate = timestamp;
  }

  window.requestAnimationFrame(loop);
}

function update(delta) {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width;
  canvas.height = height;

  const ignore = new Set();
  circles.forEach(c1 => {
    circles.forEach(c2 => {
      if (c1 !== c2 && isTouching(c1, c2)) {
        if (!ignore.has(c1)) {
          c1.dir *= -1;
          c1.r = Math.max(minRadius, c1.r + c1.dir * speed);
          ignore.add(c1);
        }

        if (!ignore.has(c2)) {
          c2.dir *= -1;
          c2.r = Math.max(minRadius, c2.r + c2.dir * speed);
          ignore.add(c2);
        }
      }
    });
  });

  circles.forEach((c, i) => {
    c.r = Math.max(minRadius, c.r + c.dir * speed);
    c.age--;

    // Reverse if we got too small
    if (c.r <= minRadius) c.dir = 1;

    // Remove if it gets old
    if (c.age < minAge) circles.splice(i, 1);
  });
}

function render() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  if (textIntro > 0) {
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(100, textIntro) / 100})`;

    ctx.fillText('Welcome to bubble fun!', width / 2, height / 2);
    ctx.fillText('Tap around to make bubbles :)', width / 2, height / 2 + 68);

    textIntro--;
  }

  ctx.lineWidth = circleWidth;

  circles.forEach(c => {
    ctx.beginPath();
    if (c.age < 0) {
      const alpha = (Math.abs(minAge) - Math.abs(c.age)) / Math.abs(minAge);
      ctx.strokeStyle = hsvToRgb(c.hue, 1, 1, alpha);
    } else {
      ctx.strokeStyle = hsvToRgb(c.hue, 1, 1);
    }

    ctx.arc(c.x, c.y, c.r, 0, piTwo);
    ctx.stroke();
  });
}

function createCircle(x, y) {
  if (!x) x = width / 2;
  if (!y) y = height / 2;

  return { x, y, r: 10, hue: Math.random(), dir: 1, age: Math.random() * 70 + 200 };
}

function isTouching(c1, c2) {
  const distance = dist(c1.x, c2.x, c1.y, c2.y);

  if (distance > c1.r + c2.r) return false;
  if (distance <= Math.abs(c1.r - c2.r)) return false;

  return true;
}

function dist(x1, x2, y1, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function pickRandom(array) {
  const index = Math.floor(Math.random() * (array.length - 1));
  return array[index];
}

function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

function hsvToRgb(h, s, v, a) {
  const rgb = internalHsvToRgb(h, s, v);

  if (a !== undefined) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// From https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function internalHsvToRgb(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    (s = h.s), (v = h.v), (h = h.h);
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
