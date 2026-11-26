// Rearmour page: menu toasts, rotating tips, server status light, account login/signup.
(function () {
  var API = (window.REARMOUR_API || "").replace(/\/+$/, "");
  var $ = function (id) { return document.getElementById(id); };

  // ---------- toast ----------
  var toast = $("toast"), toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }
  document.querySelectorAll("[data-toast]").forEach(function (el) {
    el.addEventListener("click", function () { showToast(el.getAttribute("data-toast")); });
  });

  // ---------- tips ----------
  var TIPS = [
    "Your username is your identity in Rearmour. Grab it before someone else does.",
    "Rooms you make can be public or just for your friends.",
    "Your character's look is saved to your account, so it follows you to any device.",
    "Smaller rooms feel smoother. Four to eight friends is the sweet spot.",
  ];
  var tipIdx = Math.floor(Math.random() * TIPS.length);
  function nextTip() { $("tip-text").textContent = TIPS[tipIdx++ % TIPS.length]; }
  nextTip();
  setInterval(nextTip, 7000);

  // ---------- storage helpers (can throw in private windows) ----------
  function store(key, val) {
    try { if (val == null) localStorage.removeItem(key); else localStorage.setItem(key, val); } catch (e) {}
  }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  // ---------- HTTP ----------
  function api(path, opts) {
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 8000);
    opts = opts || {};
    opts.signal = ctl.signal;
    return fetch(API + path, opts).then(function (r) {
      clearTimeout(t);
      return r.text().then(function (txt) {
        var data = null;
        try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
        if (!r.ok) {
          var err = new Error((data && data.error) || "Something went wrong (" + r.status + ")");
          err.status = r.status;
          throw err;
        }
        return data;
      });
    }, function (e) {
      clearTimeout(t);
      throw new Error("Can't reach the server right now. Try again in a bit.");
    });
  }

  // ---------- server status ----------
  var dot = $("srv-dot"), srvText = $("srv-text");
  function checkServer() {
    if (!API) { dot.className = "dot"; srvText.textContent = "Not connected yet"; return; }
    var ctl = new AbortController();
    var t = setTimeout(function () { ctl.abort(); }, 5000);
    fetch(API + "/healthz", { signal: ctl.signal }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw 0;
      dot.className = "dot on"; srvText.textContent = "Online";
    }).catch(function () {
      clearTimeout(t);
      dot.className = "dot off"; srvText.textContent = "Offline right now";
    });
  }
  checkServer();
  setInterval(checkServer, 30000);

  // ---------- account ----------
  var mode = "login";
  var signedOut = $("signed-out"), signedIn = $("signed-in"), msg = $("auth-msg");

  function setMode(m) {
    mode = m;
    $("tab-login").setAttribute("aria-selected", m === "login");
    $("tab-register").setAttribute("aria-selected", m === "register");
    $("auth-submit").textContent = m === "login" ? "Log in" : "Create account";
    $("password").setAttribute("autocomplete", m === "login" ? "current-password" : "new-password");
    msg.textContent = ""; msg.className = "msg";
  }
  $("tab-login").addEventListener("click", function () { setMode("login"); });
  $("tab-register").addEventListener("click", function () { setMode("register"); });

  function showSignedIn(name) {
    $("who").textContent = name;
    signedOut.classList.add("hidden");
    signedIn.classList.remove("hidden");
  }
  function showSignedOut() {
    signedIn.classList.add("hidden");
    signedOut.classList.remove("hidden");
  }

  $("auth-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!API) { msg.className = "msg err"; msg.textContent = "Accounts aren't connected yet."; return; }
    var btn = $("auth-submit");
    btn.disabled = true;
    msg.className = "msg"; msg.textContent = "One moment…";
    api(mode === "login" ? "/api/login" : "/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: $("username").value.trim(), password: $("password").value }),
    }).then(function (res) {
      store("rearmour_token", res.token);
      $("password").value = "";
      msg.textContent = "";
      showSignedIn(res.username);
      showToast(mode === "register" ? "Account created. Welcome to Rearmour!" : "Welcome back, " + res.username + "!");
    }).catch(function (err) {
      msg.className = "msg err"; msg.textContent = err.message;
    }).then(function () { btn.disabled = false; });
  });

  $("logout").addEventListener("click", function () {
    store("rearmour_token", null);
    showSignedOut();
  });

  // restore a saved login
  var saved = load("rearmour_token");
  if (saved && API) {
    api("/api/me", { headers: { Authorization: "Bearer " + saved } })
      .then(function (me) { showSignedIn(me.username); })
      .catch(function (err) {
        if (err.status === 401) store("rearmour_token", null); // expired or invalid
      });
  }
})();
