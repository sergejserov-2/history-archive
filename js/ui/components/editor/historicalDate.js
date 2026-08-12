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

    if (!input) {
        return null;
    }

    input.setAttribute("autocomplete", "off");

    const wrapper = ensureInputWrapper(input);
    const dropdown = createDropdown();

    wrapper.appendChild(dropdown);

    let currentTemplate = findTemplate(input.value);

    // ----------------------------------
    // Input
    // ----------------------------------

    input.addEventListener("input", () => {

        const value = input.value;

        /*
         * Разрешаем только те символы,
         * которые являются продолжением
         * хотя бы одного шаблона.
         */
        const validValue = getValidPrefix(value);

        if (validValue !== value) {
            input.value = validValue;
        }

        currentTemplate = findTemplate(input.value);

        renderDropdown(
            dropdown,
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

        /*
         * Пустое поле — никаких подсказок.
         */
        if (!input.value) {
            closeDropdown(dropdown);
            return;
        }

        renderDropdown(
            dropdown,
            input.value
        );
    });

    // ----------------------------------
    // Blur
    // ----------------------------------

    input.addEventListener("blur", () => {

        /*
         * Небольшая задержка позволяет
         * обработать клик по элементу dropdown.
         */
        setTimeout(() => {
            closeDropdown(dropdown);
        }, 150);
    });

    // ----------------------------------
    // Keyboard
    // ----------------------------------

    input.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeDropdown(dropdown);
        }
    });

    // ----------------------------------
    // Initial value
    // ----------------------------------

    currentTemplate = findTemplate(input.value);

    if (input.value) {
        renderDropdown(
            dropdown,
            input.value
        );
    }

    return {

        getValue() {
            return input.value.trim();
        },

        setValue(value) {

            input.value = value ?? "";

            currentTemplate = findTemplate(
                input.value
            );

            if (input.value) {
                renderDropdown(
                    dropdown,
                    input.value
                );
            }
            else {
                closeDropdown(dropdown);
            }
        },

        getTemplate() {
            return currentTemplate;
        },

        validate() {
            return isValidHistoricalDate(
                input.value
            );
        }
    };
}

// ======================================
// Input wrapper
// ======================================

function ensureInputWrapper(input) {

    let wrapper = input.parentElement;

    /*
     * Если input уже находится
     * в нашем wrapper — используем его.
     */
    if (
        wrapper &&
        wrapper.classList.contains(
            "historical-date__input"
        )
    ) {
        return wrapper;
    }

    wrapper = document.createElement("div");

    wrapper.className =
        "historical-date__input";

    input.parentNode.insertBefore(
        wrapper,
        input
    );

    wrapper.appendChild(input);

    /*
     * Help button
     */
    const helpButton =
        createHelpButton();

    helpButton.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            alert(
                HELP_TEXT.trim()
            );
        }
    );

    wrapper.appendChild(
        helpButton
    );

    return wrapper;
}

// ======================================
// Help button
// ======================================

function createHelpButton() {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "historical-date__help";

    button.textContent = "?";

    button.setAttribute(
        "aria-label",
        "Допустимые форматы даты"
    );

    return button;
}

// ======================================
// Dropdown
// ======================================

function createDropdown() {

    const container =
        document.createElement("div");

    container.className =
        "historical-date__suggestions";

    return container;
}

// ======================================
// Render dropdown
// ======================================

function renderDropdown(
    container,
    value
) {

    const normalized =
        value.toLowerCase();

    /*
     * Пока ничего не введено —
     * dropdown отсутствует.
     */
    if (!normalized) {
        closeDropdown(container);
        return;
    }

    const matches =
        TEMPLATES.filter(template => {

            return template
                .toLowerCase()
                .startsWith(normalized);
        });

    container.innerHTML = "";

    if (!matches.length) {
        closeDropdown(container);
        return;
    }

    matches.forEach(template => {

        const item =
            document.createElement("button");

        item.type = "button";

        item.className =
            "historical-date__suggestion";

        item.textContent =
            buildPreview(
                template,
                value
            );

        /*
         * Не даём input потерять focus
         * раньше клика.
         */
        item.addEventListener(
            "mousedown",
            event => {
                event.preventDefault();
            }
        );

        item.addEventListener(
            "click",
            () => {

                const input =
                    container
                        .closest(
                            ".historical-date__input"
                        )
                        ?.querySelector(
                            "input"
                        );

                if (!input) {
                    return;
                }

                input.value =
                    createInitialValue(
                        template,
                        value
                    );

                input.focus();

                closeDropdown(
                    container
                );

                input.dispatchEvent(
                    new Event(
                        "input",
                        {
                            bubbles: true
                        }
                    )
                );
            }
        );

        container.appendChild(item);
    });

    container.classList.add(
        "is-open"
    );
}

// ======================================
// Close dropdown
// ======================================

function closeDropdown(container) {

    container.classList.remove(
        "is-open"
    );

    container.innerHTML = "";
}

// ======================================
// Template matching
// ======================================

function findTemplate(value) {

    if (!value) {
        return null;
    }

    return TEMPLATES.find(
        template =>
            matchesTemplate(
                value,
                template
            )
    ) ?? null;
}

function matchesTemplate(
    value,
    template
) {

    if (
        value.length >
        template.length
    ) {
        return false;
    }

    for (
        let i = 0;
        i < value.length;
        i++
    ) {

        const templateChar =
            template[i];

        const valueChar =
            value[i];

        /*
         * 0 в шаблоне означает
         * любую цифру.
         */
        if (templateChar === "0") {

            if (
                !/[0-9]/.test(
                    valueChar
                )
            ) {
                return false;
            }

        }
        else if (
            templateChar !== valueChar
        ) {

            return false;
        }
    }

    return true;
}

// ======================================
// Valid prefix
// ======================================

function getValidPrefix(value) {

    if (!value) {
        return "";
    }

    let result = "";

    for (
        let i = 0;
        i < value.length;
        i++
    ) {

        const next =
            result + value[i];

        const matches =
            TEMPLATES.some(
                template =>
                    matchesTemplate(
                        next,
                        template
                    )
            );

        if (!matches) {
            break;
        }

        result = next;
    }

    return result;
}

// ======================================
// Preview
// ======================================

function buildPreview(
    template,
    value
) {

    let result = "";

    for (
        let i = 0;
        i < template.length;
        i++
    ) {

        const templateChar =
            template[i];

        if (templateChar === "0") {

            result +=
                value[i] ?? "0";

        }
        else {

            result +=
                templateChar;
        }
    }

    return result;
}

// ======================================
// Create initial value
// ======================================

function createInitialValue(
    template,
    value
) {

    let result = "";

    let valueIndex = 0;

    for (
        let i = 0;
        i < template.length;
        i++
    ) {

        const templateChar =
            template[i];

        if (templateChar === "0") {

            result +=
                value[valueIndex] ?? "";

            valueIndex++;

        }
        else {

            result +=
                templateChar;
        }
    }

    return result;
}

// ======================================
// Validation
// ======================================

export function isValidHistoricalDate(
    value
) {

    if (!value) {
        return false;
    }

    return TEMPLATES.some(
        template => {

            if (
                value.length !==
                template.length
            ) {
                return false;
            }

            return matchesTemplate(
                value,
                template
            );
        }
    );
}

// ======================================
// Format historical period
// ======================================

export function formatHistoricalPeriod(
    dateStart = "",
    dateEnd = ""
) {

    const start =
        String(
            dateStart ?? ""
        ).trim();

    const end =
        String(
            dateEnd ?? ""
        ).trim();

    // ----------------------------------
    // Обе даты
    // ----------------------------------

    if (start && end) {

        return `${
            formatPeriodDate(start)
        } — ${
            formatPeriodDate(end)
        }`;
    }

    // ----------------------------------
    // Только начало
    // ----------------------------------

    if (start) {

        return formatPeriodBoundary(
            start,
            "с"
        );
    }

    // ----------------------------------
    // Только конец
    // ----------------------------------

    if (end) {

        return formatPeriodBoundary(
            end,
            "до"
        );
    }

    return "";
}

// ======================================
// Boundary
// ======================================

function formatPeriodBoundary(
    value,
    prefix
) {

    const normalized =
        value.trim();

    if (
        normalized.startsWith(
            "вер.,"
        )
    ) {

        const rest =
            normalized
                .slice(
                    "вер.,".length
                )
                .trim();

        return `вер., ${prefix} ${
            formatBoundaryDate(rest)
        }`;
    }

    return `${
        prefix
    } ${
        formatBoundaryDate(
            normalized
        )
    }`;
}

// ======================================
// Boundary date
// ======================================

function formatBoundaryDate(value) {

    const date =
        value.trim();

    /*
     * 0000-е → 0000-х
     *
     * Только для отображения
     * границы периода.
     */
    if (
        /^\d{4}-е$/.test(date)
    ) {

        return date.replace(
            /-е$/,
            "-х"
        );
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

    return [
        ...TEMPLATES
    ];
}
