(() => {
  const PHONE_INTL = "+33756878703";
  const PHONE_WA = "33756878703";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function defaultMessage(source = "site") {
    return `Bonjour, je vous contacte depuis le site (source: ${source}). J’ai besoin d’un plombier. Pouvez-vous me rappeler ?`;
  }

  function formMessage() {
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
    return isIOS ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
  }

  function waLink(numberWa, body) {
    const encoded = encodeURIComponent(body || "");
    return `https://wa.me/${numberWa}?text=${encoded}`;
  }

  // Hydrate all SMS / WA buttons with a clean prefilled message
  function hydrateLinks() {
    $$("[data-sms]").forEach((a) => {
      const src = a.getAttribute("data-sms") || "site";
      a.setAttribute("href", smsLink(PHONE_INTL, defaultMessage(src)));
    });

    $$("[data-wa]").forEach((a) => {
      const src = a.getAttribute("data-wa") || "site";
      a.setAttribute("href", waLink(PHONE_WA, defaultMessage(src)));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }
  hydrateLinks();

  // Form -> open SMS with the full message
  const form = $("#quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = smsLink(PHONE_INTL, formMessage());
    });
  }

  // Drawer mobile
  const drawer = $("#drawer");
  const burger = $(".burger");
  const closeBtn = $(".drawerClose");
  const backdrop = $(".drawerBackdrop");
  let lastFocused = null;

  function isOpen() {
    return drawer?.getAttribute("aria-hidden") === "false";
  }

  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      lastFocused = document.activeElement;
      document.body.style.overflow = "hidden";
      const firstFocusable = drawer.querySelector("button, a");
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }
  }

  burger?.addEventListener("click", () => setDrawer(!isOpen()));
  closeBtn?.addEventListener("click", () => setDrawer(false));
  backdrop?.addEventListener("click", () => setDrawer(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setDrawer(false);
  });

  // Close drawer when clicking a link
  $$("#drawer a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

  // Focus trap
  document.addEventListener("keydown", (e) => {
    if (!isOpen() || e.key !== "Tab") return;
    const focusables = drawer.querySelectorAll("button, a");
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
