// ======================================
// Historical date input
// ======================================

const TEMPLATES = [
    "0000",
    "ок. 0000",
    "0000-е",
    "нач. 0000-х",
    "сер. 0000-х",
    "кон. 0000-х",

    "вер., 0000",
    "вер., ок. 0000",
    "вер., 0000-е",
    "вер., нач. 0000-х",
    "вер., сер. 0000-х",
    "вер., кон. 0000-х"
];

// ======================================
// Public
// ======================================

export function setupHistoricalDateInput(input, options = {}) {
    if (!input) return null;

    input.setAttribute("autocomplete", "off");

    const wrapper = createWrapper(input);
    const suggestions = createSuggestions();

    wrapper.appendChild(suggestions);

    let currentTemplate = null;

    // ----------------------------------
    // Input
    // ----------------------------------

    input.addEventListener("input", () => {
        const value = input.value;

        const result = findTemplate(value);

        if (!result) {
            // Не позволяем уйти за пределы допустимых шаблонов.
            input.value = getValidPrefix(value);
        }

        currentTemplate = findTemplate(input.value);

        renderSuggestions(
            suggestions,
            input.value
        );

        if (options.onInput) {
            options.onInput(input.value);
        }
    });

    // ----------------------------------
    // Focus
    // ----------------------------------

    input.addEventListener("focus", () => {
        renderSuggestions(
            suggestions,
            input.value
        );
    });

    // ----------------------------------
    // Blur
    // ----------------------------------

    input.addEventListener("blur", () => {
        // Небольшая задержка позволяет
        // успеть обработать клик по варианту.
        setTimeout(() => {
            suggestions.classList.remove("is-open");
        }, 150);
    });

    // ----------------------------------
    // Keyboard
    // ----------------------------------

    input.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            suggestions.classList.remove("is-open");
        }
    });

    // ----------------------------------
    // Initial value
    // ----------------------------------

    currentTemplate = findTemplate(input.value);

    return {
        getValue() {
            return input.value.trim();
        },

        setValue(value) {
            input.value = value ?? "";
            currentTemplate = findTemplate(input.value);

            renderSuggestions(
                suggestions,
                input.value
            );
        },

        getTemplate() {
            return currentTemplate;
        },

        validate() {
            return isValidHistoricalDate(input.value);
        }
    };
}

// ======================================
// Wrapper
// ======================================

function createWrapper(input) {
    let wrapper = input.parentElement;

    if (
        wrapper &&
        wrapper.classList.contains("historical-date")
    ) {
        return wrapper;
    }

    wrapper = document.createElement("div");
    wrapper.className = "historical-date";

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    return wrapper;
}

// ======================================
// Suggestions
// ======================================

function createSuggestions() {
    const container = document.createElement("div");

    container.className = "historical-date__suggestions";

    return container;
}

function renderSuggestions(container, value) {
    const normalized = value.toLowerCase();

    const matches = TEMPLATES.filter(template => {
        return template
            .toLowerCase()
            .startsWith(normalized);
    });

    container.innerHTML = "";

    if (!matches.length) {
        container.classList.remove("is-open");
        return;
    }
  > {
        const item = document.createElement("button");

        item.type = "button";
        item.className = "historical-date__suggestion";

        item.textContent = buildPreview(
            template,
            value
        );

        item.addEventListener("mousedown", event => {
            event.preventDefault();
        });

        item.addEventListener("click", () => {
            const valueToSet = createInitialValue(
                template,
                value
            );

            const input = container
                .closest(".historical-date")
                ?.querySelector("input");

            if (!input) return;

            input.value = valueToSet;
            input.focus();

            container.classList.remove("is-open");

            input.dispatchEvent(
                new Event("input", {bubbles: true})
            );
        });

        container.appendChild(item);
    });

    container.classList.add("is-open");
}

// ======================================
// Template matching
// ======================================

function findTemplate(value) {
    if (!value) return null;

    return TEMPLATES.find(template => {
        return matchesTemplate(value, template);
    }) ?? null;
}

function matchesTemplate(value, template) {
    if (value.length > template.length) {
        return false;
    }

    for (let i = 0; i < value.length; i++) {
        const templateChar = template[i];
        const valueChar = value[i];

        if (templateChar === "0") {
            if (!/[0-9]/.test(valueChar)) {
                return false;
            }
        }
        else if (templateChar !== valueChar) {
            return false;
        }
    }

    return true;

    matches.forEach(template =
