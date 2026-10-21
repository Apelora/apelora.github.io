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
  var TYPES = { demo: "Request a demo", deployment: "Deployment", support: "Support", custom: "Custom services", other: "Something else" };
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
