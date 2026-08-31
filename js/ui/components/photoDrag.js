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

    function getAddCard(){
        return list.querySelector(".photo-card--add");
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

        if(!cards.length)return null;

        const listRect=list.getBoundingClientRect();
        const addCard=getAddCard();
        const addRect=addCard?.getBoundingClientRect();
        const cardRects=new Map();

        cards.forEach(card=>{
            cardRects.set(
                card,
                card.getBoundingClientRect()
            );
        });

        const leftBoundary=addRect
            ?addRect.right
            :listRect.left;

        console.log("[photoDrag] geometry",{
            listLeft:listRect.left,
            listRight:listRect.right,
            listWidth:listRect.width,
            addLeft:addRect?.left,
            addRight:addRect?.right,
            leftBoundary,
            rightBoundary:listRect.right,
            scrollLeft:list.scrollLeft,
            cards:[...cardRects.entries()].map(
                ([card,rect])=>({
                    id:card.dataset.photoId,
                    left:rect.left,
                    right:rect.right
                })
            )
        });

        return{
            leftBoundary,
            rightBoundary:listRect.right,
            cards:cardRects
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
            card.classList.remove(
                "photo-card--dragging"
            );

            card.classList.add(
                "photo-card--spring"
            );

            card.style.transform=
                "translate3d(0,0,0)";
        });
    }

    function clampOffset(delta){
        if(!geometry)return 0;

        const movingCards=getMovingCards();

        if(!movingCards.length)return 0;

        if(direction<0){
            const movingLeft=Math.min(
                ...movingCards.map(card=>
                    geometry.cards.get(card).left
                )
            );

            const minOffset=
                geometry.leftBoundary-movingLeft;

            return Math.max(
                minOffset,
                Math.min(0,delta)
            );
        }

        if(direction>0){
            const movingRight=Math.max(
                ...movingCards.map(card=>
                    geometry.cards.get(card).right
                )
            );

            const maxOffset=
                geometry.rightBoundary-movingRight;

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

        dragging=true;
        activeCard=card;
        activeMedia=media;
        pointerId=event.pointerId;
        startX=event.clientX;
        offsetX=0;
        direction=0;
        moved=false;

        activeMedia.setPointerCapture?.(
            pointerId
        );

        console.log("[photoDrag] start",{
            cardId:card.dataset.photoId,
            startX,
            leftBoundary:geometry.leftBoundary,
            rightBoundary:geometry.rightBoundary
        });
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

        if(
            !moved&&
            Math.abs(delta)>5
        ){
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

        console.log("[photoDrag] move",{
            delta,
            direction,
            offsetX,
            movingCards:getMovingCards().map(
                card=>card.dataset.photoId
            )
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

        console.log("[photoDrag] finish",{
            cancelled,
            wasMoved
        });

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
        cancel
    );

    list.addEventListener(
        "lostpointercapture",
        cancel
    );
}
