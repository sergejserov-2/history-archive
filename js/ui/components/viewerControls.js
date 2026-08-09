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
// CSS подключим отдельно.
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

    previousButton.textContent =
        "←";

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

    nextButton.textContent =
        "→";

    // ======================================
    // Assemble
    // ======================================

    controls.appendChild(
        previousButton
    );

    controls.appendChild(
        position
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
    // Buttons
    // ======================================

    previousButton.onclick =
        event => {

            event.preventDefault();

            onPrevious();

        };

    nextButton.onclick =
        event => {

            event.preventDefault();

            onNext();

        };

    // ======================================
    // Keyboard
    // ======================================

    function handleKeydown(event){

        if(
            event.key === "ArrowLeft"
        ){

            event.preventDefault();

            onPrevious();

        }

        if(
            event.key === "ArrowRight"
        ){

            event.preventDefault();

            onNext();

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
