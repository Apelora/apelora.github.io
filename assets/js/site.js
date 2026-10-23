// Small enhancements. The pages read fine without this file; it adds the menu, the preview tabs,
// scroll reveals and the contact form's behaviour.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header: a hairline once the page scrolls.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Menu (small screens).
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) { toggle.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open); };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); toggle.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
  }

  // Preview tabs: Design, Operate, Recover.
  var tablists = document.querySelectorAll("[role=tablist]");
  Array.prototype.forEach.call(tablists, function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll("[role=tab]"));
    var show = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t, false); });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); show(next, true); }
      });
    });
    show(tabs[0], false);
  });

  // Reveal on scroll (never hides anything when reduced motion is on or the observer is missing).
  var items = document.querySelectorAll(".reveal");
  if (items.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      Array.prototype.forEach.call(items, function (el) { io.observe(el); });
    }
  }


  // Recovery illustration: two modules leave a failed server and restart on healthy ones.
  // Repeats while it is on screen, until Pause. Resume continues the loop. Without scripting,
  // or with reduced motion, it shows the finished picture and Replay runs it once.
  Array.prototype.forEach.call(document.querySelectorAll("[data-recovery]"), function (root) {
    var get = function (s) { return root.querySelector(s); };
    var all = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var scene = get(".ar-scene"), svg = get(".ar-links"), hosts = all(".ar-host"), states = all(".ar-server-state");
    var modules = all(".ar-module"), paths = [get(".ar-path-a"), get(".ar-path-b")], flows = [get(".ar-flow-a"), get(".ar-flow-b")];
    var gate = get(".ar-fence"), status = get(".ar-status-text"), dot = get(".ar-dot"), button = get(".ar-control"), steps = all(".ar-step");
    var duration = 4800, hold = 1200;
    var elapsed = duration, paused = false, userStopped = false, last = null, frame = null, phase = -1, points = [], started = false;
    var clamp = function (t) { return Math.max(0, Math.min(1, t)); };
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var TEXT = ["Both modules are running.", "Server 1 failed.", "Confirmed stopped. Safe to restart.", "Restarting on healthy servers…", "Both modules are healthy again."];

    function measure() {
      var r = scene.getBoundingClientRect();
      var point = function (sel, i) {
        var s = get(sel).getBoundingClientRect();
        return { x: s.left - r.left + (s.width - modules[i].offsetWidth) / 2, y: s.top - r.top + (s.height - modules[i].offsetHeight) / 2 };
      };
      points = [
        { from: point(".ar-source-a", 0), to: point(".ar-target-a", 0), lift: 106, start: 1450, end: 2450 },
        { from: point(".ar-source-b", 1), to: point(".ar-target-b", 1), lift: 159, start: 1700, end: 3000 },
      ];
      svg.setAttribute("viewBox", "0 0 " + r.width + " " + r.height);
      for (var i = 0; i < 2; i++) {
        var q = points[i], w = modules[i].offsetWidth / 2, h = modules[i].offsetHeight / 2;
        var a = { x: q.from.x + w, y: q.from.y + h }, b = { x: q.to.x + w, y: q.to.y + h };
        var d = "M " + a.x + " " + a.y + " C " + (a.x + (b.x - a.x) * 0.23) + " " + (a.y - q.lift * 1.34) + ", " + (a.x + (b.x - a.x) * 0.77) + " " + (b.y - q.lift * 1.34) + ", " + b.x + " " + b.y;
        paths[i].setAttribute("d", d); flows[i].setAttribute("d", d);
      }
      paint();
    }

    function paint() {
      if (points.length !== 2) return;
      var next = elapsed < 600 ? 0 : elapsed < 1000 ? 1 : elapsed < 1450 ? 2 : elapsed < 3200 ? 3 : 4;
      if (next !== phase) {
        phase = next;
        hosts[0].classList.toggle("failed", phase >= 1);
        hosts[0].querySelector(".ar-badge").textContent = phase >= 1 ? "×" : "✓";
        gate.classList.toggle("visible", phase >= 2);
        states[0].textContent = phase === 0 ? "2 modules running" : phase === 1 ? "Failure detected" : "Stopped & fenced";
        status.textContent = TEXT[phase];
        dot.style.background = phase === 1 ? "var(--ar-red)" : "var(--ar-teal)";
        steps.forEach(function (s, i) { s.classList.toggle("passed", phase >= i + 1); });
      }
      points.forEach(function (q, i) {
        var raw = clamp((elapsed - q.start) / (q.end - q.start)), t = ease(raw);
        var cx1 = q.from.x + (q.to.x - q.from.x) * 0.23, cy1 = q.from.y - q.lift * 1.34;
        var cx2 = q.from.x + (q.to.x - q.from.x) * 0.77, cy2 = q.to.y - q.lift * 1.34;
        var one = 1 - t;
        var x = one * one * one * q.from.x + 3 * one * one * t * cx1 + 3 * one * t * t * cx2 + t * t * t * q.to.x;
        var y = one * one * one * q.from.y + 3 * one * one * t * cy1 + 3 * one * t * t * cy2 + t * t * t * q.to.y;
        var landed = elapsed >= q.end + 180;
        var moving = raw > 0 && raw < 1;
        var tilt = moving ? Math.sin(Math.PI * t * 2) * 6 : 0;
        var scale = moving ? 1 + Math.sin(Math.PI * t) * 0.08 : 1;
        modules[i].style.transform = "translate(" + x + "px," + y + "px) rotate(" + tilt + "deg) scale(" + scale + ")";
        modules[i].classList.toggle("off", phase >= 1 && elapsed < q.start);
        modules[i].classList.toggle("flying", elapsed >= q.start && !landed);
        hosts[i + 1].classList.toggle("ready", landed);
        states[i + 1].textContent = landed ? "Module " + (i === 0 ? "A" : "B") + " running" : elapsed >= q.end ? "Starting…" : elapsed >= q.start ? "Restart queued" : "Ready";
        paths[i].style.opacity = elapsed >= q.start && phase < 4 ? "0.85" : "0";
        flows[i].style.opacity = moving ? "1" : "0";
        flows[i].style.strokeDashoffset = String(-elapsed * 0.045);
        var pulse = clamp((elapsed - q.end - 180) / 550);
        var halo = hosts[i + 1].querySelector(".ar-halo");
        halo.style.opacity = landed && pulse < 1 ? String((1 - pulse) * 0.55) : "0";
        halo.style.transform = "scale(" + (1 + pulse * 0.6) + ")";
      });
    }

    function stopFrame() { if (frame !== null) { cancelAnimationFrame(frame); frame = null; } }
    function tick(now) {
      if (last !== null && !paused) {
        elapsed += Math.min(now - last, 80);
        if (!reduce && elapsed >= duration + hold) { elapsed = 0; phase = -1; }
      }
      last = now; paint();
      if (reduce && elapsed >= duration) { paused = true; button.textContent = "Replay"; frame = null; return; }
      frame = paused ? null : requestAnimationFrame(tick);
    }
    function run() { if (frame === null && !paused) { last = null; frame = requestAnimationFrame(tick); } }
    function play() { elapsed = 0; paused = false; phase = -1; button.textContent = "Pause"; run(); }

    button.textContent = reduce ? "Replay" : "Pause";
    button.addEventListener("click", function () {
      if (reduce) { if (paused || elapsed >= duration) play(); else { paused = true; stopFrame(); button.textContent = "Replay"; } return; }
      if (!started) {
        userStopped = !userStopped; paused = userStopped; button.textContent = userStopped ? "Resume" : "Pause";
        if (!userStopped) { started = true; elapsed = 0; phase = -1; run(); }
        return;
      }
      if (!paused) {
        paused = true; userStopped = true; button.textContent = "Resume"; stopFrame();
      } else {
        userStopped = false; paused = false;
        if (elapsed >= duration + hold) { elapsed = 0; phase = -1; }
        button.textContent = "Pause"; run();
      }
    });
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(scene); else window.addEventListener("resize", measure);
    measure(); // the finished picture until it plays
    if (!reduce && "IntersectionObserver" in window) {
      var seen = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!started) { started = true; play(); } else if (!userStopped) run(); }
          else if (started && !userStopped) stopFrame();
        });
      }, { threshold: 0.45 });
      seen.observe(root);
    }
    document.addEventListener("visibilitychange", function () {
      if (reduce || !started || userStopped) return;
      if (document.hidden) stopFrame(); else run();
    });
  });

  // Copy buttons.
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (!b) return;
    var done = function (t) { var o = b.getAttribute("data-label") || b.textContent; b.setAttribute("data-label", o); b.textContent = t; setTimeout(function () { b.textContent = o; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute("data-copy")).then(function () { done("Copied"); }, function () { done("Select and copy"); });
    else done("Select and copy");
  });

  // Contact form.
  var form = document.getElementById("contact-form");
  if (!form) return;
  var cfg = window.APELORA_CONTACT || {};
  var TYPES = { demo: "Request a demo", deployment: "Deployment", support: "Support", training: "Training and certificates", custom: "Custom services", other: "Something else" };
  var type = form.elements.type;
  var wanted = new URLSearchParams(window.location.search).get("type");
  if (wanted && TYPES[wanted]) type.value = wanted;
  var status = document.getElementById("form-status");
  var notice = document.getElementById("form-notice");
  var submit = form.querySelector("button[type=submit]");
  if (!cfg.endpoint && notice) notice.hidden = false;

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var rules = {
    name: function (v) { return v ? "" : "Enter your name."; },
    email: function (v) { return !v ? "Enter your email address." : EMAIL.test(v) ? "" : "Enter an email address like name@company.com."; },
    type: function (v) { return v ? "" : "Choose what you would like to talk about."; },
    message: function (v) { return v.length < 10 ? "Tell us a little about your environment or question (at least 10 characters)." : ""; },
  };
  var show = function (kind, title, text, withCopy) {
    status.hidden = false;
    status.className = "status " + kind;
    status.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = title; status.appendChild(h);
    var p = document.createElement("p"); p.textContent = text; status.appendChild(p);
    if (withCopy) {
      var c = document.createElement("button");
      c.type = "button"; c.className = "btn btn-line btn-sm"; c.textContent = "Copy your message";
      c.setAttribute("data-copy", summary());
      status.appendChild(c);
    }
    status.focus();
  };
  var summary = function () {
    var f = form.elements;
    return ["Enquiry: " + (TYPES[f.type.value] || f.type.value), "Name: " + f.name.value.trim(), "Email: " + f.email.value.trim(), "Organisation: " + (f.organisation.value.trim() || "-"), "", f.message.value.trim()].join("\n");
  };
  var validate = function () {
    var first = null;
    Object.keys(rules).forEach(function (k) {
      var el = form.elements[k];
      var msg = rules[k](el.value.trim());
      var out = document.getElementById("err-" + k);
      out.textContent = msg;
      if (msg) { el.setAttribute("aria-invalid", "true"); if (!first) first = el; } else el.removeAttribute("aria-invalid");
    });
    return first;
  };
  Object.keys(rules).forEach(function (k) {
    form.elements[k].addEventListener("input", function () {
      if (form.elements[k].getAttribute("aria-invalid") === "true" && !rules[k](form.elements[k].value.trim())) {
        form.elements[k].removeAttribute("aria-invalid"); document.getElementById("err-" + k).textContent = "";
      }
    });
  });
  form.elements.message.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); form.requestSubmit(); } });

  var busy = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    status.hidden = true;
    var bad = validate();
    if (bad) { bad.focus(); return; }
    if (form.elements.website && form.elements.website.value) return; // a bot filled the hidden field
    if (!cfg.endpoint) {
      show("warn", "Not sent", "This form is not connected to a message service yet, so nothing left your browser. Copy your message and send it through one of the channels beside the form.", true);
      return;
    }
    busy = true;
    submit.disabled = true;
    var label = submit.querySelector("span");
    var spin = document.createElement("i"); spin.className = "spin"; spin.setAttribute("aria-hidden", "true");
    submit.insertBefore(spin, submit.firstChild);
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, 15000);
    var data = new FormData(form);
    data.set("enquiry_label", TYPES[type.value] || type.value);
    fetch(cfg.endpoint, { method: "POST", body: data, headers: { Accept: "application/json" }, signal: ctl.signal })
      .then(function (res) {
        if (res.ok) {
          show("ok", "Message sent", "Thank you. We have your message and will reply to " + form.elements.email.value.trim() + ".", false);
          form.elements.message.value = "";
        } else {
          show("bad", "Your message was not accepted", "The message service answered " + res.status + ". Nothing was lost: your message is still in the form. Try again, or copy it and use another channel.", true);
        }
      })
      .catch(function () {
        show("bad", "Your message could not be sent", "The message service did not answer. Nothing was lost: your message is still in the form. Try again, or copy it and use another channel.", true);
      })
      .then(function () {
        clearTimeout(timer); busy = false; submit.disabled = false; if (spin.parentNode) spin.parentNode.removeChild(spin);
        if (label) label.textContent = "Send message";
      });
  });
})();

// Documentation: search, the menu on small screens, the contents list and copy buttons.
(function () {
  "use strict";
  var docs = document.querySelector(".docs");
  if (!docs) return;

  var navEl = document.getElementById("docs-nav");
  var menuBtn = document.querySelector(".docs-menu-btn");
  if (menuBtn && navEl) {
    menuBtn.hidden = false;
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") !== "true";
      menuBtn.setAttribute("aria-expanded", String(open));
      navEl.classList.toggle("is-open", open);
    });
  }

  // Copy buttons on code blocks.
  Array.prototype.forEach.call(docs.querySelectorAll(".prose pre"), function (pre) {
    if (!navigator.clipboard || pre.closest("details")) return;
    var b = document.createElement("button");
    b.type = "button"; b.className = "copy"; b.textContent = "Copy";
    b.setAttribute("aria-label", "Copy this code");
    b.addEventListener("click", function () {
      var code = pre.querySelector("code");
      navigator.clipboard.writeText(code ? code.textContent : pre.textContent).then(function () {
        b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600);
      }, function () { b.textContent = "Not copied"; setTimeout(function () { b.textContent = "Copy"; }, 1600); });
    });
    pre.appendChild(b);
  });

  // Contents list: mark the section being read.
  var tocLinks = Array.prototype.slice.call(docs.querySelectorAll(".docs-toc a"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[decodeURIComponent(a.hash.slice(1))] = a; });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (current) current.classList.remove("is-current");
          current = map[e.target.id]; if (current) current.classList.add("is-current");
        }
      });
    }, { rootMargin: "-80px 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // Search: the index is fetched the first time the box is used.
  var q = document.getElementById("docs-q");
  var list = document.getElementById("docs-results");
  if (!q || !list) return;
  q.hidden = false;
  var index = null, loading = false, active = -1, shown = [];
  var load = function (then) {
    if (index) return then();
    if (loading) return;
    loading = true;
    fetch("/assets/docs-index.json").then(function (r) { return r.json(); }).then(function (d) { index = d; loading = false; then(); })
      .catch(function () { loading = false; list.hidden = false; list.innerHTML = '<li class="none">Search is not available right now.</li>'; });
  };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var snippet = function (text, terms) {
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = low.indexOf(terms[i]);
    var from = Math.max(0, at - 40);
    return (from ? "…" : "") + text.slice(from, from + 110) + (text.length > from + 110 ? "…" : "");
  };
  var run = function () {
    var terms = q.value.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
    active = -1;
    if (!terms.length) { list.hidden = true; q.setAttribute("aria-expanded", "false"); return; }
    var scored = [];
    index.forEach(function (e) {
      var title = e.t.toLowerCase(), head = e.h.toLowerCase(), text = e.x.toLowerCase(), score = 0, ok = true;
      terms.forEach(function (t) {
        var s = 0;
        if (title.indexOf(t) >= 0) s += 8;
        if (head.indexOf(t) >= 0) s += 5;
        if (text.indexOf(t) >= 0) s += 1;
        if (!s) ok = false;
        score += s;
      });
      if (ok) scored.push({ e: e, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    shown = scored.slice(0, 8);
    list.hidden = false; q.setAttribute("aria-expanded", "true");
    if (!shown.length) { list.innerHTML = '<li class="none">Nothing found for “' + esc(q.value) + '”.</li>'; return; }
    list.innerHTML = shown.map(function (s, i) {
      var e = s.e;
      return '<li role="presentation"><a role="option" id="docs-r' + i + '" href="' + e.u + '"><b>' + esc(e.t) + (e.h ? " · " + esc(e.h) : "") + "</b><small>" + esc(e.s) + " — " + esc(snippet(e.x, terms)) + "</small></a></li>";
    }).join("");
  };
  var mark = function (n) {
    var items = list.querySelectorAll("a");
    if (!items.length) return;
    active = (n + items.length) % items.length;
    Array.prototype.forEach.call(items, function (a, i) { a.setAttribute("aria-selected", String(i === active)); });
    q.setAttribute("aria-activedescendant", items[active].id);
    items[active].scrollIntoView({ block: "nearest" });
  };
  q.addEventListener("focus", function () { load(function () { if (q.value) run(); }); });
  q.addEventListener("input", function () { load(run); });
  q.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); mark(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); mark(active - 1); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); location.href = list.querySelectorAll("a")[active].href; }
    else if (e.key === "Escape") { if (!list.hidden) { list.hidden = true; q.setAttribute("aria-expanded", "false"); } else q.blur(); }
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".docs-search")) { list.hidden = true; q.setAttribute("aria-expanded", "false"); } });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) { e.preventDefault(); if (menuBtn && menuBtn.getAttribute("aria-expanded") === "false" && getComputedStyle(menuBtn).display !== "none") menuBtn.click(); q.focus(); }
  });
})();
