export function initPhotoDrag(root=document){
    root.querySelectorAll(".photos-list").forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    if(list.dataset.photoDragInitialized)return;
    list.dataset.photoDragInitialized="true";

    let dragging=false;
    let activeCard=null;
    let activeMedia=null;
    let pointerId=null;
    let startX=0;
    let offsetX=0;
    let direction=0;
    let moved=false;
    let geometry=null;

    function getCards(){
        return [...list.querySelectorAll("[data-photo-drag]")];
    }

    function getGap(){
        const style=getComputedStyle(list);
        return parseFloat(style.columnGap)||parseFloat(style.gap)||0;
    }

    function resetTransformsOnly(){
        getCards().forEach(card=>{
            card.style.transform="translate3d(0,0,0)";
        });
    }

    function getMovingCards(){
        const cards=getCards();
        const index=cards.indexOf(activeCard);

        if(index<0)return[];

        if(direction<0){
            return cards.slice(0,index+1);
        }

        if(direction>0){
            return cards.slice(index);
        }

        return[activeCard];
    }

    function saveGeometry(){
        const cards=getCards();
        const firstCard=cards[0];
        const lastCard=cards.at(-1);
        const addCard=list.querySelector(".photo-card--add");

        if(!firstCard||!lastCard)return null;

        const firstLeft=firstCard.offsetLeft;
        const lastRight=
            lastCard.offsetLeft+
            lastCard.offsetWidth;

        const leftBoundary=addCard
            ?addCard.offsetLeft+
                addCard.offsetWidth+
                getGap()
            :0;

        const rightBoundary=
            list.scrollLeft+
            list.clientWidth;

        console.log("[photoDrag]",{
            listClientWidth:list.clientWidth,
            scrollLeft:list.scrollLeft,
            firstLeft,
            lastRight,
            leftBoundary,
            rightBoundary,
            firstOffsetParent:firstCard.offsetParent,
            list
        });

        return{
            firstLeft,
            lastRight,
            leftBoundary,
            rightBoundary
        };
    }

    function applyOffset(){
        getMovingCards().forEach(card=>{
            card.style.transform=
                `translate3d(${offsetX}px,0,0)`;
        });
    }

    function resetCards(){
        getCards().forEach(card=>{
            card.classList.remove("photo-card--dragging");
            card.classList.add("photo-card--spring");
            card.style.transform="translate3d(0,0,0)";
        });
    }

    function clampOffset(delta){
        if(!geometry)return 0;

        if(direction<0){
            const minOffset=
                geometry.leftBoundary-
                geometry.firstLeft;

            return Math.max(
                minOffset,
                Math.min(0,delta)
            );
        }

        if(direction>0){
            const maxOffset=
                geometry.rightBoundary-
                geometry.lastRight;

            return Math.min(
                maxOffset,
                Math.max(0,delta)
            );
        }

        return 0;
    }

    function start(event){
        if(
            event.pointerType==="mouse"&&
            event.button!==0
        ){
            return;
        }

        const media=event.target.closest(
            ".photo-card__media"
        );

        if(
            !media||
            !list.contains(media)
        ){
            return;
        }

        const card=media.closest(
            "[data-photo-drag]"
        );

        if(
            !card||
            !list.contains(card)
        ){
            return;
        }

        resetTransformsOnly();

        void list.offsetHeight;

        geometry=saveGeometry();

        if(!geometry)return;

        if(
            geometry.firstLeft<=geometry.leftBoundary&&
            geometry.lastRight>=geometry.rightBoundary
        ){
            return;
        }

        dragging=true;
        activeCard=card;
        activeMedia=media;
        pointerId=event.pointerId;
        startX=event.clientX;
        offsetX=0;
        direction=0;
        moved=false;

        activeMedia.setPointerCapture?.(pointerId);
    }

    function move(event){
        if(
            !dragging||
            !activeCard||
            event.pointerId!==pointerId
        ){
            return;
        }

        const delta=event.clientX-startX;

        if(!moved&&Math.abs(delta)>5){
            moved=true;
        }

        if(!moved)return;

        const newDirection=
            delta<0
                ?-1
                :delta>0
                    ?1
                    :0;

        if(newDirection!==direction){
            resetTransformsOnly();
            direction=newDirection;
        }

        offsetX=clampOffset(delta);

        getMovingCards().forEach(card=>{
            card.classList.remove(
                "photo-card--spring"
            );

            card.classList.add(
                "photo-card--dragging"
            );
        });

        applyOffset();

        event.preventDefault();
    }

    function finish(event,cancelled=false){
        if(!dragging)return;

        if(
            event.pointerId!==undefined&&
            event.pointerId!==pointerId
        ){
            return;
        }

        const wasMoved=moved;

        dragging=false;

        activeMedia?.releasePointerCapture?.(
            pointerId
        );

        if(wasMoved&&!cancelled){
            list.dataset.photoDragMoved="true";

            window.setTimeout(()=>{
                delete list.dataset.photoDragMoved;
            },50);
        }

        resetCards();

        activeCard=null;
        activeMedia=null;
        pointerId=null;
        startX=0;
        offsetX=0;
        direction=0;
        moved=false;
        geometry=null;
    }

    function end(event){
        finish(event);
    }

    function cancel(event){
        finish(event,true);
    }

    list.addEventListener("pointerdown",start);
    list.addEventListener("pointermove",move);
    list.addEventListener("pointerup",end);
    list.addEventListener("pointercancel",cancel);
    list.addEventListener(
        "lostpointercapture",
        cancel
    );
}
