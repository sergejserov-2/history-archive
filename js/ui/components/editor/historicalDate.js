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

с 1920-е
до 1950-е
с 1920-е до 1950-е

вер., с 1920-е
вер., до 1950-е
`;

// ======================================
// Public
// ======================================

export function setupHistoricalDateInput(input, options = {}) {

    if (!input) {
        return null;
    }

    input.setAttribute(
        "autocomplete",
        "off"
    );

    const wrapper =
        ensureInputWrapper(
            input,
            options
        );

    const dropdown =
        createDropdown();

    wrapper.appendChild(
        dropdown
    );

    let currentTemplate =
        findTemplate(
            input.value
        );


    // ==================================
    // Input
    // ==================================

    input.addEventListener(
        "input",
        () => {

            const value =
                input.value;

            /*
             * Разрешаем только те символы,
             * которые являются продолжением
             * хотя бы одного допустимого
             * шаблона.
             */
            const validValue =
                getValidPrefix(
                    value
                );

            if (
                validValue !== value
            ) {
                input.value =
                    validValue;
            }

            currentTemplate =
                findTemplate(
                    input.value
                );

            renderDropdown(
                dropdown,
                input.value
            );

            if (
                options.onInput
            ) {
                options.onInput(
                    input.value
                );
            }
        }
    );


    // ==================================
    // Focus
    // ==================================

    input.addEventListener(
        "focus",
        () => {

            /*
             * Пустое поле —
             * никаких подсказок.
             */
            if (!input.value) {
                closeDropdown(
                    dropdown
                );

                return;
            }

            renderDropdown(
                dropdown,
                input.value
            );
        }
    );


    // ==================================
    // Blur
    // ==================================

    input.addEventListener(
        "blur",
        () => {

            /*
             * Даём успеть обработать
             * клик по элементу dropdown.
             */
            setTimeout(
                () => {
                    closeDropdown(
                        dropdown
                    );
                },
                150
            );
        }
    );


    // ==================================
    // Keyboard
    // ==================================

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {
                closeDropdown(
                    dropdown
                );
            }
        }
    );


    // ==================================
    // Initial value
    // ==================================

    currentTemplate =
        findTemplate(
            input.value
        );

    if (input.value) {
        renderDropdown(
            dropdown,
            input.value
        );
    }


    // ==================================
    // Public API
    // ==================================

    return {

        getValue() {

            return input.value.trim();
        },


        setValue(value) {

            input.value =
                value ?? "";

            currentTemplate =
                findTemplate(
                    input.value
                );

            if (input.value) {

                renderDropdown(
                    dropdown,
                    input.value
                );

            }
            else {

                closeDropdown(
                    dropdown
                );
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

function ensureInputWrapper(
    input,
    options = {}
) {

    let wrapper =
        input.parentElement;


    /*
     * Если input уже находится
     * внутри нашего wrapper —
     * используем его.
     */
    if (
        wrapper &&
        wrapper.classList.contains(
            "historical-date"
        )
    ) {

        /*
         * Если help нужен, но его ещё нет —
         * добавляем.
         */
        if (
            options.showHelp !== false &&
            !wrapper.querySelector(
                ".historical-date__help"
            )
        ) {

            appendHelpButton(
                wrapper
            );
        }

        return wrapper;
    }


    /*
     * Создаём новый wrapper.
     */
    wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "historical-date";


    input.parentNode.insertBefore(
        wrapper,
        input
    );

    wrapper.appendChild(
        input
    );


    /*
     * Help добавляем только если
     * явно разрешено.
     *
     * По умолчанию true.
     */
    if (
        options.showHelp !== false
    ) {

        appendHelpButton(
            wrapper
        );
    }


    return wrapper;
}


// ======================================
// Help button
// ======================================

function appendHelpButton(
    wrapper
) {

    const button =
        createHelpButton();


    button.addEventListener(
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
        button
    );
}


function createHelpButton() {

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "historical-date__help";

    /*
     * Unicode-вопросик в кружке.
     */
    button.textContent =
        "ⓘ";

    button.setAttribute(
        "aria-label",
        "Допустимые форматы даты"
    );

    button.setAttribute(
        "title",
        "Допустимые форматы даты"
    );

    return button;
}


// ======================================
// Dropdown
// ======================================

function createDropdown() {

    const container =
        document.createElement(
            "div"
        );

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
        String(
            value ?? ""
        ).toLowerCase();


    /*
     * Пока ничего не введено —
     * dropdown закрыт.
     */
    if (!normalized) {

        closeDropdown(
            container
        );

        return;
    }


    const matches =
        TEMPLATES.filter(
            template => {

                return template
                    .toLowerCase()
                    .startsWith(
                        normalized
                    );
            }
        );


    container.innerHTML =
        "";


    if (!matches.length) {

        closeDropdown(
            container
        );

        return;
    }


    matches.forEach(
        template => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "historical-date__suggestion";


            item.textContent =
                buildPreview(
                    template,
                    value
                );


            /*
             * Не даём input потерять focus
             * до click.
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
                                ".historical-date"
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


            container.appendChild(
                item
            );
        }
    );


    container.classList.add(
        "is-open"
    );
}


// ======================================
// Close dropdown
// ======================================

function closeDropdown(
    container
) {

    container.classList.remove(
        "is-open"
    );

    container.innerHTML =
        "";
}


// ======================================
// Template matching
// ======================================

function findTemplate(
    value
) {

    if (!value) {
        return null;
    }


    /*
     * Сначала обычные шаблоны.
     */
    const template =
        TEMPLATES.find(
            item =>
                matchesTemplate(
                    value,
                    item
                )
        );


    if (template) {
        return template;
    }


    /*
     * Затем варианты с «с» / «до».
     */
    return findBoundaryTemplate(
        value
    );
}


// ======================================
// Boundary template matching
// ======================================

function findBoundaryTemplate(
    value
) {

    const normalized =
        value.trim();


    /*
     * с ...
     */
    if (
        normalized.startsWith(
            "с "
        )
    ) {

        const rest =
            normalized
                .slice(2)
                .trim();

        return findTemplate(
            rest
        );
    }


    /*
     * до ...
     */
    if (
        normalized.startsWith(
            "до "
        )
    ) {

        const rest =
            normalized
                .slice(3)
                .trim();

        return findTemplate(
            rest
        );
    }


    /*
     * вер., с ...
     */
    if (
        normalized.startsWith(
            "вер., с "
        )
    ) {

        const rest =
            normalized
                .slice(
                    "вер., с ".length
                )
                .trim();

        const template =
            findTemplate(
                rest
            );

        return template
            ? `вер., ${template}`
            : null;
    }


    /*
     * вер., до ...
     */
    if (
        normalized.startsWith(
            "вер., до "
        )
    ) {

        const rest =
            normalized
                .slice(
                    "вер., до ".length
                )
                .trim();

        const template =
            findTemplate(
                rest
            );

        return template
            ? `вер., ${template}`
            : null;
    }


    return null;
}


// ======================================
// Match raw template
// ======================================

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
        if (
            templateChar === "0"
        ) {

            if (
                !/[0-9]/.test(
                    valueChar
                )
            ) {

                return false;
            }

        }
        else if (
            templateChar !==
            valueChar
        ) {

            return false;
        }
    }


    return true;
}


// ======================================
// Valid prefix
// ======================================

function getValidPrefix(
    value
) {

    if (!value) {
        return "";
    }


    let result =
        "";


    for (
        let i = 0;
        i < value.length;
        i++
    ) {

        const next =
            result +
            value[i];


        const matches =
            isValidPrefix(
                next
            );


        if (!matches) {
            break;
        }


        result =
            next;
    }


    return result;
}


// ======================================
// Prefix validation
// ======================================

function isValidPrefix(
    value
) {

    if (!value) {
        return true;
    }


    /*
     * Обычные шаблоны.
     */
    const normalMatch =
        TEMPLATES.some(
            template =>
                matchesTemplate(
                    value,
                    template
                )
        );


    if (normalMatch) {
        return true;
    }


    /*
     * Границы периода.
     */
    return isBoundaryPrefix(
        value
    );
}


// ======================================
// Boundary prefix validation
// ======================================

function isBoundaryPrefix(
    value
) {

    const prefixes = [
        "с ",
        "до ",
        "вер., с ",
        "вер., до "
    ];


    /*
     * Сам префикс уже допустим.
     */
    for (
        const prefix of prefixes
    ) {

        if (
            prefix.startsWith(
                value
            )
        ) {
            return true;
        }

        if (
            value.startsWith(
                prefix
            )
        ) {

            const rest =
                value
                    .slice(
                        prefix.length
                    );


            /*
             * После префикса
             * проверяем обычный шаблон.
             */
            return TEMPLATES.some(
                template =>
                    matchesTemplate(
                        rest,
                        template
                    )
            );
        }
    }


    return false;
}


// ======================================
// Preview
// ======================================

function buildPreview(
    template,
    value
) {

    let result =
        "";


    for (
        let i = 0;
        i < template.length;
        i++
    ) {

        const templateChar =
            template[i];


        if (
            templateChar === "0"
        ) {

            result +=
                value[i] ??
                "0";

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

    /*
     * Если выбрали обычный шаблон —
     * просто подставляем уже введённые
     * цифры.
     */
    if (
        TEMPLATES.includes(
            template
        )
    ) {

        let result =
            "";

        let valueIndex =
            0;


        for (
            let i = 0;
            i < template.length;
            i++
        ) {

            const templateChar =
                template[i];


            if (
                templateChar === "0"
            ) {

                result +=
                    value[valueIndex] ??
                    "";

                valueIndex++;

            }
            else {

                result +=
                    templateChar;
            }
        }


        return result;
    }


    /*
     * Если это граница:
     *
     * с 0000
     * до 0000
     * вер., с 0000
     * вер., до 0000
     */
    const boundaryPrefixes = [
        "с ",
        "до ",
        "вер., с ",
        "вер., до "
    ];


    const prefix =
        boundaryPrefixes.find(
            item =>
                template.startsWith(
                    item
                )
        );


    if (!prefix) {
        return value;
    }


    const rawTemplate =
        template.slice(
            prefix.length
        );


    /*
     * Для «вер., с» / «вер., до»
     * rawTemplate уже будет:
     *
     * 0000
     * ок. 0000
     * и т.д.
     */
    let digits =
        extractDigits(
            value
        );


    /*
     * Если введён только префикс,
     * digits будет пустым.
     */
    let result =
        prefix;


    let digitIndex =
        0;


    for (
        let i = 0;
        i < rawTemplate.length;
        i++
    ) {

        const char =
            rawTemplate[i];


        if (
            char === "0"
        ) {

            result +=
                digits[digitIndex] ??
                "";

            digitIndex++;

        }
        else {

            result +=
                char;
        }
    }


    return result;
}


// ======================================
// Extract digits
// ======================================

function extractDigits(
    value
) {

    return String(
        value ?? ""
    ).match(
        /\d/g
    )?.join(
        ""
    ) ?? "";
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


    const normalized =
        value.trim();


    /*
     * Обычные шаблоны.
     */
    const normalValid =
        TEMPLATES.some(
            template => {

                if (
                    normalized.length !==
                    template.length
                ) {
                    return false;
                }

                return matchesTemplate(
                    normalized,
                    template
                );
            }
        );


    if (normalValid) {
        return true;
    }


    /*
     * Границы периода.
     */
    const boundaryPrefixes = [
        "с ",
        "до ",
        "вер., с ",
        "вер., до "
    ];


    for (
        const prefix of boundaryPrefixes
    ) {

        if (
            !normalized.startsWith(
                prefix
            )
        ) {
            continue;
        }


        const rest =
            normalized
                .slice(
                    prefix.length
                )
                .trim();


        if (
            TEMPLATES.some(
                template =>
                    rest.length ===
                        template.length &&
                    matchesTemplate(
                        rest,
                        template
                    )
            )
        ) {

            return true;
        }
    }


    return false;
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

    if (
        start &&
        end
    ) {

        return `${
            formatPeriodDate(
                start
            )
        } — ${
            formatPeriodDate(
                end
            )
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


    /*
     * Уже сохранённый вариант:
     *
     * вер., 0000
     */
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
            formatBoundaryDate(
                rest
            )
        }`;
    }


    /*
     * Обычная граница.
     */
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

function formatBoundaryDate(
    value
) {

    const date =
        value.trim();


    /*
     * 0000-е → 0000-х
     *
     * Только для отображения
     * границы периода.
     */
    if (
        /^\d{4}-е$/.test(
            date
        )
    ) {

        return date.replace(
            /-е$/,
            "-х"
        );
    }


    /*
     * вер., 0000-е → вер., 0000-х
     *
     * На случай, если значение
     * придёт сюда уже с вер.
     */
    if (
        /^вер\.,\s*\d{4}-е$/.test(
            date
        )
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

function formatPeriodDate(
    value
) {

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
