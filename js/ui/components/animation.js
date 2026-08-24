// ======================================
// BLOCK ANIMATION
// ======================================

export function insertAnimated(
    parent,
    html,
    position="beforeend"
){

    parent.insertAdjacentHTML(
        position,
        html
    );

    const block =
        position==="beforeend"
        ?
        parent.lastElementChild
        :
        parent.previousElementSibling;

    if(!block)return;

    block.classList.add(
        "block-collapsed"
    );

    requestAnimationFrame(()=>{

        block.classList.add(
            "block-expanded"
        );

    });

    block.addEventListener(
        "transitionend",
        ()=>{

            block.classList.remove(
                "block-collapsed",
                "block-expanded"
            );

        },
        {
            once:true
        }
    );

}

/**
 * Удаление блока с анимацией
 */

export function removeAnimated(
    block
){

    if(!block)return;

    const height =
        block.scrollHeight;

    block.style.maxHeight =
        height+"px";

    requestAnimationFrame(()=>{

        block.classList.add(
            "block-removing"
        );

    });

    block.addEventListener(
        "transitionend",
        ()=>{

            block.remove();

        },
        {
            once:true
        }
    );

}
