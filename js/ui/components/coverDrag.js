// ==========================================
// COVER DRAG
// ==========================================

export function initCoverDrag(root=document){

    const covers=
        root.querySelectorAll(
            "[data-cover-drag]"
        );

    covers.forEach(setupCoverDrag);
}

function setupCoverDrag(cover){

    if(cover.dataset.coverDragInitialized){
        return;
    }

    const image=
        cover.querySelector(
            "[data-cover-image]"
        );

    if(!image)return;

    cover.dataset.coverDragInitialized="true";

    let dragging=false;
    let startY=0;
    let offsetY=0;

    function getMaxOffset(){

        const coverHeight=
            cover.clientHeight;

        const imageHeight=
            image.clientHeight;

        return Math.max(
            0,
            (coverHeight-imageHeight)/2
        );
    }

    function update(){

        image.style.transform=
            `translate3d(0,${offsetY}px,0)`;
    }

    function start(event){

        // Только левая кнопка мыши
        if(event.pointerType==="mouse"&&event.button!==0){
            return;
        }

        const maxOffset=
            getMaxOffset();

        if(maxOffset<=0){
            return;
        }

        dragging=true;

        startY=
            event.clientY-offsetY;

        image.classList.remove(
            "cover-image--spring"
        );

        image.classList.add(
            "cover-image--dragging"
        );

        image.setPointerCapture?.(
            event.pointerId
        );

        event.preventDefault();
    }

    function move(event){

        if(!dragging)return;

        const maxOffset=
            getMaxOffset();

        offsetY=
            event.clientY-startY;

        offsetY=
            Math.max(
                -maxOffset,
                Math.min(
                    maxOffset,
                    offsetY
                )
            );

        update();

        event.preventDefault();
    }

    function end(event){

        if(!dragging)return;

        dragging=false;

        image.classList.remove(
            "cover-image--dragging"
        );

        image.classList.add(
            "cover-image--spring"
        );

        offsetY=0;

        image.style.transform=
            "translate3d(0,0,0)";

        image.releasePointerCapture?.(
            event.pointerId
        );
    }

    image.addEventListener(
        "pointerdown",
        start
    );

    image.addEventListener(
        "pointermove",
        move
    );

    image.addEventListener(
        "pointerup",
        end
    );

    image.addEventListener(
        "pointercancel",
        end
    );

    image.addEventListener(
        "lostpointercapture",
        end
    );

    // Не даём ПКМ открывать контекстное меню
    image.addEventListener(
        "contextmenu",
        event=>{
            event.preventDefault();
        }
    );
}
