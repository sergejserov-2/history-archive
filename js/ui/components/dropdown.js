// ==========================================
// DROPDOWN
// ==========================================

export function createDropdown(options = {}) {
    const {
        className = "dropdown",
        maxHeight = 240
    } = options;

    const container = document.createElement("div");
    container.className = className;
    container.style.position = "fixed";
    container.style.maxHeight = `${maxHeight}px`;
    document.body.appendChild(container);

    let anchor = null;
    let items = null;
    let itemsOptions = {};

    // ==========================================
    // Position
    // ==========================================

    function position() {
        if(!anchor) return;

        const rect = anchor.getBoundingClientRect();

        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.bottom + 4}px`;
        container.style.width = `${rect.width}px`;
    }

    // ==========================================
    // Render items
    // ==========================================

    function renderItems() {
        if(!items) return;

        container.innerHTML = "";

        items.forEach(item => {
            const element = document.createElement("button");

            element.type = "button";
            element.className = "dropdown__item";
            element.textContent = item.title ?? item.label ?? "";

            if(item.disabled) {
                element.disabled = true;
                element.classList.add("dropdown__item--disabled");
                container.appendChild(element);
                return;
            }

            element.addEventListener("mousedown", event => {
                event.preventDefault();
            });

            element.addEventListener("click", () => {
                itemsOptions.onSelect?.(item);
            });

            container.appendChild(element);
        });
    }

    // ==========================================
    // Open
    // ==========================================

    function open(element = anchor) {
        if(element) anchor = element;
        if(!anchor) return;

        renderItems();
        position();
        container.classList.add("is-open");
    }

    // ==========================================
    // Close
    // ==========================================

    function close() {
        container.classList.remove("is-open");
        container.innerHTML = "";

        container.style.left = "";
        container.style.top = "";
        container.style.width = "";

        anchor = null;
    }

    // ==========================================
    // Toggle
    // ==========================================

    function toggle(element = anchor) {
        if(container.classList.contains("is-open")) {
            close();
        }
        else {
            open(element);
        }
    }

    // ==========================================
    // Content
    // ==========================================

    function setContent(content) {
        container.innerHTML = "";

        if(typeof content === "string") {
            container.innerHTML = content;
        }
        else if(content instanceof Node) {
            container.appendChild(content);
        }
    }

    function append(element) {
        if(element) {
            container.appendChild(element);
        }
    }

    // ==========================================
    // Items
    // ==========================================

    function setItems(newItems, options = {}) {
        items = newItems ?? [];
        itemsOptions = options;
        renderItems();
    }

    // ==========================================
    // State
    // ==========================================

    function isOpen() {
        return container.classList.contains("is-open");
    }

    // ==========================================
    // Reposition
    // ==========================================

    const reposition = () => {
        if(isOpen()) {
            position();
        }
    };

    window.addEventListener(
        "scroll",
        reposition,
        true
    );

    window.addEventListener(
        "resize",
        reposition
    );

    // ==========================================
    // Outside click
    // ==========================================

    const handleOutsideClick = event => {
        if(!isOpen()) return;

        if(
            anchor?.contains(event.target) ||
            container.contains(event.target)
        ) {
            return;
        }

        close();
    };

    document.addEventListener(
        "mousedown",
        handleOutsideClick
    );
    
    // ==========================================
    // Window blur
    // ==========================================
    const handleWindowBlur = () => {
        close();
    };
    
    window.addEventListener(
        "blur",
        handleWindowBlur
    );
    // ==========================================
    // Destroy
    // ==========================================

function destroy() {
    close();

    window.removeEventListener(
        "scroll",
        reposition,
        true
    );

    window.removeEventListener(
        "resize",
        reposition
    );

    document.removeEventListener(
        "mousedown",
        handleOutsideClick
    );

    window.removeEventListener(
        "blur",
        handleWindowBlur
    );

    container.remove();
}

    // ==========================================
    // Public API
    // ==========================================

    return {
        element: container,
        open,
        close,
        toggle,
        position,
        setContent,
        setItems,
        append,
        isOpen,
        destroy
    };
}
