export function initPhotoDrag(root=document){
    const lists=root.querySelectorAll(".photos-list");
    lists.forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    if(list.dataset.photoDragInitialized)return;

    list.dataset.photoDragInitialized="true";

    let dragging=false;
    let activeCard=null;
    let startX=0;
    let offsetX=0;
    let direction=0;
    let moved=false;

    function getCards(){
        return[
            ...list.querySelectorAll("[data-photo-drag]")
        ].filter(card=>!card.classList.contains("photo-card--add"));
    }

    function getContentWidth(cards){
        if(!cards.length)return 0;
        const first=cards[0].getBoundingClientRect();
        const last=cards.at(-1).getBoundingClientRect();
        return last.right-first.left;
    }

    function canDrag(){
        const cards=getCards();
        if(cards.length<2)return false;
        return getContentWidth(cards)<list.clientWidth;
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

    function getBounds(){
        const cards=getCards();

        if(!cards.length){
            return{
                min:0,
                max:0
            };
        }

        const first=cards[0].getBoundingClientRect();
        const last=cards.at(-1).getBoundingClientRect();
        const listRect=list.getBoundingClientRect();

        const addCard=list.querySelector(".photo-card--add");
        const addRect=addCard?.getBoundingClientRect();

        const gap=parseFloat(getComputedStyle(list).gap)||0;

        const leftBoundary=addRect
            ?addRect.right+gap
            :listRect.left;

        return{
            min:leftBoundary-first.left,
            max:listRect.right-last.right
        };
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
        if(!canDrag())return;

        dragging=true;
        activeCard=card;
        startX=event.clientX;
        offsetX=0;
        direction=0;
        moved=false;

        activeCard.setPointerCapture?.(event.pointerId);
    }

    function move(event){
        if(!dragging||!activeCard)return;

        const delta=event.clientX-startX;

        if(Math.abs(delta)>5){
            moved=true;
        }

        const newDirection=delta>0?1:delta<0?-1:0;

        if(newDirection!==direction){
            resetTransformsOnly();
            direction=newDirection;
        }

        const bounds=getBounds();

        offsetX=Math.max(
            bounds.min,
            Math.min(bounds.max,delta)
        );

        getMovingCards().forEach(card=>{
            card.classList.remove("photo-card--spring");
            card.classList.add("photo-card--dragging");
        });

        applyOffset();

        if(moved){
            event.preventDefault();
        }
    }

    function end(event){
        if(!dragging)return;

        dragging=false;

        activeCard?.releasePointerCapture?.(event.pointerId);

        if(moved){
            event.preventDefault();
        }

        resetCards();

        activeCard=null;
        offsetX=0;
        direction=0;

        window.setTimeout(()=>{
            moved=false;
        },0);
    }

    function cancel(event){
        if(!dragging)return;

        dragging=false;

        activeCard?.releasePointerCapture?.(event.pointerId);

        resetCards();

        activeCard=null;
        offsetX=0;
        direction=0;
        moved=false;
    }

    list.addEventListener("pointerdown",start);
    list.addEventListener("pointermove",move);
    list.addEventListener("pointerup",end);
    list.addEventListener("pointercancel",cancel);
    list.addEventListener("lostpointercapture",cancel);
}

