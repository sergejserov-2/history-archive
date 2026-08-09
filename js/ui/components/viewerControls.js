// ======================================
// Viewer controls
// ======================================
//
// Управление перелистыванием Photo Viewer.
//
// Отвечает только за:
//
// - индикатор позиции;
// - предыдущую / следующую фотографию;
// - кнопки-стрелки;
// - клавиши ← / →.
//
// CSS подключается отдельно.
//
// ======================================

export function createViewerControls({

    currentIndex,

    total,

    onPrevious,

    onNext

}){

    // ======================================
    // Container
    // ======================================

    const controls =
        document.createElement(
            "div"
        );

    controls.className =
        "viewer-controls";

    // ======================================
    // Position
    // ======================================

    const position =
        document.createElement(
            "div"
        );

    position.className =
        "viewer-controls__position";

    // ======================================
    // Previous
    // ======================================

    const previousButton =
        document.createElement(
            "button"
        );

    previousButton.type =
        "button";

    previousButton.className =
        "viewer-controls__previous";

    previousButton.setAttribute(
        "aria-label",
        "Предыдущая фотография"
    );

    previousButton.innerHTML =
        "‹";

    // ======================================
    // Next
    // ======================================

    const nextButton =
        document.createElement(
            "button"
        );

    nextButton.type =
        "button";

    nextButton.className =
        "viewer-controls__next";

    nextButton.setAttribute(
        "aria-label",
        "Следующая фотография"
    );

    nextButton.innerHTML =
        "›";

    // ======================================
    // Assemble
    // ======================================

    controls.appendChild(
        position
    );

    controls.appendChild(
        previousButton
    );

    controls.appendChild(
        nextButton
    );

    // ======================================
    // Update
    // ======================================

    function update(index){

        position.textContent =
            `Фотография ${index + 1} из ${total}`;

        previousButton.disabled =
            index <= 0;

        nextButton.disabled =
            index >= total - 1;

    }

    // ======================================
    // Previous
    // ======================================

    previousButton.onclick =
        event => {

            event.preventDefault();

            if(
                previousButton.disabled
            ){

                return;

            }

            onPrevious();

        };

    // ======================================
    // Next
    // ======================================

    nextButton.onclick =
        event => {

            event.preventDefault();

            if(
                nextButton.disabled
            ){

                return;

            }

            onNext();

        };

    // ======================================
    // Keyboard
    // ======================================

    function handleKeydown(event){

        // Не перехватываем стрелки,
        // если пользователь печатает
        // в input / textarea.

        const target =
            event.target;

        if(
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement ||
            target?.isContentEditable
        ){

            return;

        }

        if(
            event.key === "ArrowLeft"
        ){

            event.preventDefault();

            if(
                !previousButton.disabled
            ){

                onPrevious();

            }

            return;

        }

        if(
            event.key === "ArrowRight"){

            event.preventDefault();

            if(
                !nextButton.disabled
            ){

                onNext();

            }

        }

    }

    window.addEventListener(
        "keydown",
        handleKeydown
    );

    // ======================================
    // Initial state
    // ======================================

    update(
        currentIndex
    );

    // ======================================
    // Destroy
    // ======================================

    function destroy(){

        window.removeEventListener(
            "keydown",
            handleKeydown
        );

        controls.remove();

    }

    return {

        element:
            controls,

        update,

        destroy

    };

}
