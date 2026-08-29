export function initPhotoDrag(root=document){
    const lists=root.querySelectorAll(".photos-list");

    lists.forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    if(list.dataset.photoDragInitialized){
        return;
    }

    list.dataset.photoDragInitialized="true";

    let dragging=false;
    let dragged=false;
    let pointerId=null;
    let startX=0;
    let startScrollLeft=0;

    function getMaxScroll(){
        return Math.max(
            0,
            list.scrollWidth-list.clientWidth
        );
    }

    function start(event){
        if(event.pointerType==="mouse"&&event.button!==0){
            return;
        }

        const card=event.target.closest("[data-photo-drag]");

        if(!card)return;

        if(event.target.closest(".admin-button")){
            return;
        }

        const maxScroll=getMaxScroll();

        if(maxScroll<=0){
            return;
        }

        dragging=true;
        dragged=false;
        pointerId=event.pointerId;

        startX=event.clientX;
        startScrollLeft=list.scrollLeft;

        list.setPointerCapture?.(
            pointerId
        );

        list.classList.add(
            "photos-list--dragging"
        );

        event.preventDefault();
    }

    function move(event){
        if(!dragging)return;

        const delta=
            event.clientX-startX;

        if(Math.abs(delta)>4){
            dragged=true;
        }

        const maxScroll=getMaxScroll();

        list.scrollLeft=Math.max(
            0,
            Math.min(
                maxScroll,
                startScrollLeft-delta
            )
        );

        event.preventDefault();
    }

    function end(event){
        if(!dragging)return;

        dragging=false;

        list.classList.remove(
            "photos-list--dragging"
        );

        list.releasePointerCapture?.(
            pointerId
        );

        pointerId=null;

        if(dragged){
            list.dataset.photoDragged="true";

            setTimeout(()=>{
                delete list.dataset.photoDragged;
            },0);
        }
    }

    list.addEventListener(
        "pointerdown",
        start
    );

    list.addEventListener(
        "pointermove",
        move
    );

    list.addEventListener(
        "pointerup",
        end
    );

    list.addEventListener(
        "pointercancel",
        end
    );

    list.addEventListener(
        "lostpointercapture",
        end
    );

    list.addEventListener(
        "click",
        event=>{
            if(list.dataset.photoDragged==="true"){
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        },
        true
    );
}
