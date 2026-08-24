export function insertAnimated(
    element,
    html
){

    element.insertAdjacentHTML(
        "beforeend",
        html
    );

    const block =
        element.lastElementChild;

    block.classList.add(
        "block-enter"
    );

    requestAnimationFrame(()=>{

        block.classList.add(
            "block-enter-active"
        );

    });

    block.addEventListener(
        "transitionend",
        ()=>{

            block.classList.remove(
                "block-enter",
                "block-enter-active"
            );

        },
        {
            once:true
        }
    );

}
