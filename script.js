(function () {
  var root = document.documentElement;

  // ---- Theme toggle (dark by default; the choice is remembered when storage is available)
  var toggle = document.querySelector(".theme-toggle");
  function syncToggleLabel() {
    toggle.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }
  syncToggleLabel();
  toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    syncToggleLabel();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "light" ? "#fafafa" : "#0a0a0a");
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---- Fragrance wheel: Scense's 14 families and its real affinity-by-ring-distance table
  // (pipeline/config/families.yaml and scoring.yaml in the Scense repo)
  var svg = document.querySelector(".wheel");
  if (svg) {
    var FAMILIES = ["Soft Amber", "Amber", "Woody Amber", "Woods", "Mossy Woods", "Dry Woods",
      "Aromatic Fougère", "Citrus", "Water", "Green", "Fruity", "Floral", "Soft Floral", "Floral Amber"];
    var AFFINITY = {
      enhance: [1.0, 0.6, 0.3, 0.1, 0, 0, 0, 0],
      soften: [0.2, 0.4, 0.6, 0.8, 0.9, 0.85, 0.75, 0.6]
    };
    var N = FAMILIES.length, STEP = 360 / N, R_IN = 118, R_OUT = 252, R_LABEL = 185, GAP = 0.9;
    var NS = "http://www.w3.org/2000/svg";
    var selected = 7;            // Citrus, the example in the Scense README
    var mode = "soften";
    var segs = [];

    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    function pt(r, deg) { var a = deg * Math.PI / 180; return (r * Math.cos(a)).toFixed(2) + " " + (r * Math.sin(a)).toFixed(2); }
    function sector(a0, a1) {
      return "M" + pt(R_OUT, a0) + " A" + R_OUT + " " + R_OUT + " 0 0 1 " + pt(R_OUT, a1) +
             " L" + pt(R_IN, a1) + " A" + R_IN + " " + R_IN + " 0 0 0 " + pt(R_IN, a0) + " Z";
    }
    function dist(i, j) { var d = Math.abs(i - j); return Math.min(d, N - d); }

    // Build the ring once
    FAMILIES.forEach(function (name, i) {
      var mid = -90 + i * STEP, a0 = mid - STEP / 2 + GAP, a1 = mid + STEP / 2 - GAP;
      var g = el("g", { "class": "seg-g", role: "radio", tabindex: "-1", "aria-label": name });
      var d = sector(a0, a1);
      g.appendChild(el("path", { "class": "track", d: d }));
      g.appendChild(el("path", { "class": "heat", d: d }));
      g.appendChild(el("path", { "class": "outline", d: d }));
      var left = Math.cos(mid * Math.PI / 180) < -0.01;   // flip labels on the left half so they read left to right
      var t = el("text", {
        "class": "label", "text-anchor": "middle", "dominant-baseline": "central",
        transform: "rotate(" + (left ? mid + 180 : mid) + ") translate(" + (left ? -R_LABEL : R_LABEL) + " 0)"
      });
      t.textContent = name;
      g.appendChild(t);
      g.addEventListener("click", function () { select(i, false); });
      g.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") render(i); });
      g.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % N;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + N) % N;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = N - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
      svg.appendChild(g);
      segs.push(g);
    });
    svg.addEventListener("pointerleave", function () { render(selected); });

    // Hub in the middle: the goal and the family you picked
    svg.appendChild(el("circle", { "class": "hub", r: R_IN - 8 }));
    var hubMode = el("text", { "class": "hub-mode", "text-anchor": "middle", y: -22 });
    var hubName = el("text", { "class": "hub-name", "text-anchor": "middle", y: 8 });
    svg.appendChild(hubMode); svg.appendChild(hubName);

    var list = document.querySelector(".partners");
    var modeBtns = document.querySelectorAll(".seg button");

    function render(base) {
      var table = AFFINITY[mode];
      segs.forEach(function (g, i) {
        var score = table[dist(base, i)];
        // A curve so weak matches fade out and strong ones stand out
        var heat = 0.8 * Math.pow(score, 1.65);
        g.querySelector(".heat").style.fillOpacity = i === base ? 1 : heat;
        g.classList.toggle("base", i === base);
        // Labels switch to the opposite ink once the fill is strong enough. These cut-offs
        // keep every label at 4.5:1 or better: dark theme flips at 0.43, light at 0.53.
        g.classList.toggle("hi", i !== base && heat >= 0.53);
        g.classList.toggle("mid", i !== base && heat >= 0.43 && heat < 0.53);
      });

      hubMode.textContent = mode === "enhance" ? "Enhance" : "Soften";
      // Two-word names go on two lines so they fit the hub
      var words = FAMILIES[base].split(" ");
      hubName.textContent = "";
      (words.length > 1 ? words : [FAMILIES[base]]).forEach(function (w, k) {
        var ts = el("tspan", { x: 0, dy: k === 0 ? (words.length > 1 ? -4 : 6) : 26 });
        ts.textContent = w; hubName.appendChild(ts);
      });

      // Top four partners: highest score first, nearer families break ties
      var ranked = FAMILIES.map(function (n, i) { return { name: n, i: i, score: table[dist(base, i)], d: dist(base, i) }; })
        .filter(function (r) { return r.i !== base; })
        .sort(function (a, b) { return b.score - a.score || a.d - b.d || a.i - b.i; })
        .slice(0, 4);
      list.innerHTML = "";
      ranked.forEach(function (r) {
        var li = document.createElement("li");
        var n = document.createElement("span"); n.textContent = r.name;
        var s = document.createElement("span"); s.className = "score"; s.textContent = r.score.toFixed(2);
        li.appendChild(n); li.appendChild(s); list.appendChild(li);
      });
    }

    function select(i, focus) {
      selected = i;
      segs.forEach(function (g, k) {
        g.setAttribute("aria-checked", k === i ? "true" : "false");
        g.setAttribute("tabindex", k === i ? "0" : "-1");   // roving tabindex: one tab stop for the whole wheel
      });
      if (focus) segs[i].focus();
      render(i);
    }

    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.dataset.mode;
        modeBtns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        render(selected);
      });
    });

    select(selected, false);
  }

  // ---- Image loading state: shimmer until each screenshot has loaded
  document.querySelectorAll(".media").forEach(function (m) {
    var img = m.querySelector("img");
    if (!img) return;
    function done() { m.classList.add("is-loaded"); }
    if (img.complete) done();
    else { img.addEventListener("load", done); img.addEventListener("error", done); }
  });

  // ---- Copy email, with visible and announced confirmation
  var copyBtn = document.querySelector(".email-copy");
  var copyStatus = document.getElementById("copy-status");
  if (copyBtn) {
    var label = copyBtn.querySelector(".tip");
    var resetTimer;
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.dataset.copy;
      // Older copy method, used on plain http, older browsers, or when the clipboard API refuses
      function legacyCopy() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        return ok ? Promise.resolve() : Promise.reject();
      }
      var copied = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(text).catch(legacyCopy)
        : legacyCopy();
      copied.then(function () {
        copyBtn.classList.add("copied");
        label.textContent = "Copied";
        copyStatus.textContent = "Email address copied to clipboard";
      }, function () {
        label.textContent = "Couldn't copy";
        copyStatus.textContent = "Copy failed. The address is " + text;
      });
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        copyBtn.classList.remove("copied");
        label.textContent = "Copy";
        copyStatus.textContent = "";
      }, 2000);
    });
  }
})();
