/* home.js — small helpers for the index/home page (and harmless elsewhere) */
(() => {
    "use strict";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function setCurrentYear() {
        // Optional: <span data-year></span>
        const y = document.querySelector("[data-year]");
        if (y) y.textContent = String(new Date().getFullYear());
    }

    function externalLinksNewTab() {
        // Make http(s) links open in a new tab unless explicitly set otherwise
        $$('a[href^="http://"], a[href^="https://"]').forEach((a) => {
            if (!a.hasAttribute("target")) a.setAttribute("target", "_blank");
            const rel = (a.getAttribute("rel") || "").toLowerCase();
            const needed = ["noopener", "noreferrer"];
            const parts = new Set(rel.split(/\s+/).filter(Boolean));
            needed.forEach((p) => parts.add(p));
            a.setAttribute("rel", Array.from(parts).join(" "));
        });
    }

    function enableSearchFilter() {
        // Looks for a search input and a list/grid of items to filter.
        // Supported patterns:
        //  - input#search + elements with [data-filter-text]
        //  - input[data-search] + elements with [data-filter-text]
        //  - input#search + .card / .item (fallback)
        const input =
            $("#search") ||
            $('[data-search]') ||
            $('input[type="search"]');

        if (!input) return;

        const clearBtn = $("[data-clear]");

        // Items to filter
        let items = $$("[data-filter-text]");
        if (items.length === 0) items = $$(".card, .item, li");

        if (items.length === 0) return;

        const normalize = (s) =>
            String(s || "")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        const applyFilter = () => {
            const q = normalize(input.value);
            items.forEach((el) => {
                const hay = normalize(el.getAttribute("data-filter-text") || el.textContent);
                const show = q === "" || hay.includes(q);
                el.style.display = show ? "" : "none";
                el.toggleAttribute("hidden", !show);
            });
        };

        input.addEventListener("input", applyFilter);
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                input.value = "";
                applyFilter();
                input.focus();
            });
        }

        // Press "/" to focus search (common UX)
        document.addEventListener("keydown", (e) => {
            if (e.key === "/" && document.activeElement !== input) {
                // Avoid interfering if user is typing in any input/textarea
                const tag = (document.activeElement && document.activeElement.tagName) || "";
                if (tag === "INPUT" || tag === "TEXTAREA") return;
                e.preventDefault();
                input.focus();
            }
            if (e.key === "Escape" && document.activeElement === input) {
                input.value = "";
                applyFilter();
                input.blur();
            }
        });

        // Run once on load in case input has prefilled value
        applyFilter();
    }

    function expandCollapseAllAccordions() {
        // Uses explicit data hooks only.
        // Content pages already use accordion.js with ".toggle-all"; binding here too
        // causes competing click handlers and inconsistent open/close behavior.
        // Optional buttons:
        //  - <button data-expand-all>Expand all</button>
        //  - <button data-collapse-all>Collapse all</button>

        const expandBtn = $("[data-expand-all]");
        const collapseBtn = $("[data-collapse-all]");
        const details = $$("details");

        const setAllDetails = (open) => {
            if (details.length === 0) return;
            details.forEach((d) => (d.open = open));
            if (expandBtn && !collapseBtn) {
                expandBtn.textContent = open ? "Collapse all" : "Expand all";
                expandBtn.setAttribute("aria-expanded", open ? "true" : "false");
            }
        };

        if (expandBtn) {
            expandBtn.addEventListener("click", () => {
                if (collapseBtn) {
                    setAllDetails(true);
                    return;
                }
                const allOpen = details.length > 0 && details.every((d) => d.open);
                setAllDetails(!allOpen);
            });
        }
        if (collapseBtn) collapseBtn.addEventListener("click", () => setAllDetails(false));
    }

    document.addEventListener("DOMContentLoaded", () => {
        setCurrentYear();
        externalLinksNewTab();
        enableSearchFilter();
        expandCollapseAllAccordions();
    });
})();
