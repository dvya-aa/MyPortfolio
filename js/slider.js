class ImageSlider {
    constructor(selector) {
        this.slider = document.querySelector(selector);
        this.viewport = this.slider.querySelector(".slider-viewport");
        this.track = this.slider.querySelector(".slider-track");
        this.slides = Array.from(this.track.children);
        this.prevBtn = this.slider.querySelector(".prev");
        this.nextBtn = this.slider.querySelector(".next");
        this.dotsBox = this.slider.querySelector(".slider-dots");
        this.count = this.slides.length;
        this.index = 1;
        this.moving = false;
        this.hovering = false;
        this.timer = null;
        this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.createLoop();
        this.createDots();
        this.bindEvents();
        this.move(false);
        this.startAutoSlide();
    }

    createLoop() {
        const first = this.slides[0].cloneNode(true);
        const last = this.slides[this.count - 1].cloneNode(true);
        this.track.appendChild(first);
        this.track.insertBefore(last, this.slides[0]);
    }

    createDots() {
        this.slides.forEach((slide, i) => {
            const dot = document.createElement("button");
            dot.className = "slider-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Go to image ${i + 1}`);

            dot.addEventListener("click", () => {
                if (this.moving) return;
                this.index = i + 1;
                this.move();
                this.startAutoSlide();
            });

            this.dotsBox.appendChild(dot);
        });

        this.dots = Array.from(this.dotsBox.children);
    }

    move(animate = true) {
        const useTransition = animate && !this.reduceMotion;

        this.track.style.transition =
            useTransition ? "transform 0.5s ease-in-out" : "none";

        this.track.style.transform =
            `translateX(-${this.index * 100}%)`;

        this.moving = useTransition;
        this.updateDots();

        if (!useTransition) this.fixBoundary();
    }

    next() {
        if (this.moving) return;
        this.index++;
        this.move();
    }

    previous() {
        if (this.moving) return;
        this.index--;
        this.move();
    }

    fixBoundary() {
        if (this.index === this.count + 1) {
            this.index = 1;
        } else if (this.index === 0) {
            this.index = this.count;
        } else {
            this.moving = false;
            return;
        }

        this.track.style.transition = "none";
        this.track.style.transform =
            `translateX(-${this.index * 100}%)`;

        this.moving = false;
        this.updateDots();
    }

    updateDots() {
        const active =
            (this.index - 1 + this.count) % this.count;

        this.dots.forEach((dot, i) =>
            dot.classList.toggle(
                "active",
                i === active
            )
        );
    }

    startAutoSlide() {
        this.stopAutoSlide();

        if (!this.hovering) {
            this.timer =
                setInterval(
                    () => this.next(),
                    5000
                );
        }
    }

    stopAutoSlide() {
        clearInterval(this.timer);
        this.timer = null;
    }

    bindEvents() {
        this.nextBtn.addEventListener(
            "click",
            () => {
                this.next();
                this.startAutoSlide();
            }
        );

        this.prevBtn.addEventListener(
            "click",
            () => {
                this.previous();
                this.startAutoSlide();
            }
        );

        this.track.addEventListener(
            "transitionend",
            (event) => {
                if (
                    event.propertyName ===
                    "transform"
                ) {
                    this.fixBoundary();
                }
            }
        );

        this.viewport.addEventListener(
            "mouseenter",
            () => {
                this.hovering = true;
                this.stopAutoSlide();
            }
        );

        this.viewport.addEventListener(
            "mouseleave",
            () => {
                this.hovering = false;
                this.startAutoSlide();
            }
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => new ImageSlider(".slider")
);