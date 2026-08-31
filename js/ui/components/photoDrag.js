export function initPhotoDrag(root=document){
    const lists=root.querySelectorAll(".photos-list");
    lists.forEach(setupPhotoDrag);
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
    let bounds={min:0,max:0};

    function getCards(){
        return[
            ...list.querySelectorAll("[data-photo-drag]")
        ].filter(card=>!card.classList.contains("photo-card--add"));
    }

    function getGap(){
        const style=getComputedStyle(list);
        return parseFloat(style.columnGap)||parseFloat(style.gap)||0;
    }

    function getMovingCards(){
        const cards=getCards();
        if(!activeCard)return[];

        const index=cards.indexOf(activeCard);
        if(index<0)return[];

        if(direction>0)return cards.slice(index);
        if(direction<0)return cards.slice(0,index+1);

        return[activeCard];
    }

    function calculateBounds(){
        const cards=getCards();
        if(!cards.length)return{min:0,max:0};

        const first=cards[0].getBoundingClientRect();
        const last=cards.at(-1).getBoundingClientRect();
        const listRect=list.getBoundingClientRect();

        const addCard=list.querySelector(".photo-card--add");
        const addRect=addCard?.getBoundingClientRect();
        const gap=getGap();

        const leftBoundary=addRect
            ?addRect.right+gap
            :listRect.left;

        const rightBoundary=listRect.right;

        const result={
            min:leftBoundary-first.left,
            max:rightBoundary-last.right
        };

        console.log("[photoDrag] calculateBounds");
        console.log("list",{
            left:listRect.left,
            right:listRect.right,
            width:listRect.width
        });
        console.log("first card",{
            left:first.left,
            right:first.right,
            width:first.width
        });
        console.log("last card",{
            left:last.left,
            right:last.right,
            width:last.width
        });
        console.log("add card",addRect?{
            left:addRect.left,
            right:addRect.right,
            width:addRect.width
        }:null);
        console.log("gap",gap);
        console.log("boundaries",{
            left:leftBoundary,
            right:rightBoundary
        });
        console.log("bounds",result);

        return result;
    }

    function canDrag(){
        const cards=getCards();
        if(!cards.length)return false;

        const currentBounds=calculateBounds();
        const result=
            currentBounds.min<0||
            currentBounds.max>0;

        console.log("[photoDrag] canDrag",{
            cards:cards.length,
            min:currentBounds.min,
            max:currentBounds.max,
            result
        });

        return result;
    }

    function applyOffset(){
        const cards=getMovingCards();

        cards.forEach(card=>{
            card.style.transform=
                `translate3d(${offsetX}px,0,0)`;
        });
    }

    function resetTransformsOnly(){
        getCards().forEach(card=>{
            card.style.transform="translate3d(0,0,0)";
        });
    }

    function resetCards(){
        getCards().forEach(card=>{
            card.classList.remove("photo-card--dragging");
            card.classList.add("photo-card--spring");
            card.style.transform="translate3d(0,0,0)";
        });
    }

    function start(event){
        if(event.pointerType==="mouse"&&event.button!==0)return;

        const media=event.target.closest(".photo-card__media");
        if(!media||!list.contains(media))return;

        const card=media.closest("[data-photo-drag]");
        if(!card||!list.contains(card))return;

        if(!canDrag()){
            console.log("[photoDrag] START BLOCKED");
            return;
        }

        resetTransformsOnly();

        dragging=true;
        activeCard=card;
        activeMedia=media;
        pointerId=event.pointerId;
        startX=event.clientX;
        offsetX=0;
        direction=0;
        moved=false;

        void list.offsetHeight;

        bounds=calculateBounds();

        console.log("[photoDrag] START");
        console.log("active card",activeCard);
        console.log("pointer",{
            pointerId,
            startX
        });
        console.log("bounds",bounds);
        console.log("cards",getCards().length);

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

        if(Math.abs(delta)>5){
            moved=true;
        }

        if(!moved)return;

        const newDirection=
            delta>0
                ?1
                :delta<0
                    ?-1
                    :0;

        if(newDirection!==direction){
            console.log("[photoDrag] DIRECTION CHANGE",{
                from:direction,
                to:newDirection,
                delta
            });

            resetTransformsOnly();
            direction=newDirection;
        }

        const movingCards=getMovingCards();

        if(!movingCards.length)return;

        let min=0;
        let max=0;

        if(direction<0){
            const firstMoving=movingCards[0].getBoundingClientRect();
            const listRect=list.getBoundingClientRect();
            const addCard=list.querySelector(".photo-card--add");
            const addRect=addCard?.getBoundingClientRect();

            const leftBoundary=addRect
                ?addRect.right+getGap()
                :listRect.left;

            min=leftBoundary-firstMoving.left;
            max=0;
        }

        if(direction>0){
            const lastMoving=movingCards.at(-1).getBoundingClientRect();
            const listRect=list.getBoundingClientRect();

            min=0;
            max=listRect.right-lastMoving.right;
        }

        offsetX=Math.max(
            min,
            Math.min(max,delta)
        );

        movingCards.forEach(card=>{
            card.classList.remove("photo-card--spring");
            card.classList.add("photo-card--dragging");
        });

        applyOffset();

        console.log("[photoDrag] MOVE",{
            delta,
            direction,
            movingCards:movingCards.length,
            min,
            max,
            offsetX
        });

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

        console.log("[photoDrag] FINISH",{
            cancelled,
            wasMoved,
            offsetX,
            direction,
            bounds
        });

        dragging=false;

        activeMedia?.releasePointerCapture?.(pointerId);

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
        offsetX=0;
        direction=0;
        bounds={min:0,max:0};
        moved=false;
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
    list.addEventListener("lostpointercapture",cancel);
}
