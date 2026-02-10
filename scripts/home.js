/* home.js - small helpers for index/home page (safe elsewhere). */
(() => {
    "use strict";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const normalize = (value) =>
        String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    function setCurrentYear() {
        const yearNode = $("[data-year]");
        if (yearNode) yearNode.textContent = String(new Date().getFullYear());
    }

    function externalLinksNewTab() {
        $$('a[href^="http://"], a[href^="https://"]').forEach((link) => {
            if (!link.hasAttribute("target")) link.setAttribute("target", "_blank");
            const rel = (link.getAttribute("rel") || "").toLowerCase();
            const needed = ["noopener", "noreferrer"];
            const parts = new Set(rel.split(/\s+/).filter(Boolean));
            needed.forEach((token) => parts.add(token));
            link.setAttribute("rel", Array.from(parts).join(" "));
        });
    }

    function levenshtein(a, b) {
        if (a === b) return 0;
        if (!a.length) return b.length;
        if (!b.length) return a.length;

        const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

        for (let i = 1; i <= a.length; i += 1) {
            for (let j = 1; j <= b.length; j += 1) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    }

    function isTokenMatch(token, indexedText, indexedWords) {
        if (indexedText.includes(token)) return true;
        if (token.length < 4) return false;
        return indexedWords.some((word) => {
            if (Math.abs(word.length - token.length) > 1) return false;
            return levenshtein(token, word) <= 1;
        });
    }

    function setCardVisibility(card, visible) {
        card.hidden = !visible;
        card.setAttribute("aria-hidden", visible ? "false" : "true");

        if (visible) {
            if (card.dataset.previousTabIndex) {
                card.setAttribute("tabindex", card.dataset.previousTabIndex);
                delete card.dataset.previousTabIndex;
            } else {
                card.removeAttribute("tabindex");
            }
            return;
        }

        if (card.hasAttribute("tabindex")) {
            card.dataset.previousTabIndex = card.getAttribute("tabindex") || "";
        }
        card.setAttribute("tabindex", "-1");
    }

    function enableSearchFilter() {
        const input = $("#search") || $("[data-search-input]");
        const cardRoot = $("[data-brief-list]");
        if (!input || !cardRoot) return;

        const cards = $$(".brief-card", cardRoot);
        if (!cards.length) return;

        const clearBtn = $("[data-clear]");
        const emptyState = $("[data-empty-state]");
        const resultsStatus = $("[data-results-status]");
        const chips = $$("[data-search-chip]");

        const searchIndex = cards.map((card) => {
            const combinedText = normalize(
                `${card.getAttribute("data-filter-text") || ""} ${card.textContent || ""}`
            );
            const indexedWords = Array.from(new Set(combinedText.split(" ").filter(Boolean)));
            return { card, combinedText, indexedWords };
        });

        const updateChipState = (queryTokens) => {
            chips.forEach((chip) => {
                const chipToken = normalize(chip.getAttribute("data-search-chip") || "");
                const pressed = chipToken !== "" && queryTokens.includes(chipToken);
                chip.setAttribute("aria-pressed", pressed ? "true" : "false");
            });
        };

        const applyFilter = () => {
            const query = normalize(input.value);
            const queryTokens = query.split(" ").filter(Boolean);
            let visibleCount = 0;

            searchIndex.forEach((item) => {
                const visible =
                    queryTokens.length === 0 ||
                    queryTokens.every((token) =>
                        isTokenMatch(token, item.combinedText, item.indexedWords)
                    );

                setCardVisibility(item.card, visible);
                if (visible) visibleCount += 1;
            });

            if (clearBtn) clearBtn.disabled = queryTokens.length === 0;
            updateChipState(queryTokens);

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
                emptyState.textContent =
                    visibleCount === 0
                        ? `No briefs matched "${input.value.trim()}". Try a broader term such as "skin", "sleep", or "wound".`
                        : "";
            }

            if (resultsStatus) {
                if (queryTokens.length === 0) {
                    resultsStatus.textContent = `Showing all ${cards.length} briefs.`;
                } else if (visibleCount === 0) {
                    resultsStatus.textContent = `No matches for "${input.value.trim()}".`;
                } else {
                    resultsStatus.textContent = `Showing ${visibleCount} of ${cards.length} briefs for "${input.value.trim()}".`;
                }
            }
        };

        input.addEventListener("input", applyFilter);

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                input.value = "";
                applyFilter();
                input.focus();
            });
        }

        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                const token = chip.getAttribute("data-search-chip") || "";
                const current = normalize(input.value);
                input.value = current === normalize(token) ? "" : token;
                applyFilter();
                input.focus();
            });
        });

        document.addEventListener("keydown", (event) => {
            const active = document.activeElement;
            const activeTag = active ? active.tagName : "";
            const isTypingTarget =
                activeTag === "INPUT" ||
                activeTag === "TEXTAREA" ||
                activeTag === "SELECT" ||
                (active && active.isContentEditable);

            if (event.key === "/" && !isTypingTarget) {
                event.preventDefault();
                input.focus();
            }

            if (event.key === "Escape" && active === input) {
                input.value = "";
                applyFilter();
                input.blur();
            }
        });

        applyFilter();
    }

    document.addEventListener("DOMContentLoaded", () => {
        setCurrentYear();
        externalLinksNewTab();
        enableSearchFilter();
    });
})();
