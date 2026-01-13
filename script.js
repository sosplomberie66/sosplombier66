(() => {
  const PHONE_INTL = "+33756878703";
  const PHONE_WA = "33756878703";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year footer
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Build a clean default message
  function buildDefaultMessage(source = "site") {
    return `Bonjour, je vous contacte depuis le site (source: ${source}). J’ai besoin d’un plombier à Perpignan / 66. Pouvez-vous me rappeler ?`;
  }

  function buildFormMessage() {
    const name = ($("#name")?.value || "").trim();
    const phone = ($("#phone")?.value || "").trim();
    const msg = ($("#msg")?.value || "").trim();

    return [
      "Bonjour,",
      "Demande de dépannage plomberie :",
      name ? `Nom : ${name}` : null,
      phone ? `Téléphone : ${phone}` : null,
      msg ? `Demande : ${msg}` : null,
      "",
      "Merci."
    ].filter(Boolean).join("\n");
  }

  // SMS deep link (iOS vs others)
  function smsLink(number, body) {
    const encoded = encodeURIComponent(body || "");
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    // iOS uses &body=, many others accept ?body=
    return isIOS
      ? `sms:${number}&body=${encoded}`
      : `sms:${number}?body=${encoded}`;
  }

  function waLink(numberWa, body) {
    const encoded = encodeURIComponent(body || "");
    return `https://wa.me/${numberWa}?text=${encoded}`;
  }

  // Apply SMS/WA links to all buttons with data-sms / data-wa
  function hydrateQuickLinks() {
    $$("[data-sms]").forEach((a) => {
      const source = a.getAttribute("data-sms") || "site";
      a.setAttribute("href", smsLink(PHONE_INTL, buildDefaultMessage(source)));
    });

    $$("[data-wa]").forEach((a) => {
      const source = a.getAttribute("data-wa") || "site";
      a.setAttribute("href", waLink(PHONE_WA, buildDefaultMessage(source)));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }
  hydrateQuickLinks();

  // Form submit => open SMS with full message
  const form = $("#quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const message = buildFormMessage();
      window.location.href = smsLink(PHONE_INTL, message);
    });
  }

  // Mobile drawer
  const drawer = $("#drawer");
  const burger = $(".burger");
  const closeBtn = $(".drawerClose");
  const backdrop = $(".drawerBackdrop");

  let lastFocused = null;

  function setDrawer(open) {
    if (!drawer || !burger) return;

    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      lastFocused = document.activeElement;
      const firstFocusable = drawer.querySelector("button, a, input, textarea, [tabindex]:not([tabindex='-1'])");
      firstFocusable?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }
  }

  function isOpen() {
    return drawer?.getAttribute("aria-hidden") === "false";
  }

  burger?.addEventListener("click", () => setDrawer(!isOpen()));
  closeBtn?.addEventListener("click", () => setDrawer(false));
  backdrop?.addEventListener("click", () => setDrawer(false));

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setDrawer(false);
  });

  // Close drawer when clicking a menu link
  $$("#drawer a").forEach((a) => {
    a.addEventListener("click", () => setDrawer(false));
  });

  // Basic focus trap
  document.addEventListener("keydown", (e) => {
    if (!isOpen() || e.key !== "Tab") return;

    const focusables = drawer.querySelectorAll("button, a, input, textarea, [tabindex]:not([tabindex='-1'])");
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
