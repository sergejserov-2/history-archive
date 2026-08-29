export function initPhotoDrag(root=document){
    const lists=
        root.querySelectorAll(".photos-list");

    lists.forEach(setupPhotoDrag);
}

function setupPhotoDrag(list){
    if(list.dataset.photoDragInitialized){
        return;
    }

    list.dataset.photoDragInitialized="true";

    let dragging=false;
    let activeCard=null;
    let startX=0;
    let offsetX=0;
    let direction=0;

    function getCards(){
        return[
            ...list.querySelectorAll(
                "[data-photo-drag]"
            )
        ];
    }

    function getContentWidth(cards){
        if(!cards.length)return 0;

        const first=
            cards[0].getBoundingClientRect();

        const last=
            cards.at(-1).getBoundingClientRect();

        return last.right-first.left;
    }

    function canDrag(){
        const cards=getCards();

        if(cards.length<2){
            return false;
        }

        const contentWidth=
            getContentWidth(cards);

        return contentWidth<
            list.clientWidth;
    }

    function getMovingCards(){
        const cards=getCards();

        if(!activeCard){
            return[];
        }

        const index=
            cards.indexOf(activeCard);

        if(index<0){
            return[];
        }

        if(direction>0){
            return cards.slice(index);
        }

        if(direction<0){
            return cards.slice(0,index+1);
        }

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

        const first=
            cards[0].getBoundingClientRect();

        const last=
            cards.at(-1).getBoundingClientRect();

        const listRect=
            list.getBoundingClientRect();

        return{
            min:listRect.left-first.left,
            max:listRect.right-last.right
        };
    }

    function applyOffset(){
        const cards=
            getMovingCards();

        cards.forEach(card=>{
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

    function start(event){
        if(
            event.pointerType==="mouse"&&
            event.button!==0
        ){
            return;
        }

        const card=
            event.target.closest(
                "[data-photo-drag]"
            );

        if(!card||!list.contains(card)){
            return;
        }

        if(
            event.target.closest(
                ".admin-button"
            )
        ){
            return;
        }

        if(!canDrag){
            return;
        }

        dragging=true;
        activeCard=card;
        startX=event.clientX;
        offsetX=0;
        direction=0;

        activeCard.setPointerCapture?.(
            event.pointerId
        );

        event.preventDefault();
    }

    function move(event){
        if(!dragging||!activeCard){
            return;
        }

        const delta=
            event.clientX-startX;

        const newDirection=
            delta>0
                ?1
                :delta<0
                    ?-1
                    :0;

        if(newDirection!==direction){
            resetTransformsOnly();

            direction=newDirection;
        }

        const bounds=
            getBounds();

        offsetX=
            Math.max(
                bounds.min,
                Math.min(
                    bounds.max,
                    delta
                )
            );

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

    function resetTransformsOnly(){
        getCards().forEach(card=>{
            card.style.transform=
                "translate3d(0,0,0)";
        });
    }

    function end(event){
        if(!dragging){
            return;
        }

        dragging=false;

        activeCard?.releasePointerCapture?.(
            event.pointerId
        );

        resetCards();

        activeCard=null;
        offsetX=0;
        direction=0;
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
}
