// FAQ / Dicas importantes
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
    const header = item.querySelector(".faq-header");
    header.addEventListener("click", () => {
        // fecha outras
        faqItems.forEach((el) => {
            if (el !== item) el.classList.remove("active");
        });
        item.classList.toggle("active");

        // atualiza sinais +/-
        faqItems.forEach((el) => {
            const t = el.querySelector(".faq-toggle");
            if (el.classList.contains("active")) {
                t.textContent = "−";
            } else {
                t.textContent = "+";
            }
        });
    });
});

// scroll suave
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 60,
                    behavior: "smooth",
                });
            }
        }
    });
});
