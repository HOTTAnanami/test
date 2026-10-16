document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("header.html");
        if (response.ok) {
            const html = await response.text();
            document.getElementById("header-include").innerHTML = html;
            initHeaderMenu();
        }
    } catch (error) {
        console.error("ヘッダーの読み込みに失敗しました:", error);
    }

    const introLogo = document.getElementById("intro-logo");
    const originalImages = [];
    for (let i = 1; i <= 40; i++) {
        const num = String(i).padStart(2, '0');
        if (i <= 30) {
            originalImages.push(`img/image${num}.svg`);
        } else {
            originalImages.push(`img/image${num}.png`);
        }
    }

    let imagePool = [];
    function refreshImagePool() {
        imagePool = [...originalImages];
        for (let i = imagePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imagePool[i], imagePool[j]] = [imagePool[j], imagePool[i]];
        }
    }
    refreshImagePool();

    const container = document.getElementById("image-container");
    const fvSection = document.getElementById("fv");
    let lastX = 0;
    let lastY = 0;
    const distanceThreshold = 100; 
    const maxOnScreen = 20;       
    let isFirstMove = true;
    let hasDragged = false; 

    function createTrailImage(x, y) {
        if (!fvSection) return;
        const heroRect = fvSection.getBoundingClientRect();
        if (y > heroRect.bottom) return;

        if (isFirstMove) {
            lastX = x;
            lastY = y;
            isFirstMove = false;
            return;
        }

        const distance = Math.hypot(x - lastX, y - lastY);

        if (distance >= distanceThreshold) {
            if (!hasDragged && introLogo) {
                hasDragged = true;
                introLogo.style.animation = "none";
                
                const fadeAnimation = introLogo.animate([
                    { opacity: 1, transform: 'translate(-50%, -50%)' },
                    { opacity: 0, transform: 'translate(-50%, -50%)' }
                ], {
                    duration: 500,
                    easing: 'ease',
                    fill: 'forwards'
                });

                fadeAnimation.onfinish = () => {
                    introLogo.style.display = "none";
                };
            }

            const randomIndex = Math.floor(Math.random() * originalImages.length);
            const nextImage = originalImages[randomIndex];

            const img = document.createElement("img");
            img.src = nextImage;
            img.classList.add("trail-image");

            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
            img.style.animationDelay = `0s`;
            img.style.animationDuration = `${(5.8 + Math.random() * 3.5).toFixed(2)}s`;

            container.appendChild(img);

            const activeImages = container.querySelectorAll(".trail-image:not(.is-fading)");
            if (activeImages.length > maxOnScreen) {
                const oldestImg = activeImages[0];
                oldestImg.classList.add("is-fading");
                setTimeout(() => {
                    oldestImg.remove();
                }, 800);
            }

            lastX = x;
            lastY = y;
        }
    }

    if (fvSection && container) {
        fvSection.addEventListener("mousemove", (e) => {
            createTrailImage(e.clientX, e.clientY);
        });

        fvSection.addEventListener("touchmove", (e) => {
            const touch = e.touches[0];
            createTrailImage(touch.clientX, touch.clientY);
        }, { passive: true });
    }

    const scrollBtn = document.getElementById("scroll-btn");
    const heroSection = document.getElementById("hero");

    if (scrollBtn && heroSection) {
        scrollBtn.addEventListener("click", () => {
            heroSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        if (currentScrollY > windowHeight * 0.5) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                const header = document.querySelector(".global-header");
                if (header) {
                    header.classList.remove("is-visible");
                    header.classList.add("is-hidden");
                }
            } else {
                const header = document.querySelector(".global-header");
                if (header) {
                    header.classList.remove("is-hidden");
                    header.classList.add("is-visible");
                }
            }
        } else {
            const header = document.querySelector(".global-header");
            if (header) {
                header.classList.remove("is-visible", "is-hidden");
            }
        }

        lastScrollY = currentScrollY;
    });

    window.addEventListener("wheel", (e) => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        if (scrollY < windowHeight / 2 && e.deltaY > 0 && !window.isAnimating) {
            e.preventDefault();
            window.isAnimating = true;

            if (heroSection) {
                heroSection.scrollIntoView({ behavior: "smooth" });
            }

            setTimeout(() => {
                window.isAnimating = false;
            }, 800);
        }
    }, { passive: false });

    const sections = document.querySelectorAll(".section");
    const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bgCol = entry.target.getAttribute("data-bg");
                if (bgCol) {
                    document.body.style.backgroundColor = bgCol;
                }
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));

    const toggleTriggers = document.querySelectorAll(".toggle-trigger");
    toggleTriggers.forEach(trigger => {
        const targetId = trigger.getAttribute("data-target");
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            trigger.addEventListener("change", () => {
                targetElement.style.display = trigger.checked ? "block" : "none";
            });
        }
    });

    const requiredInputs = document.querySelectorAll(".required-input");
    const reqCheckboxes = document.querySelectorAll(".req-checkbox");
    const privacyCheckbox = document.getElementById("privacy-checkbox");
    const submitBtn = document.getElementById("submit-btn");

    function validateForm() {
        let allInputsFilled = true;
        requiredInputs.forEach(input => {
            if (!input.value.trim()) allInputsFilled = false;
        });

        let anyCheckboxChecked = false;
        reqCheckboxes.forEach(cb => {
            if (cb.checked) anyCheckboxChecked = true;
        });

        const privacyChecked = privacyCheckbox ? privacyCheckbox.checked : false;

        if (submitBtn) {
            submitBtn.disabled = !(allInputsFilled && anyCheckboxChecked && privacyChecked);
        }
    }

    requiredInputs.forEach(input => input.addEventListener("input", validateForm));
    reqCheckboxes.forEach(cb => cb.addEventListener("change", validateForm));
    if (privacyCheckbox) privacyCheckbox.addEventListener("click", validateForm);

    validateForm();

    const contactForm = document.getElementById("contact-form");
    if (contactForm && submitBtn) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const serviceID = "YOUR_SERVICE_ID";
            const templateID = "YOUR_TEMPLATE_ID";

            submitBtn.textContent = "送信中...";
            submitBtn.disabled = true;

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    alert("お問い合わせが送信されました。ありがとうございます。");
                    contactForm.reset();
                    document.querySelectorAll(".sub-textarea-wrap").forEach(el => el.style.display = "none");
                    submitBtn.textContent = "確認画面へ進む";
                    validateForm();
                }, (error) => {
                    alert("送信に失敗しました。お手数ですが時間をおいて再度お試しください。");
                    console.error("FAILED...", error);
                    submitBtn.textContent = "確認画面へ進む";
                    validateForm();
                });
        });
    }
});

function initHeaderMenu() {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const bigMenu = document.getElementById("big-menu");

    if (hamburgerBtn && bigMenu) {
        hamburgerBtn.addEventListener("click", () => {
            hamburgerBtn.classList.toggle("active");
            bigMenu.classList.toggle("is-active");
        });
    }

    const menuLinks = document.querySelectorAll(".big-menu-link");
    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");

            if (hamburgerBtn && bigMenu) {
                hamburgerBtn.classList.remove("active");
                bigMenu.classList.remove("is-active");
            }

            if (href.startsWith("#")) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            } else if (href.includes("#")) {
                const [path, hash] = href.split("#");
                const currentPath = window.location.pathname.split("/").pop();
                
                if (currentPath === path || currentPath === "" && path === "index.html") {
                    e.preventDefault();
                    const targetElement = document.querySelector("#" + hash);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }
        });
    });
}