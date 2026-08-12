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

Для периода можно использовать «с» и «до».
Например:

с 1920-х
до 1950-х
с 1920-х до 1950-х
вер., с 1920-х
вер., до 1950-х
`;

// ======================================
// Public
// ======================================

export function setupHistoricalDateInput(input, options = {}) {

    if(!input) {
        return null;
    }

    input.setAttribute("autocomplete", "off");

    const datalist = createDatalist(input);

    let currentTemplate = findTemplate(input.value);

    // ----------------------------------
    // Input
    // ----------------------------------

    input.addEventListener("input", () => {

        const value = input.value;

        /*
         * Пока ничего не введено —
         * никаких подсказок.
         */
        if(!value) {
            input.removeAttribute("list");
        }
        else {
            input.setAttribute("list", datalist.id);
        }

        /*
         * Не позволяем вводить символ,
         * который не является допустимым
         * продолжением одного из шаблонов.
         */
        const validValue = getValidPrefix(value);

        if(validValue !== value) {
            input.value = validValue;
        }

        currentTemplate = findTemplate(input.value);

        if(options.onInput) {
            options.onInput(input.value);
        }
    });

    // ----------------------------------
    // Focus
    // ----------------------------------

    input.addEventListener("focus", () => {

        /*
         * Пустое поле — без выпадашки.
         */
        if(!input.value) {
            input.removeAttribute("list");
        }
        else {
            input.setAttribute("list", datalist.id);
        }
    });

    // ----------------------------------
    // Help
    // ----------------------------------

    const helpButton = createHelpButton();

    helpButton.addEventListener("click", () => {
        alert(HELP_TEXT.trim());
    });

    const wrapper = input.parentElement;

    if(wrapper) {
        wrapper.classList.add("historical-date");

        /*
         * (?) располагается справа сверху
         * относительно поля.
         */
        wrapper.appendChild(helpButton);
    }

    // ----------------------------------
    // Initial value
    // ----------------------------------

    currentTemplate = findTemplate(input.value);

    if(input.value) {
        input.setAttribute("list", datalist.id);
    }

    return {

        getValue() {
            return input.value.trim();
        },

        setValue(value) {

            input.value = value ?? "";

            currentTemplate = findTemplate(input.value);

            if(input.value) {
                input.setAttribute("list", datalist.id);
            }
            else {
                input.removeAttribute("list");
            }
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
// Datalist
// ======================================

function createDatalist(input) {

    const datalist = document.createElement("datalist");

    /*
     * Уникальный id, чтобы несколько
     * редакторов на странице не конфликтовали.
     */
    datalist.id =
        `historicalDateTemplates_${Math.random()
            .toString(36)
            .slice(2)}`;

    TEMPLATES.forEach(template => {

        const option = document.createElement("option");

        option.value = template;

        datalist.appendChild(option);
    });

    input.parentNode.appendChild(datalist);

    return datalist;
}

// ======================================
// Help button
// ======================================

function createHelpButton() {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "historical-date__help";
    button.textContent = "?";

    return button;
}

// ======================================
// Template matching
// ======================================

function findTemplate(value) {

    if(!value) {
        return null;
    }

    return TEMPLATES.find(template => {
        return matchesTemplate(value, template);
    }) ?? null;
}

function matchesTemplate(value, template) {

    if(value.length > template.length) {
        return false;
    }

    for(let i = 0; i < value.length; i++) {

        const templateChar = template[i];
        const valueChar = value[i];

        if(templateChar === "0") {

            if(!/[0-9]/.test(valueChar)) {
                return false;
            }

        }
        else if(templateChar !== valueChar) {
            return false;
        }
    }

    return true;
}

// ======================================
// Valid prefix
// ======================================

function getValidPrefix(value) {

    if(!value) {
        return "";
    }

    let result = "";

    for(let i = 0; i < value.length; i++) {

        const next = result + value[i];

        const matches = TEMPLATES.some(template => {
            return matchesTemplate(next, template);
        });

        if(!matches) {
            break;
        }

        result = next;
    }

    return result;
}

// ======================================
// Validation
// ======================================

export function isValidHistoricalDate(value) {

    if(!value) {
        return false;
    }

    return TEMPLATES.some(template => {

        if(value.length !== template.length) {
            return false;
        }

        return matchesTemplate(value, template);
    });
}

// ======================================
// Format historical period
// ======================================

export function formatHistoricalPeriod(
    dateStart = "",
    dateEnd = ""
) {

    const start = String(dateStart ?? "").trim();
    const end = String(dateEnd ?? "").trim();

    // Обе даты
    if(start && end) {
        return `${formatPeriodDate(start)} — ${formatPeriodDate(end)}`;
    }

    // Только начало
    if(start) {
        return formatPeriodBoundary(start, "с");
    }

    // Только конец
    if(end) {
        return formatPeriodBoundary(end, "до");
    }

    return "";
}

// ======================================
// Boundary
// ======================================

function formatPeriodBoundary(value, prefix) {

    const normalized = value.trim();

    if(normalized.startsWith("вер.,")) {

        const rest = normalized
            .slice("вер.,".length)
            .trim();

        return `вер., ${prefix} ${formatBoundaryDate(rest)}`;
    }

    return `${prefix} ${formatBoundaryDate(normalized)}`;
}

// ======================================
// Boundary date
// ======================================

function formatBoundaryDate(value) {

    const date = value.trim();

    /*
     * 0000-е → 0000-х
     *
     * Только для отображения границы периода.
     */
    if(/^\d{4}-е$/.test(date)) {
        return date.replace(/-е$/, "-х");
    }

    return date;
}

// ======================================
// Normal period date
// ======================================

function formatPeriodDate(value) {
    return value.trim();
}

// ======================================
// Templates
// ======================================

export function getHistoricalDateTemplates() {
    return [...TEMPLATES];
}
