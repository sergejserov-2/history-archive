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
`;


// ======================================
// Public
// ======================================

export function setupHistoricalDateInput(
    input,
    options = {}
) {

    if (!input) {
        return null;
    }

    input.setAttribute(
        "autocomplete",
        "off"
    );

    // ----------------------------------
    // Wrapper
    // ----------------------------------

    const wrapper =
        ensureInputWrapper(
            input,
            options
        );


    // ----------------------------------
    // Dropdown
    // ----------------------------------

    const dropdown =
        createDropdown();

    /*
     * Dropdown находится в body,
     * поэтому его не обрезает modal
     * или другой родительский overflow.
     */
    document.body.appendChild(
        dropdown
    );


    // ----------------------------------
    // State
    // ----------------------------------

    let currentTemplate =
        findTemplate(
            input.value
        );


    // ==================================
    // Dropdown positioning
    // ==================================

    const repositionDropdown = () => {

        if (
            dropdown.classList.contains(
                "is-open"
            )
        ) {

            positionDropdown(
                dropdown,
                input
            );
        }
    };


    window.addEventListener(
        "scroll",
        repositionDropdown,
        true
    );

    window.addEventListener(
        "resize",
        repositionDropdown
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
             * хотя бы одного шаблона.
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


            /*
             * Пустое поле —
             * никакого dropdown.
             */
            if (!input.value) {

                closeDropdown(
                    dropdown
                );

            }
            else {

                renderDropdown(
                    dropdown,
                    input
                );
            }


            if(options.onInput) {

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
                input
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
             * Небольшая задержка позволяет
             * обработать клик по dropdown.
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


    if(input.value) {

        renderDropdown(
            dropdown,
            input
        );
    }


    // ==================================
    // Public API
    // ==================================

    return {

        // --------------------------------
        // Get value
        // --------------------------------

        getValue() {

            return input.value.trim();
        },


        // --------------------------------
        // Set value
        // --------------------------------

        setValue(value) {

            input.value =
                value ?? "";


            currentTemplate =
                findTemplate(
                    input.value
                );


            if(input.value) {

                renderDropdown(
                    dropdown,
                    input
                );

            }
            else {

                closeDropdown(
                    dropdown
                );
            }
        },


        // --------------------------------
        // Get template
        // --------------------------------

        getTemplate() {

            return currentTemplate;
        },


        // --------------------------------
        // Validate
        // --------------------------------

validate() {

    // ----------------------------------
    // Period
    // ----------------------------------

    if(mode === "period") {

        const start =
            dateStartEditor
                ? dateStartEditor.getValue()
                : (
                    dateStartInput
                        ?.value
                        .trim() || ""
                );

        const end =
            dateEndEditor
                ? dateEndEditor.getValue()
                : (
                    dateEndInput
                        ?.value
                        .trim() || ""
                );

        /*
         * В периоде обе границы могут быть
         * пустыми.
         *
         * Но если граница заполнена,
         * она ОБЯЗАНА полностью совпадать
         * с одним из исторических шаблонов.
         */

        if(start) {

            if(!isValidHistoricalDate(start)) {
                return false;
            }
        }

        if(end) {

            if(!isValidHistoricalDate(end)) {
                return false;
            }
        }

        return true;
    }

    // ----------------------------------
    // Single date
    // ----------------------------------

    if(!dateInput) {
        return true;
    }

    const value =
        dateEditor
            ? dateEditor.getValue()
            : dateInput.value.trim();

    /*
     * Обычная дата обязательна.
     */

    if(!value) {
        return false;
    }

    /*
     * Здесь тоже требуется полное
     * совпадение с одним шаблоном.
     */

    return isValidHistoricalDate(value);
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
     * в нашем wrapper — используем его.
     */
    if (
        wrapper &&
        wrapper.classList.contains(
            "historical-date__input"
        )
    ) {

        wrapper.classList.add(
            "historical-date"
        );

        /*
         * Если кнопка ещё не создана
         * и showHelp разрешён — создаём её.
         */
        if (
            options.showHelp !== false &&
            !wrapper.querySelector(
                ".historical-date__help"
            )
        ) {

            const helpButton =
                createHelpButton();


            helpButton.addEventListener(
                "click",
                () => {

                    alert(
                        HELP_TEXT.trim()
                    );
                }
            );


            wrapper.appendChild(
                helpButton
            );
        }


        return wrapper;
    }


    // ----------------------------------
    // Create wrapper
    // ----------------------------------

    wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "historical-date__input historical-date";


    input.parentNode.insertBefore(
        wrapper,
        input
    );


    wrapper.appendChild(
        input
    );


    // ----------------------------------
    // Help button
    // ----------------------------------

    if (
        options.showHelp !== false
    ) {

        const helpButton =
            createHelpButton();


        helpButton.addEventListener(
            "click",
            () => {

                alert(
                    HELP_TEXT.trim()
                );
            }
        );


        wrapper.appendChild(
            helpButton
        );
    }


    return wrapper;
}


// ======================================
// Help button
// ======================================

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
     * Unicode-вопрос в кружке.
     */
    button.textContent =
        "?";


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
// Position dropdown
// ======================================

function positionDropdown(
    container,
    input
) {

    if(!container || !input) {
        return;
    }


    const rect =
        input.getBoundingClientRect();


    container.style.left =
        `${rect.left}px`;


    container.style.top =
        `${rect.bottom + 4}px`;


    container.style.width =
        `${rect.width}px`;
}


// ======================================
// Render dropdown
// ======================================

function renderDropdown(
    container,
    input
) {

    if(!container || !input) {
        return;
    }


    const value =
        input.value;


    const normalized =
        value.toLowerCase();


    /*
     * Пока ничего не введено —
     * dropdown закрыт.
     */
    if(!normalized) {

        closeDropdown(
            container
        );

        return;
    }


    // ----------------------------------
    // Matching templates
    // ----------------------------------

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


    if(!matches.length) {

        closeDropdown(
            container
        );

        return;
    }


    // ----------------------------------
    // Items
    // ----------------------------------

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

                    input.value =
                        createInitialValue(
                            template,
                            value
                        );


                    input.focus();


                    closeDropdown(
                        container
                    );


                    /*
                     * Используем обычное событие input,
                     * чтобы обновить состояние редактора.
                     */
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


    // ----------------------------------
    // Open
    // ----------------------------------

    positionDropdown(
        container,
        input
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

    if(!container) {
        return;
    }


    container.classList.remove(
        "is-open"
    );


    container.innerHTML =
        "";


    container.style.left =
        "";


    container.style.top =
        "";


    container.style.width =
        "";
}


// ======================================
// Template matching
// ======================================

function findTemplate(
    value
) {

    if(!value) {
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


    for(
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

    if(!value) {
        return "";
    }


    let result =
        "";


    for(
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


        if(!matches) {
            break;
        }


        result =
            next;
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

    let result =
        "";


    for(
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

    let result =
        "";


    let valueIndex =
        0;


    for(
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

    if(!value) {
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
    // Both dates
    // ----------------------------------

    if(start && end) {

        return `${
            formatPeriodDate(start)
        } — ${
            formatPeriodDate(end)
        }`;
    }


    // ----------------------------------
    // Only start
    // ----------------------------------

    if(start) {

        return formatPeriodBoundary(
            start,
            "с"
        );
    }


    // ----------------------------------
    // Only end
    // ----------------------------------

    if(end) {

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
            formatBoundaryDate(
                rest
            )
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
