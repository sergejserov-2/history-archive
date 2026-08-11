const STATUS_DEFINITIONS = {
    lost: {
        label: 'Утрачено',
        className: 'status-badge--lost'
    },

    attention: {
        label: 'Требует внимания',
        className: 'status-badge--attention'
    },

    deteriorating: {
        label: 'Разрушается',
        className: 'status-badge--deteriorating'
    }
};

/**
 * Нормализует статус объекта.
 *
 * Новая схема:
 * object.status
 *
 * Совместимость со старыми объектами:
 * object.lost === true → "lost"
 */
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
        return 'lost';
    }

    return null;
}

/**
 * Возвращает описание статуса.
 */
export function getStatusDefinition(status) {

    return STATUS_DEFINITIONS[status] || null;
}

/**
 * Создаёт публичный badge статуса.
 */
export function renderStatusBadge(status) {

    const definition = getStatusDefinition(status);

    if (!definition) {
        return null;
    }

    const badge = document.createElement('span');

    badge.className = `status-badge ${definition.className}`;
    badge.textContent = definition.label;

    return badge;
}

/**
 * Создаёт выбор статуса для редактора.
 *
 * Если статус не выбран:
 * показываются все три badge-кнопки.
 *
 * Если статус выбран:
 * показывается только выбранный badge
 * с кнопкой снятия ×.
 *
 * Одновременно может быть только один статус.
 */
export function renderStatusEditor(currentStatus, onChange) {

    const container = document.createElement('div');

    container.className = 'status-editor';

    /*
     * Если статус уже выбран,
     * показываем только его.
     */
    const statuses = currentStatus
        ? [[currentStatus, STATUS_DEFINITIONS[currentStatus]]]
        : Object.entries(STATUS_DEFINITIONS);

    statuses.forEach(([status, definition]) => {

        if (!definition) {
            return;
        }

        const button = document.createElement('button');

        button.type = 'button';

        button.className = 'status-editor__badge';

        if (status === currentStatus) {
            button.classList.add('is-selected');
        }

        const text = document.createElement('span');

        text.className = 'status-editor__text';
        text.textContent = definition.label;

        button.appendChild(text);

        /*
         * Крестик есть только у выбранного статуса.
         */
        if (status === currentStatus) {

            const remove = document.createElement('span');

            remove.className = 'status-editor__remove';
            remove.textContent = '×';

            button.appendChild(remove);
        }

        button.addEventListener('click', () => {

            /*
             * Повторный клик по выбранному статусу
             * полностью снимает его.
             */
            if (status === currentStatus) {
                onChange(null);
                return;
            }

            /*
             * Выбор нового статуса автоматически
             * заменяет предыдущий.
             */
            onChange(status);
        });

        container.appendChild(button);
    });

    return container;
}
