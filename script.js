document.addEventListener("DOMContentLoaded", () => {
  const PHONE_INTL = "+33756878703";
  const PHONE_WA = "33756878703";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function defaultMessage(source = "site") {
    return `Bonjour, je vous contacte depuis le site, j’ai besoin d’un plombier. Pouvez-vous me rappeler ?`;
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

  function smsLink(number, body) {
    const encoded = encodeURIComponent(body || "");
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isIOS ? `sms:${number}&body=${encoded}` : `sms:${number}?body=${encoded}`;
  }

  function waLink(numberWa, body) {
    const encoded = encodeURIComponent(body || "");
    return `https://wa.me/${numberWa}?text=${encoded}`;
  }

  // Hydrate SMS / WA buttons
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

  // Form -> open SMS
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

  if (!drawer || !burger || !closeBtn || !backdrop) return;

  let lastFocused = null;

  function openDrawer() {
    lastFocused = document.activeElement;
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeDrawer() {
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function isOpen() {
    return drawer.getAttribute("aria-hidden") === "false";
  }

  burger.addEventListener("click", () => (isOpen() ? closeDrawer() : openDrawer()));
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeDrawer();
  });

  // Close drawer when clicking a link
  $$("#drawer a").forEach((a) => a.addEventListener("click", closeDrawer));
});
