(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle (dark by default, choice remembered when storage is available)
  var toggle = document.querySelector(".theme-toggle");
  toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#f8f7fa" : "#08070b");
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // Deploy terminal: print the pipeline one line at a time, then flip to "passing"
  var term = document.querySelector(".term");
  if (term) {
    var lines = term.querySelectorAll(".term-lines li");
    var status = term.querySelector(".term-status");
    var rerun = term.querySelector(".term-rerun");
    var timers = [];

    function setStatus(state) { status.dataset.state = state; status.textContent = state; }

    function play() {
      timers.forEach(clearTimeout); timers = [];
      term.classList.remove("done");
      if (reduceMotion) {
        lines.forEach(function (l) { l.classList.add("on"); });
        setStatus("passing"); term.classList.add("done");
        return;
      }
      lines.forEach(function (l) { l.classList.remove("on"); });
      setStatus("running");
      var t = 400;
      lines.forEach(function (l, i) {
        // Steps that "do work" take a little longer than headers and the prompt
        t += i === 0 ? 0 : (l.querySelector(".ok") ? 380 : 220);
        timers.push(setTimeout(function () { l.classList.add("on"); }, t));
      });
      timers.push(setTimeout(function () { setStatus("passing"); term.classList.add("done"); }, t + 150));
    }

    rerun.addEventListener("click", play);
    play();
  }

  // Scroll progress bar + nav border
  var bar = document.querySelector(".progress span");
  var nav = document.querySelector(".nav");
  var ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = "scaleX(" + p + ")";
    nav.classList.toggle("scrolled", window.scrollY > 8);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Reveal cards as they enter the viewport
  var cards = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    cards.forEach(function (c) { io.observe(c); });
  } else {
    cards.forEach(function (c) { c.classList.add("in"); });
  }

  // Soft light that follows the cursor across each card
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();
