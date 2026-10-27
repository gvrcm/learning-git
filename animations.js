(function () {
    if (typeof gsap === "undefined") {
        document.querySelectorAll(".replay").forEach(function (btn) {
            btn.disabled = true;
            btn.textContent = "Animation library did not load";
        });
        return;
    }

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timelines = new Map();
    var contexts = new Map();

    function draw(el, duration) {
        if (!el || typeof el.getTotalLength !== "function") {
            return gsap.to({}, { duration: duration || 0.8 });
        }
        var len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
        return gsap.to(el, { strokeDashoffset: 0, duration: duration || 0.9, ease: "power2.inOut" });
    }

    var builders = {
        repository: function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(q(".folder"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
                .from(q(".file"), { scaleX: 0, transformOrigin: "left center", stagger: 0.12, duration: 0.35 }, "-=0.2")
                .fromTo(q(".git-badge"), { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" })
                .add(draw(q(".link-line")[0], 0.7))
                .fromTo(q(".host"), { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 }, "-=0.2");
            return tl;
        },

        clone: function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
            tl.from(q(".origin-box"), { opacity: 0, duration: 0.3 })
                .from(q(".oc"), { scale: 0, transformOrigin: "center", stagger: 0.1, duration: 0.3 })
                .to(q(".clone-label"), { opacity: 0, duration: 0.2 })
                .to(q(".c1"), { x: -322, duration: 0.8 }, "pack")
                .to(q(".c2"), { x: -322, duration: 0.8 }, "pack+=0.12")
                .to(q(".c3"), { x: -322, duration: 0.8 }, "pack+=0.24");
            return tl;
        },

        branch: function (q) {
            var tl = gsap.timeline();
            gsap.set(q(".feat-line, .fc, .feat-label"), { opacity: 0 });
            tl.from(q(".main-line"), { opacity: 0, duration: 0.2 })
                .from(q(".mc"), { scale: 0, transformOrigin: "center", stagger: 0.15, duration: 0.3, ease: "back.out(1.6)" })
                .add(function () {
                    gsap.set(q(".feat-line"), { opacity: 1 });
                })
                .add(draw(q(".feat-line")[0], 0.85))
                .fromTo(q(".fc"), { scale: 0, opacity: 1, transformOrigin: "center" }, { scale: 1, stagger: 0.16, duration: 0.32, ease: "back.out(1.7)" })
                .fromTo(q(".feat-label"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, "-=0.2");
            return tl;
        },

        commit: function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
            gsap.set(q(".snapshot, .msg"), { opacity: 0, scale: 0.6, transformOrigin: "center" });
            tl.from(q(".file"), { x: -20, opacity: 0, stagger: 0.1, duration: 0.35, ease: "power2.out" })
                .to(q(".files"), { x: 140, scale: 0.2, opacity: 0, transformOrigin: "right center", duration: 0.7 })
                .to(q(".snapshot"), { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.7)" }, "-=0.25")
                .to(q(".msg"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" });
            return tl;
        },

        "push-pull": function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
            gsap.set(q(".pushed, .remote-new, .pulled, .push-tag, .pull-tag"), { opacity: 0 });
            tl.from(q(".local-new"), { scale: 0, transformOrigin: "center", duration: 0.35, ease: "back.out(1.7)" })
                .to(q(".push-tag"), { opacity: 1, duration: 0.2 })
                .fromTo(q(".pushed"), { opacity: 1, y: -132 }, { y: 0, duration: 0.7 })
                .fromTo(q(".remote-new"), { opacity: 1, scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(1.7)" })
                .to(q(".pull-tag"), { opacity: 1, duration: 0.2 })
                .fromTo(q(".pulled"), { opacity: 1, y: 132 }, { y: 0, duration: 0.7 });
            return tl;
        },

        diff: function (q) {
            var tl = gsap.timeline();
            tl.fromTo(q(".minus"), { opacity: 0 }, { opacity: 0.95, duration: 0.45 })
                .fromTo(q(".plus"), { opacity: 0 }, { opacity: 0.95, duration: 0.45 }, "-=0.15")
                .fromTo(q(".old-line"), { x: 0 }, { x: -4, duration: 0.2, yoyo: true, repeat: 1 })
                .fromTo(q(".new-line"), { x: 0 }, { x: 4, duration: 0.2, yoyo: true, repeat: 1 }, "<");
            return tl;
        },

        merge: function (q) {
            var tl = gsap.timeline();
            gsap.set(q(".feat-line, .fc, .merge-node, .merge-label"), { opacity: 0 });
            tl.from(q(".mc"), { scale: 0, transformOrigin: "center", duration: 0.3 })
                .add(function () { gsap.set(q(".feat-line"), { opacity: 1 }); })
                .add(draw(q(".feat-line")[0], 1.1))
                .fromTo(q(".fc"), { opacity: 1, scale: 0, transformOrigin: "center" }, { scale: 1, stagger: 0.15, duration: 0.3, ease: "back.out(1.6)" }, "-=0.7")
                .fromTo(q(".merge-node"), { opacity: 1, scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" })
                .fromTo(q(".merge-label"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 });
            return tl;
        },

        rebase: function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
            gsap.set(q(".new-main"), { scale: 0, transformOrigin: "center" });
            tl.to(q(".caption"), { opacity: 1, duration: 0.2 })
                .to(q(".new-main"), { scale: 1, duration: 0.35, ease: "back.out(1.6)" })
                .to(q(".old-path"), { opacity: 0.25, duration: 0.3 })
                .to(q(".r1"), { x: 30, y: 90, duration: 0.7 }, "move")
                .to(q(".r2"), { x: 50, y: 90, duration: 0.7 }, "move+=0.08");
            return tl;
        },

        "merge-conflict": function (q) {
            var tl = gsap.timeline();
            gsap.set(q(".burst, .result"), { opacity: 0, scale: 0.6, transformOrigin: "center" });
            tl.from(q(".left-val"), { x: -20, opacity: 0, duration: 0.4 })
                .from(q(".right-val"), { x: 20, opacity: 0, duration: 0.4 }, "<")
                .to(q(".left-val"), { x: 90, duration: 0.45 }, "hit")
                .to(q(".right-val"), { x: -90, duration: 0.45 }, "hit")
                .to(q(".burst"), { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, "-=0.05")
                .to(q(".burst"), { opacity: 0, scale: 1.4, duration: 0.35 })
                .to(q(".result"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" });
            return tl;
        },

        "pull-request": function (q) {
            var tl = gsap.timeline();
            gsap.set(q(".pr-card, .merged"), { opacity: 0, y: 16 });
            tl.add(draw(q(".pr-branch")[0], 0.8))
                .to(q(".pr-card"), { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
                .to(q(".status"), { duration: 0.15, onStart: function () {
                    var el = q(".status")[0];
                    if (el) el.textContent = "review approved";
                }})
                .to(q(".a1, .a2"), { scale: 1.15, yoyo: true, repeat: 1, duration: 0.2, stagger: 0.1 })
                .to(q(".merge-btn"), { fill: "#c47a12", duration: 0.3 })
                .to(q(".merged"), { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" });
            return tl;
        },

        issue: function (q) {
            var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
            var meta = q(".ticket-meta")[0];
            var pr = q(".ticket-pr")[0];
            tl.from(q(".ticket"), { y: -40, opacity: 0, duration: 0.5, ease: "back.out(1.5)" })
                .to(q(".ticket"), { x: 188, duration: 0.7 })
                .add(function () { if (meta) meta.textContent = "in progress"; })
                .to(q(".ticket"), { x: 376, duration: 0.7 })
                .add(function () {
                    if (meta) meta.textContent = "closed";
                    if (pr) pr.textContent = "closes via PR #42";
                });
            return tl;
        }
    };

    function play(scene) {
        var name = scene.getAttribute("data-scene");
        var build = builders[name];
        if (!build) return;

        var prevCtx = contexts.get(scene);
        if (prevCtx) prevCtx.revert();
        else if (timelines.get(scene)) timelines.get(scene).kill();

        if (name === "pull-request") {
            var status = scene.querySelector(".status");
            if (status) status.textContent = "waiting for review";
        }
        if (name === "issue") {
            var meta = scene.querySelector(".ticket-meta");
            var pr = scene.querySelector(".ticket-pr");
            if (meta) meta.textContent = "bug";
            if (pr) pr.textContent = "";
        }

        var ctx = gsap.context(function () {
            var q = gsap.utils.selector(scene);
            var tl = build(q);
            if (reduce) tl.progress(1);
            timelines.set(scene, tl);
        }, scene);
        contexts.set(scene, ctx);
    }

    var scenes = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));

    scenes.forEach(function (scene) {
        var button = scene.parentElement.querySelector(".replay");
        if (button) {
            button.addEventListener("click", function () {
                play(scene);
            });
        }
    });

    if ("IntersectionObserver" in window) {
        var seen = new WeakSet();
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !seen.has(entry.target)) {
                    seen.add(entry.target);
                    play(entry.target);
                }
            });
        }, { threshold: 0.45 });
        scenes.forEach(function (scene) { io.observe(scene); });
    } else {
        scenes.forEach(play);
    }

    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
    var articles = links.map(function (link) {
        return document.querySelector(link.getAttribute("href"));
    });

    if ("IntersectionObserver" in window) {
        var navIo = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.id;
                links.forEach(function (link) {
                    if (link.getAttribute("href") === "#" + id) {
                        link.setAttribute("aria-current", "true");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, { rootMargin: "-40% 0px -50% 0px" });
        articles.forEach(function (article) {
            if (article) navIo.observe(article);
        });
    }
})();
