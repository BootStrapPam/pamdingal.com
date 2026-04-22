const yearEl = document.querySelector("#year");
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 950) {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

// Contact form — posts to Cloudflare Worker
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const submitBtn = document.querySelector("#submitBtn");

// Replace this URL after you deploy the Worker (run: wrangler deploy)
const WORKER_URL = "https://pamdingal-contact.YOUR_SUBDOMAIN.workers.dev";

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector("#cf-name").value.trim();
    const email = document.querySelector("#cf-email").value.trim();
    const message = document.querySelector("#cf-message").value.trim();

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("", "");

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("Message sent! I’ll get back to you soon.", "success");
        contactForm.reset();
      } else {
        setStatus(data.error || "Something went wrong. Please try again.", "error");
      }
    } catch {
      setStatus("Could not send message. Please try again later.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

function setStatus(text, type) {
  if (!formStatus) return;
  formStatus.textContent = text;
  formStatus.className = "form-status" + (type ? " " + type : "");
}
