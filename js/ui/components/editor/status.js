const STATUS_DEFINITIONS = {
    lost: {
        label: "Утрачено",
        className: "status-badge--lost"
    },
    attention: {
        label: "Требует внимания",
        className: "status-badge--attention"
    },
    deteriorating: {
        label: "Разрушается",
        className: "status-badge--deteriorating"
    }
};

export function getObjectStatus(object) {
    if (!object) {
        return null;
    }
    if (object.status !== undefined && object.status !== null) {
        return STATUS_DEFINITIONS[object.status]
            ? object.status
            : null;
    }
    if (object.lost === true) {
        return "lost";
    }
    return null;
}

export function getStatusDefinition(status) {
    return STATUS_DEFINITIONS[status] || null;
}

export function renderStatusBadge(status) {
    const definition = getStatusDefinition(status);
    if (!definition) {
        return null;
    }
    const badge = document.createElement("span");
    badge.className = `status-badge ${definition.className}`;
    badge.textContent = definition.label;
    return badge;
}

export function renderStatusBadgeHTML(status) {
    const definition = getStatusDefinition(status);
    if (!definition) {
        return "";
    }
    return `
        <span class="status-badge ${definition.className}">
            ${definition.label}
        </span>
    `;
}

export function renderStatusEditor(currentStatus, onChange) {
    const container = document.createElement("div");
    container.className = "status-editor";
    const statuses = currentStatus
        ? [[currentStatus, STATUS_DEFINITIONS[currentStatus]]]
        : Object.entries(STATUS_DEFINITIONS);
    statuses.forEach(([status, definition]) => {
        if (!definition) {
            return;
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "status-editor__badge";
        if (status === currentStatus) {
            button.classList.add("is-selected");
        }
        const text = document.createElement("span");
        text.className = "status-editor__text";
        text.textContent = definition.label;
        button.appendChild(text);
        if (status === currentStatus) {
            const remove = document.createElement("span");
            remove.className = "status-editor__remove";
            remove.textContent = "×";
            button.appendChild(remove);
        }
        button.addEventListener("click", () => {
            if (status === currentStatus) {
                onChange(null);
                return;
            }
            onChange(status);
        });
        container.appendChild(button);
    });
    return container;
}

export function setupStatusEditor(root, entity, enabled = false) {
    let currentStatus = getObjectStatus(entity);
    const statusContainer = root.querySelector("#entityStatus");
    if (!enabled || !statusContainer) {
        return {
            getStatus() {
                return currentStatus;
            }
        };
    }
    function renderStatus() {
        statusContainer.innerHTML = "";
        const editor = renderStatusEditor(currentStatus, status => {
            currentStatus = status;
            renderStatus();
        });
        statusContainer.appendChild(editor);
    }
    renderStatus();
    return {
        getStatus() {
            return currentStatus;
        }
    };
}

export function renderStatusEditorHTML() {
    return `
        <label>
            Статус
            <div
                id="entityStatus"
                class="entity-status"
            ></div>
        </label>
    `;
}
