const header = document.querySelector("[data-header]");
const floatingBar = document.querySelector("[data-floating-bar]");
const cookieBanner = document.querySelector("[data-cookie-banner]");
const form = document.querySelector("[data-lead-form]");
const formMessage = document.querySelector("[data-form-message]");
const leadTypeInput = form?.querySelector('input[name="lead_type"]');
const requestTimeInput = form?.querySelector('input[name="request_time"]');
const burgerButton = document.querySelector("[data-burger]");
const educationToggle = document.querySelector('[data-toggle="education"]');
const educationDetails = document.querySelector("#education-details");
const revealElements = [...document.querySelectorAll("[data-reveal]")];
const galleryModal = document.querySelector("[data-gallery-modal]");
const galleryModalImage = document.querySelector("[data-gallery-modal-image]");
const galleryModalTitle = document.querySelector("[data-gallery-modal-title]");
const galleryModalDescription = document.querySelector("[data-gallery-modal-description]");
const heroTitle = document.querySelector("[data-hero-title]");
const roadmapSection = document.querySelector("[data-roadmap-section]");
const roadmapSteps = [...document.querySelectorAll("[data-roadmap-step]")];
const roadmapProgress = document.querySelector("[data-roadmap-progress]");
const gallerySlides = [...document.querySelectorAll("[data-gallery-track] [data-gallery-item]")];
const reviewsCarousel = document.querySelector("[data-reviews-carousel]");
const reviewsViewport = document.querySelector("[data-reviews-viewport]");
const reviewSlides = [...document.querySelectorAll("[data-review-slide]")];
const reviewsPrevButton = document.querySelector("[data-reviews-prev]");
const reviewsNextButton = document.querySelector("[data-reviews-next]");
const reviewsDots = document.querySelector("[data-reviews-dots]");

const dataLayer = (window.dataLayer = window.dataLayer || []);

const pushEvent = (eventName, payload = {}) => {
  dataLayer.push({ event: eventName, ...payload });
};

const setHeaderState = () => {
  const scrolled = window.scrollY > 24;
  header?.classList.toggle("is-scrolled", scrolled);
  if (floatingBar) {
    floatingBar.hidden = window.scrollY < 160;
  }
};

window.addEventListener("scroll", setHeaderState, { passive: true });
window.addEventListener("load", setHeaderState);

burgerButton?.addEventListener("click", () => {
  const isOpen = header?.classList.toggle("menu-open");
  burgerButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
  burgerButton.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
});

document.addEventListener("click", (event) => {
  if (!header?.classList.contains("menu-open")) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest(".header-inner")) return;
  header.classList.remove("menu-open");
  burgerButton?.setAttribute("aria-expanded", "false");
  burgerButton?.setAttribute("aria-label", "Відкрити меню");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header?.classList.contains("menu-open")) {
    header.classList.remove("menu-open");
    burgerButton?.setAttribute("aria-expanded", "false");
    burgerButton?.setAttribute("aria-label", "Відкрити меню");
  }
});

if (heroTitle) {
  const text = heroTitle.textContent || "";
  heroTitle.textContent = "";
  let charIndex = 0;
  text.split(" ").forEach((word, wordIndex, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";

    [...word].forEach((character) => {
      const charSpan = document.createElement("span");
      charSpan.className = "char";
      charSpan.textContent = character;
      charSpan.style.setProperty("--char-delay", `${charIndex * 38}ms`);
      wordSpan.append(charSpan);
      charIndex += 1;
    });

    heroTitle.append(wordSpan);

    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.className = "word-space";
      spaceSpan.textContent = "\u00A0";
      heroTitle.append(spaceSpan);
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const headerOffset = header ? header.offsetHeight + 12 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    header?.classList.remove("menu-open");
    burgerButton?.setAttribute("aria-expanded", "false");
    burgerButton?.setAttribute("aria-label", "Відкрити меню");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealElements.forEach((element, index) => {
  element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  revealObserver.observe(element);
});

document.querySelectorAll("[data-cta]").forEach((button) => {
  button.addEventListener("click", () => pushEvent("cta_click"));
});

document.querySelectorAll("[data-phone-call]").forEach((link) => {
  link.addEventListener("click", () => {
    pushEvent("phone_call");
  });
});

let scroll50Sent = false;
let scroll90Sent = false;

window.addEventListener(
  "scroll",
  () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrolled = window.scrollY / docHeight;
    if (!scroll50Sent && scrolled >= 0.5) {
      scroll50Sent = true;
      pushEvent("scroll_50");
    }
    if (!scroll90Sent && scrolled >= 0.9) {
      scroll90Sent = true;
      pushEvent("scroll_90");
    }
  },
  { passive: true }
);

educationToggle?.addEventListener("click", () => {
  const isHidden = educationDetails.hasAttribute("hidden");
  educationDetails.toggleAttribute("hidden");
  educationToggle.textContent = isHidden
    ? "Сховати деталі"
    : "Детальніше про освіту";
});

const bindGalleryItem = (item) => {
  item.addEventListener("click", () => {
    if (!galleryModal || !galleryModalImage || !galleryModalTitle || !galleryModalDescription) return;
    galleryModalImage.src = item.dataset.galleryImage || "";
    galleryModalImage.alt = item.dataset.galleryTitle || "";
    galleryModalTitle.textContent = item.dataset.galleryTitle || "";
    galleryModalDescription.textContent = item.dataset.galleryDescription || "";
    galleryModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  });
};

gallerySlides.forEach(bindGalleryItem);

document.querySelectorAll("[data-gallery-close]").forEach((button) => {
  button.addEventListener("click", () => {
    galleryModal?.setAttribute("hidden", "");
    document.body.style.overflow = "";
  });
});

const syncRoadmapState = () => {
  if (!roadmapSection || roadmapSteps.length === 0) return;

  const sectionRect = roadmapSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const total = Math.max(sectionRect.height - viewportHeight * 0.35, 1);
  const progressRatio = Math.min(Math.max((viewportHeight * 0.62 - sectionRect.top) / total, 0), 1);

  if (roadmapProgress) {
    roadmapProgress.style.width = `${18 + progressRatio * 82}%`;
  }

  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  roadmapSteps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - viewportHeight * 0.48);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  roadmapSteps.forEach((step, index) => {
    step.classList.toggle("is-active", index <= activeIndex);
  });
};

window.addEventListener("load", syncRoadmapState);
window.addEventListener("resize", syncRoadmapState);
window.addEventListener("scroll", syncRoadmapState, { passive: true });

if (reviewsCarousel && reviewsViewport && reviewSlides.length > 0) {
  let currentPage = 0;
  let autoplayId = 0;

  const getPerView = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return 1;
    if (window.matchMedia("(max-width: 1199px)").matches) return 2;
    return 3;
  };

  const getPageCount = () => Math.ceil(reviewSlides.length / getPerView());

  const getStepWidth = () => reviewsViewport.clientWidth + 18;

  const renderDots = () => {
    if (!reviewsDots) return;
    const pageCount = getPageCount();
    reviewsDots.innerHTML = "";

    Array.from({ length: pageCount }).forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `reviews-dot${index === currentPage ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Перейти до групи відгуків ${index + 1}`);
      dot.addEventListener("click", () => {
        currentPage = index;
        scrollToCurrentPage();
        restartAutoplay();
      });
      reviewsDots.append(dot);
    });
  };

  const updateControls = () => {
    if (reviewsDots) {
      [...reviewsDots.children].forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentPage);
      });
    }

    const pageCount = getPageCount();
    if (reviewsPrevButton) {
      reviewsPrevButton.disabled = pageCount <= 1;
    }
    if (reviewsNextButton) {
      reviewsNextButton.disabled = pageCount <= 1;
    }
  };

  const scrollToCurrentPage = () => {
    const offset = currentPage * getStepWidth();
    const track = reviewsCarousel.querySelector("[data-reviews-track]");
    if (track) {
      track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    }
    updateControls();
  };

  const setPage = (page) => {
    const pageCount = getPageCount();
    currentPage = ((page % pageCount) + pageCount) % pageCount;
    scrollToCurrentPage();
  };

  const nextPage = () => setPage(currentPage + 1);
  const prevPage = () => setPage(currentPage - 1);

  const stopAutoplay = () => {
    window.clearInterval(autoplayId);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (getPageCount() <= 1) return;
    autoplayId = window.setInterval(nextPage, 5200);
  };

  const restartAutoplay = () => {
    updateControls();
    startAutoplay();
  };

  reviewsPrevButton?.addEventListener("click", () => {
    prevPage();
    restartAutoplay();
  });

  reviewsNextButton?.addEventListener("click", () => {
    nextPage();
    restartAutoplay();
  });

  ["mouseenter", "focusin"].forEach((eventName) => {
    reviewsCarousel.addEventListener(eventName, stopAutoplay);
  });

  ["mouseleave", "focusout"].forEach((eventName) => {
    reviewsCarousel.addEventListener(eventName, startAutoplay);
  });

  window.addEventListener("resize", () => {
    const pageCount = getPageCount();
    currentPage = Math.min(currentPage, pageCount - 1);
    renderDots();
    scrollToCurrentPage();
    startAutoplay();
  });

  renderDots();
  updateControls();
  startAutoplay();
}

const faqItems = [...document.querySelectorAll(".faq-item")];

const setFaqState = (item, shouldOpen) => {
  const trigger = item.querySelector(".faq-trigger");
  const panel = item.querySelector(".faq-panel");
  if (!trigger || !panel) return;

  item.classList.toggle("is-open", shouldOpen);
  trigger.setAttribute("aria-expanded", String(shouldOpen));
  panel.style.maxHeight = shouldOpen ? `${panel.scrollHeight}px` : "0px";
};

faqItems.forEach((item, index) => {
  const trigger = item.querySelector(".faq-trigger");
  if (!trigger) return;

  setFaqState(item, item.classList.contains("is-open") && index === 0);

  trigger.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");
    faqItems.forEach((entry) => setFaqState(entry, false));
    setFaqState(item, willOpen);
  });
});

window.addEventListener("resize", () => {
  faqItems.forEach((item) => {
    if (item.classList.contains("is-open")) {
      setFaqState(item, true);
    }
  });
});

window.addEventListener("load", () => {
  syncRoadmapState();
});

const consentKey = "albekova-cookie-consent";
if (!localStorage.getItem(consentKey)) {
  cookieBanner?.removeAttribute("hidden");
}

document.querySelectorAll("[data-consent]").forEach((button) => {
  button.addEventListener("click", () => {
    const granted = button.dataset.consent === "allow";
    localStorage.setItem(consentKey, granted ? "granted" : "denied");
    cookieBanner?.setAttribute("hidden", "");
    pushEvent("cookie_consent_updated", { consent_status: granted ? "granted" : "denied" });
  });
});

const setMessage = (message, isError = false) => {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.style.color = isError ? "#9b2c2c" : "#3F093C";
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const submittedAt = new Date().toISOString();
  if (requestTimeInput) {
    requestTimeInput.value = submittedAt;
  }
  const payload = {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    type: String(formData.get("lead_type") || "форма").trim() || "форма",
    request_time: submittedAt,
    source: "landing_form",
    page: window.location.href,
    utm_source: new URLSearchParams(window.location.search).get("utm_source") || "",
    utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
    gclid: new URLSearchParams(window.location.search).get("gclid") || "",
  };

  if (!payload.name || !payload.phone) {
    setMessage("Будь ласка, заповніть ім'я та телефон.", true);
    return;
  }

  submitButton?.setAttribute("disabled", "disabled");
  setMessage("Надсилаємо заявку...");

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || "submit_failed");
    }

    pushEvent("form_submit", { lead_type: "form" });
    form.reset();
    if (leadTypeInput) {
      leadTypeInput.value = "форма";
    }
    if (requestTimeInput) {
      requestTimeInput.value = "";
    }
    setMessage("Дякуємо, ми передзвонимо найближчим часом.");
  } catch (error) {
    console.error(error);
    setMessage("Не вдалося надіслати форму. Спробуйте ще раз або зателефонуйте нам.", true);
  } finally {
    if (leadTypeInput && !form.querySelector('input[name="name"]')?.value && !form.querySelector('input[name="phone"]')?.value) {
      leadTypeInput.value = "форма";
    }
    if (requestTimeInput && !form.querySelector('input[name="name"]')?.value && !form.querySelector('input[name="phone"]')?.value) {
      requestTimeInput.value = "";
    }
    submitButton?.removeAttribute("disabled");
  }
});
