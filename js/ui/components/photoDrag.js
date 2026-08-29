export function initPhotoDrag(root=document){
    root.querySelectorAll(".photos-list").forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    if(list.dataset.photoDragInitialized)return;

    list.dataset.photoDragInitialized="true";

    let dragging=false;
    let moved=false;
    let activeCard=null;
    let pointerId=null;
    let startX=0;
    let offsetX=0;
    let direction=0;
    let bounds={min:0,max:0};

    function getCards(){
        return [...list.querySelectorAll("[data-photo-drag]")];
    }

    function getContentWidth(cards){
        if(cards.length<2)return 0;

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

    function calculateBounds(){
        const cards=getCards();

        if(!cards.length)return{min:0,max:0};

        const first=cards[0].getBoundingClientRect();
        const last=cards.at(-1).getBoundingClientRect();
        const listRect=list.getBoundingClientRect();

        return{
            min:listRect.left-first.left,
            max:listRect.right-last.right
        };
    }

    function applyOffset(){
        getMovingCards().forEach(card=>{
            card.style.transform=`translate3d(${offsetX}px,0,0)`;
        });
    }

    function clearTransforms(){
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

        if(!card)return;
        if(!canDrag)return;

        dragging=true;
        moved=false;
        activeCard=card;
        pointerId=event.pointerId;
        startX=event.clientX;
        offsetX=0;
        direction=0;
        bounds=calculateBounds();

        media.setPointerCapture?.(pointerId);

        event.preventDefault();
    }

    function move(event){
        if(!dragging||event.pointerId!==pointerId)return;

        const delta=event.clientX-startX;

        if(Math.abs(delta)>4)moved=true;

        const newDirection=
            delta>0
                ?1
                :delta<0
                    ?-1
                    :0;

        if(newDirection!==direction){
            clearTransforms();
            direction=newDirection;
        }

        const movingCards=getMovingCards();

        if(!movingCards.length)return;

        offsetX=Math.max(
            bounds.min,
            Math.min(bounds.max,delta)
        );

        movingCards.forEach(card=>{
            card.classList.remove("photo-card--spring");
            card.classList.add("photo-card--dragging");
            card.style.transform=`translate3d(${offsetX}px,0,0)`;
        });

        event.preventDefault();
    }

    function end(event){
        if(!dragging)return;
        if(event.pointerId!==pointerId)return;

        dragging=false;

        activeCard?.querySelector(".photo-card__media")
            ?.releasePointerCapture?.(pointerId);

        if(moved){
            list.dataset.photoDragMoved="true";

            setTimeout(()=>{
                delete list.dataset.photoDragMoved;
            },0);
        }

        resetCards();

        activeCard=null;
        pointerId=null;
        startX=0;
        offsetX=0;
        direction=0;
        bounds={min:0,max:0};
    }

    list.addEventListener("pointerdown",start);
    list.addEventListener("pointermove",move);
    list.addEventListener("pointerup",end);
    list.addEventListener("pointercancel",end);
    list.addEventListener("lostpointercapture",end);
}
