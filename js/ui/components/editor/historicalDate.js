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
    const wrapper = ensureInputWrapper(input, options);
    const dropdown = createDropdown();
    document.body.appendChild(dropdown);
    let currentTemplate = findTemplate(input.value);
    const repositionDropdown = () => {
        if(dropdown.classList.contains("is-open")) {
            positionDropdown(dropdown, input);
        }
    };
    window.addEventListener("scroll", repositionDropdown, true);
    window.addEventListener("resize", repositionDropdown);

    // ==================================
    // Input
    // ==================================
    input.addEventListener("input", () => {
        const value = input.value;
        const validValue = getValidPrefix(value);
        if(validValue !== value) input.value = validValue;
        currentTemplate = findTemplate(input.value);
        if(!input.value) closeDropdown(dropdown);
        else renderDropdown(dropdown, input);
        options.onInput?.(input.value);
    });

    // ==================================
    // Focus
    // ==================================
    input.addEventListener("focus", () => {
        if(!input.value) {
            closeDropdown(dropdown);
            return;
        }
        renderDropdown(dropdown, input);
    });

    // ==================================
    // Blur
    // ==================================
    input.addEventListener("blur", () => {
        setTimeout(() => closeDropdown(dropdown), 150);
    });

    // ==================================
    // Keyboard
    // ==================================
    input.addEventListener("keydown", event => {
        if(event.key === "Escape") closeDropdown(dropdown);
    });

    // ==================================
    // Initial value
    // ==================================
    currentTemplate = findTemplate(input.value);
    if(input.value) renderDropdown(dropdown, input);

    // ==================================
    // Public API
    // ==================================
    return {
        getValue() {
            return input.value.trim();
        },
        setValue(value) {
            input.value = value ?? "";
            currentTemplate = findTemplate(input.value);
            if(input.value) renderDropdown(dropdown, input);
            else closeDropdown(dropdown);
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
    if(wrapper && wrapper.classList.contains("historical-date__input")) {
        wrapper.classList.add("historical-date");
        if(options.showHelp !== false && !wrapper.querySelector(".historical-date__help")) {
            wrapper.appendChild(createHelpButton());
        }
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
    const button = document.createElement("button");
    button.type = "button";
    button.className = "historical-date__help";
    button.textContent = "?";
    button.setAttribute("aria-label", "Допустимые форматы даты");
    button.setAttribute("title", "Допустимые форматы даты");

    const tooltip = document.createElement("div");
    tooltip.className = "historical-date__tooltip";
    tooltip.textContent = HELP_TEXT.trim();
    tooltip.hidden = true;

    document.body.appendChild(tooltip);

    const showTooltip = () => {
        const rect = button.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 6}px`;
        tooltip.hidden = false;
    };

    const hideTooltip = () => {
        tooltip.hidden = true;
    };

    button.addEventListener("mouseenter", showTooltip);
    button.addEventListener("mouseleave", hideTooltip);

    return button;
}

// ==========================================
// Dropdown
// ==========================================
function createDropdown() {
    const container = document.createElement("div");
    container.className = "historical-date__suggestions";
    return container;
}

// ==========================================
// Position dropdown
// ==========================================
function positionDropdown(container, input) {
    if(!container || !input) return;
    const rect = input.getBoundingClientRect();
    container.style.left = `${rect.left}px`;
    container.style.top = `${rect.bottom + 4}px`;
    container.style.width = `${rect.width}px`;
}

// ==========================================
// Render dropdown
// ==========================================
function renderDropdown(container, input) {
    if(!container || !input) return;
    const value = input.value;
    const normalized = value.toLowerCase();
    if(!normalized) {
        closeDropdown(container);
        return;
    }
    const matches = TEMPLATES.filter(
        template =>
            template.toLowerCase().startsWith(normalized) &&
            template.toLowerCase() !== normalized
    );
    container.innerHTML = "";
    if(!matches.length) {
        closeDropdown(container);
        return;
    }
    matches.forEach(template => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "historical-date__suggestion";
        item.textContent = buildPreview(template, value);
        item.addEventListener("mousedown", event => event.preventDefault());
        item.addEventListener("click", () => {
            input.value = createInitialValue(template, value);
            input.focus();
            closeDropdown(container);
            input.dispatchEvent(new Event("input", {bubbles: true}));
        });
        container.appendChild(item);
    });
    positionDropdown(container, input);
    container.classList.add("is-open");
}

// ==========================================
// Close dropdown
// ==========================================
function closeDropdown(container) {
    if(!container) return;
    container.classList.remove("is-open");
    container.innerHTML = "";
    container.style.left = "";
    container.style.top = "";
    container.style.width = "";
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
        else if(templateChar !== valueChar) {
            return false;
        }
    }
    return true;
}

// ==========================================
// Valid prefix
// ==========================================
function getValidPrefix(value) {
    if(!value)
        return "";
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
    }
    return result;
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
    return TEMPLATES.some(template => normalized === template || (
        normalized.length === template.length &&
        matchesTemplate(normalized, template)
    ));
}
