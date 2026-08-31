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
    let cardRects=null;

    function getCards(){
        return [...list.querySelectorAll("[data-photo-drag]")]
            .filter(card=>!card.classList.contains("photo-card--add"));
    }

    function getGap(){
        const style=getComputedStyle(list);
        return parseFloat(style.columnGap)||parseFloat(style.gap)||0;
    }

    function getLeftBoundary(){
        const listRect=list.getBoundingClientRect();
        const addCard=list.querySelector(".photo-card--add");
        if(!addCard)return listRect.left;
        return addCard.getBoundingClientRect().right+getGap();
    }

    function getRightBoundary(){
        return list.getBoundingClientRect().right;
    }

    function getMovingCards(){
        const cards=getCards();
        const index=cards.indexOf(activeCard);
        if(index<0)return[];
        if(direction<0)return cards.slice(0,index+1);
        if(direction>0)return cards.slice(index);
        return[activeCard];
    }

    function saveCardRects(){
        const cards=getCards();
        cardRects=new Map(
            cards.map(card=>[
                card,
                card.getBoundingClientRect()
            ])
        );
    }

    function getBaseRect(card){
        return cardRects?.get(card)||card.getBoundingClientRect();
    }

    function getBounds(){
        const cards=getCards();
        if(!cards.length)return{min:0,max:0};

        const first=getBaseRect(cards[0]);
        const last=getBaseRect(cards.at(-1));
        const left=getLeftBoundary();
        const right=getRightBoundary();

        return{
            min:left-first.left,
            max:right-last.right
        };
    }

    function canDrag(){
        const cards=getCards();
        if(!cards.length)return false;

        saveCardRects();

        const bounds=getBounds();

        return bounds.min<0||bounds.max>0;
    }

    function applyOffset(){
        getMovingCards().forEach(card=>{
            card.style.transform=`translate3d(${offsetX}px,0,0)`;
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

        resetTransformsOnly();

        if(!canDrag())return;

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

        const newDirection=delta<0?-1:delta>0?1:0;

        if(newDirection!==direction){
            resetTransformsOnly();
            direction=newDirection;
            offsetX=0;
        }

        const movingCards=getMovingCards();
        if(!movingCards.length)return;

        const bounds=getBounds();

        if(direction<0){
            offsetX=Math.max(
                bounds.min,
                Math.min(0,delta)
            );
        }else if(direction>0){
            offsetX=Math.min(
                bounds.max,
                Math.max(0,delta)
            );
        }

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
        moved=false;
        cardRects=null;
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
