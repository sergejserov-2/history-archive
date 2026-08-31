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
    let bounds={min:0,max:0};

    function getCards(){
        return[
            ...list.querySelectorAll("[data-photo-drag]")
        ].filter(card=>!card.classList.contains("photo-card--add"));
    }

    function getGap(){
        const styles=getComputedStyle(list);

        return parseFloat(styles.columnGap)||
            parseFloat(styles.gap)||
            0;
    }

    function getLeftBoundary(){
        const addCard=list.querySelector(".photo-card--add");

        if(addCard){
            const rect=addCard.getBoundingClientRect();

            return rect.right+getGap();
        }

        return list.getBoundingClientRect().left;
    }

    function getRightBoundary(){
        return list.getBoundingClientRect().right;
    }

    function calculateBounds(){
        const cards=getCards();

        if(!cards.length){
            console.log("[photoDrag] no cards");

            return{min:0,max:0};
        }

        const listRect=list.getBoundingClientRect();
        const firstRect=cards[0].getBoundingClientRect();
        const lastRect=cards.at(-1).getBoundingClientRect();

        const leftBoundary=getLeftBoundary();
        const rightBoundary=getRightBoundary();

        const result={
            min:leftBoundary-firstRect.left,
            max:rightBoundary-lastRect.right
        };

        console.group("[photoDrag] calculateBounds");

        console.log("list",{
            left:listRect.left,
            right:listRect.right,
            width:listRect.width
        });

        console.log("first card",{
            left:firstRect.left,
            right:firstRect.right,
            width:firstRect.width
        });

        console.log("last card",{
            left:lastRect.left,
            right:lastRect.right,
            width:lastRect.width
        });

        console.log("boundaries",{
            left:leftBoundary,
            right:rightBoundary
        });

        console.log("bounds",result);

        console.groupEnd();

        return result;
    }

    function canDrag(){
        const currentBounds=calculateBounds();

        const result=
            currentBounds.min<-1||
            currentBounds.max>1;

        console.log("[photoDrag] canDrag",{
            min:currentBounds.min,
            max:currentBounds.max,
            result
        });

        return result;
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

    function applyOffset(){
        getMovingCards().forEach(card=>{
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

        if(
            !card||
            !list.contains(card)||
            card.classList.contains("photo-card--add")
        ){
            return;
        }

        if(!canDrag())return;

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

        console.group("[photoDrag] START");

        console.log("active card",activeCard);

        console.log("pointer",{
            pointerId,
            startX
        });

        console.log("bounds",bounds);

        console.log("list",{
            clientWidth:list.clientWidth,
            rect:list.getBoundingClientRect()
        });

        console.groupEnd();

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

        offsetX=Math.max(
            bounds.min,
            Math.min(bounds.max,delta)
        );

        const movingCards=getMovingCards();

        console.log("[photoDrag] MOVE",{
            delta,
            direction,
            min:bounds.min,
            max:bounds.max,
            offsetX,
            movingCards:movingCards.length,
            activeCardId:activeCard.dataset.photoId
        });

        movingCards.forEach(card=>{
            card.classList.remove("photo-card--spring");
            card.classList.add("photo-card--dragging");
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

        console.group("[photoDrag] FINISH");

        console.log({
            cancelled,
            wasMoved,
            offsetX,
            direction,
            bounds
        });

        console.groupEnd();

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
        startX=0;
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
