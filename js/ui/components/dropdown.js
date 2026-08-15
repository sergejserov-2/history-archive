// ==========================================
// DROPDOWN
// ==========================================

export function createDropdown(options={}){
    const{
        className="dropdown",
        maxHeight=240,
        matchAnchorWidth=true
    }=options;

    const container = document.createElement("div");
    container.className = className;
    container.style.position = "fixed";
    container.style.maxHeight = `${maxHeight}px`;
    document.body.appendChild(container);

    let anchor = null;
    let items = null;
    let itemsOptions = {};

    function position() {
        if(!anchor) return;
        const rect = anchor.getBoundingClientRect();
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.bottom + 4}px`;
        if(matchAnchorWidth)container.style.width=`${rect.width}px`;
        else container.style.width="";
    }

    function renderItems() {
        if(!items) return;
        container.innerHTML = "";

        items.forEach(item => {
            const element = document.createElement("button");
            element.type = "button";
            element.className = "dropdown__item";

            const title = document.createElement("span");
            title.className = "dropdown__item-title";
            title.textContent = item.title ?? item.label ?? "";
            element.appendChild(title);

            if(item.warning) {
                const warning = document.createElement("span");
                warning.className = "dropdown__item-warning";
                warning.textContent = "[!]";
                element.appendChild(warning);
            }

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

    function open(element = anchor) {
        if(element) anchor = element;
        if(!anchor) return;
        renderItems();
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
        if(container.classList.contains("is-open")) close();
        else open(element);
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

    function setItems(newItems, options = {}) {
        items = newItems ?? [];
        itemsOptions = options;
        renderItems();
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

    const handleWindowBlur = () => close();
    window.addEventListener("blur", handleWindowBlur);

    function destroy() {
        close();
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        document.removeEventListener("mousedown", handleOutsideClick);
        window.removeEventListener("blur", handleWindowBlur);
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
