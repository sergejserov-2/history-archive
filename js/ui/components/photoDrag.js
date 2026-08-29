export function initPhotoDrag(root=document){
    console.log("[photoDrag] init",root);

    const lists=root.querySelectorAll(".photos-list");

    console.log("[photoDrag] lists found",lists.length);

    lists.forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    console.log("[photoDrag] setup start",list);

    if(list.dataset.photoDragInitialized){
        console.log("[photoDrag] already initialized");
        return;
    }

    list.dataset.photoDragInitialized="true";

    console.log("[photoDrag] initialized",{
        scrollWidth:list.scrollWidth,
        clientWidth:list.clientWidth,
        maxScroll:list.scrollWidth-list.clientWidth
    });

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
        console.log("[photoDrag] pointerdown",{
            pointerType:event.pointerType,
            button:event.button,
            target:event.target
        });

        if(event.pointerType==="mouse"&&event.button!==0){
            console.log("[photoDrag] ignored: not left mouse button");
            return;
        }

        const card=event.target.closest(
            "[data-photo-drag]"
        );

        console.log("[photoDrag] card",card);

        if(!card){
            console.log("[photoDrag] ignored: card not found");
            return;
        }

        if(event.target.closest(".admin-button")){
            console.log("[photoDrag] ignored: admin button");
            return;
        }

        const maxScroll=getMaxScroll();

        console.log("[photoDrag] max scroll",{
            scrollWidth:list.scrollWidth,
            clientWidth:list.clientWidth,
            maxScroll
        });

        if(maxScroll<=0){
            console.log(
                "[photoDrag] ignored: list does not overflow"
            );
            return;
        }

        dragging=true;
        dragged=false;
        pointerId=event.pointerId;

        startX=event.clientX;
        startScrollLeft=list.scrollLeft;

        console.log("[photoDrag] drag start",{
            pointerId,
            startX,
            startScrollLeft,
            card
        });

        list.setPointerCapture?.(
            pointerId
        );

        list.classList.add(
            "photos-list--dragging"
        );

        event.preventDefault();
    }

    function move(event){
        if(!dragging){
            return;
        }

        const delta=
            event.clientX-startX;

        if(Math.abs(delta)>4){
            dragged=true;
        }

        const maxScroll=getMaxScroll();

        const nextScrollLeft=
            Math.max(
                0,
                Math.min(
                    maxScroll,
                    startScrollLeft-delta
                )
            );

        console.log("[photoDrag] move",{
            clientX:event.clientX,
            delta,
            maxScroll,
            before:list.scrollLeft,
            nextScrollLeft
        });

        list.scrollLeft=nextScrollLeft;

        event.preventDefault();
    }

    function end(event){
        if(!dragging){
            return;
        }

        console.log("[photoDrag] drag end",{
            pointerId,
            dragged,
            scrollLeft:list.scrollLeft
        });

        dragging=false;

        list.classList.remove(
            "photos-list--dragging"
        );

        if(pointerId!==null){
            list.releasePointerCapture?.(
                pointerId
            );
        }

        pointerId=null;

        if(dragged){
            list.dataset.photoDragged="true";

            console.log(
                "[photoDrag] click suppression enabled"
            );

            setTimeout(()=>{
                delete list.dataset.photoDragged;

                console.log(
                    "[photoDrag] click suppression removed"
                );
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
            if(list.dataset.photoDragged!=="true"){
                return;
            }

            console.log(
                "[photoDrag] click suppressed"
            );

            event.preventDefault();
            event.stopImmediatePropagation();
        },
        true
    );

    console.log(
        "[photoDrag] event listeners attached"
    );
}

