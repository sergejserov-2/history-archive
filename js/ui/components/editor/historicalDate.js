import { createDropdown } from "../dropdown.js";

// ==========================================
// Historical date input
// ==========================================

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

const HELP_TEXT = `
Допустимые форматы:
0000
ок. 0000
0000-е
нач. 0000-х
сер. 0000-х
кон. 0000-х
вер., 0000
вер., ок. 0000
вер., 0000-е
вер., нач. 0000-х
вер., сер. 0000-х
вер., кон. 0000-х
`;

// ==========================================
// Public
// ==========================================

export function setupHistoricalDateInput(input, options = {}) {
    if(!input) return null;
    input.setAttribute("autocomplete", "off");
    ensureInputWrapper(input, options);
    const dropdown = createDropdown({className: "dropdown"});
    let currentTemplate = findTemplate(input.value);

    // ==========================================
    // Input
    // ==========================================

    input.addEventListener("input", () => {
        const value = input.value;
        const validValue = getValidPrefix(value);
        if(validValue !== value) input.value = validValue;
        currentTemplate = findTemplate(input.value);
        if(!input.value) dropdown.close();
        else renderDropdown(dropdown, input);
        options.onInput?.(input.value);
    });

    // ==========================================
    // Focus
    // ==========================================

    input.addEventListener("focus", () => {
        if(!input.value) {
            dropdown.close();
            return;
        }
        renderDropdown(dropdown, input);
    });

    // ==========================================
    // Blur
    // ==========================================

    input.addEventListener("blur", () => {
        setTimeout(() => dropdown.close(), 150);
    });

    // ==========================================
    // Keyboard
    // ==========================================

    input.addEventListener("keydown", event => {
        if(event.key === "Escape") dropdown.close();
    });

    // ==========================================
    // Initial value
    // ==========================================

    if(input.value) renderDropdown(dropdown, input);

    // ==========================================
    // Public API
    // ==========================================

    return {
        getValue() {
            return input.value.trim();
        },
        setValue(value) {
            input.value = value ?? "";
            currentTemplate = findTemplate(input.value);
            if(input.value) renderDropdown(dropdown, input);
            else dropdown.close();
        },
        getTemplate() {
            return currentTemplate;
        },
        validate() {
            const value = input.value.trim();
            if(!value) return true;
            return isValidHistoricalDate(value);
        }
    };
}

// ==========================================
// Input wrapper
// ==========================================

function ensureInputWrapper(input, options = {}) {
    let wrapper = input.parentElement;
    if(wrapper?.classList.contains("historical-date__input")) {
        wrapper.classList.add("historical-date");
        if(options.showHelp !== false && !wrapper.querySelector(".historical-date__help")) wrapper.appendChild(createHelpButton());
        return wrapper;
    }
    wrapper = document.createElement("div");
    wrapper.className = "historical-date__input historical-date";
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    if(options.showHelp !== false) wrapper.appendChild(createHelpButton());
    return wrapper;
}

// ==========================================
// Help button
// ==========================================

function createHelpButton() {
    const wrapper = document.createElement("span");
    wrapper.className = "historical-date__help-wrapper";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "historical-date__help";
    button.textContent = "?";

    const tooltip = document.createElement("div");
    tooltip.className = "historical-date__tooltip";
    tooltip.textContent = HELP_TEXT.trim();
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    let overButton = false;
    let overTooltip = false;
    let hideTimer = null;

    const showTooltip = () => {
        clearTimeout(hideTimer);
        const rect = button.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.bottom = `${window.innerHeight - rect.top + 6}px`;
        tooltip.hidden = false;
    };

    const scheduleHide = () => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if(!overButton && !overTooltip) tooltip.hidden = true;
        }, 50);
    };

    button.addEventListener("mouseenter", () => {
        overButton = true;
        showTooltip();
    });

    button.addEventListener("mouseleave", () => {
        overButton = false;
        scheduleHide();
    });

    tooltip.addEventListener("mouseenter", () => {
        overTooltip = true;
        clearTimeout(hideTimer);
    });

    tooltip.addEventListener("mouseleave", () => {
        overTooltip = false;
        scheduleHide();
    });

    wrapper.appendChild(button);
    return wrapper;
}

// ==========================================
// Render dropdown
// ==========================================

function renderDropdown(dropdown, input) {
    if(!dropdown || !input) return;

    const value = input.value;
    const normalized = value.toLowerCase();

    if(!normalized) {
        dropdown.close();
        return;
    }

    const matches = TEMPLATES.filter(template =>
        template.toLowerCase().startsWith(normalized) &&
        template.toLowerCase() !== normalized
    );

    if(!matches.length) {
        dropdown.close();
        return;
    }

    dropdown.setItems(
        matches.map(template => ({
            title: buildPreview(template, value),
            template
        })),
        {
            onSelect(item) {
                input.value = createInitialValue(item.template, value);
                input.focus();
                dropdown.close();
                input.dispatchEvent(new Event("input", {bubbles: true}));
            }
        }
    );

    dropdown.open(input);
}

// ==========================================
// Template matching
// ==========================================

function findTemplate(value) {
    if(!value) return null;
    return TEMPLATES.find(template => matchesTemplate(value, template)) ?? null;
}

function matchesTemplate(value, template) {
    if(value.length > template.length) return false;
    for(let i = 0; i < value.length; i++) {
        const templateChar = template[i];
        const valueChar = value[i];
        if(templateChar === "0") {
            if(!/[0-9]/.test(valueChar)) return false;
        }
        else if(templateChar !== valueChar) return false;
    }
    return true;
}

// ==========================================
// Valid prefix
// ==========================================

function getValidPrefix(value) {
    if(!value) return "";
    let result = "";
    for(let i = 0; i < value.length; i++) {
        const next = result + value[i];
        if(!TEMPLATES.some(template => matchesTemplate(next, template))) break;
        result = next;
    }
    return result;
}

// ==========================================
// Preview
// ==========================================

function buildPreview(template, value) {
    let result = "";
    for(let i = 0; i < template.length; i++) {
        const templateChar = template[i];
        result += templateChar === "0" ? value[i] ?? "0" : templateChar;
    }return result;
}

// ==========================================
// Create initial value
// ==========================================

function createInitialValue(template, value) {
    let result = "";
    let valueIndex = 0;
    for(let i = 0; i < template.length; i++) {
        const templateChar = template[i];
        if(templateChar === "0") {
            result += value[valueIndex] ?? "";
            valueIndex++;
        }
        else {
            result += templateChar;
        }
    }
    return result;
}

// ==========================================
// Validation
// ==========================================

export function isValidHistoricalDate(value) {
    const normalized = String(value ?? "").trim();
    if(!normalized) return true;
    return TEMPLATES.some(template =>
        normalized === template ||
        (normalized.length === template.length && matchesTemplate(normalized, template))
    );
}
