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

    function position() {
        if(!anchor) return;
        const rect = anchor.getBoundingClientRect();
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.bottom + 4}px`;
        container.style.width = `${rect.width}px`;
    }

    function open(element = anchor) {
        if(element) anchor = element;
        if(!anchor) return;
        position();
        container.classList.add("is-open");
    }

    function close() {
        container.classList.remove("is-open");
        container.innerHTML = "";
        container.style.left = "";
        container.style.top = "";
        container.style.width = "";
        anchor = null;
    }

    function toggle(element = anchor) {
        container.classList.contains("is-open")
            ? close()
            : open(element);
    }

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
        if(element) container.appendChild(element);
    }

    function setItems(items, options = {}) {
        const {onSelect} = options;
        container.innerHTML = "";

        items.forEach(item => {
            const element = document.createElement("button");
            const disabled = item.disabled === true;

            element.type = "button";
            element.className = "dropdown__item";
            element.textContent = item.title ?? item.label ?? "";

            if(disabled) {
                element.disabled = true;
                element.classList.add("dropdown__item--disabled");
            }
            else {
                element.addEventListener("mousedown", event => {
                    event.preventDefault();
                });
                element.addEventListener("click", () => {
                    onSelect?.(item);
                });
            }

            container.appendChild(element);
        });
    }

    function isOpen() {
        return container.classList.contains("is-open");
    }

    const reposition = () => {
        if(isOpen()) position();
    };

    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    const handleOutsideClick = event => {
        if(!isOpen()) return;
        if(anchor?.contains(event.target) || container.contains(event.target)) return;
        close();
    };

    document.addEventListener("mousedown", handleOutsideClick);

    function destroy() {
        close();
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        document.removeEventListener("mousedown", handleOutsideClick);
        container.remove();
    }

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
