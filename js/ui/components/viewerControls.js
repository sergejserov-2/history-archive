export function createViewerControls({currentIndex,total,onPrevious,onNext}){
    console.log("[CONTROLS] CREATE",{currentIndex,total});

    const controls=document.createElement("div");
    controls.className="viewer-controls";

    const position=document.createElement("div");
    position.className="viewer-controls__position";

    const previousButton=document.createElement("button");
    previousButton.type="button";
    previousButton.className="viewer-controls__previous";
    previousButton.setAttribute("aria-label","Предыдущая фотография");
    previousButton.innerHTML="‹";

    const nextButton=document.createElement("button");
    nextButton.type="button";
    nextButton.className="viewer-controls__next";
    nextButton.setAttribute("aria-label","Следующая фотография");
    nextButton.innerHTML="›";

    controls.append(position,previousButton,nextButton);

    function update(index){
        console.log("[CONTROLS] UPDATE",{
            index,
            total,
            hidden:controls.hidden,
            className:controls.className,
            connected:controls.isConnected
        });

        position.textContent=`Фотография ${index+1} из ${total}`;
        previousButton.disabled=index<=0;
        nextButton.disabled=index>=total-1;
    }

    function show(){
        console.log("[CONTROLS] SHOW",{
            hiddenBefore:controls.hidden,
            classBefore:controls.className,
            connected:controls.isConnected,
            display:getComputedStyle(controls).display,
            opacity:getComputedStyle(controls).opacity
        });

        console.trace("[CONTROLS] SHOW TRACE");

        controls.hidden=false;
        controls.classList.remove("viewer-controls--hidden");

        console.log("[CONTROLS] SHOW AFTER",{
            hidden:controls.hidden,
            className:controls.className,
            connected:controls.isConnected,
            display:getComputedStyle(controls).display,
            opacity:getComputedStyle(controls).opacity
        });
    }

    function hide(){
        console.log("[CONTROLS] HIDE",{
            hiddenBefore:controls.hidden,
            classBefore:controls.className,
            connected:controls.isConnected
        });

        console.trace("[CONTROLS] HIDE TRACE");

        controls.hidden=true;
        controls.classList.add("viewer-controls--hidden");

        console.log("[CONTROLS] HIDE AFTER",{
            hidden:controls.hidden,
            className:controls.className,
            connected:controls.isConnected,
            display:getComputedStyle(controls).display,
            opacity:getComputedStyle(controls).opacity
        });
    }

    previousButton.onclick=event=>{
        event.preventDefault();

        console.log("[CONTROLS] PREVIOUS CLICK",{
            disabled:previousButton.disabled
        });

        if(!previousButton.disabled)onPrevious();
    };

    nextButton.onclick=event=>{
        event.preventDefault();

        console.log("[CONTROLS] NEXT CLICK",{
            disabled:nextButton.disabled
        });

        if(!nextButton.disabled)onNext();
    };

    function handleKeydown(event){
        const target=event.target;

        if(
            target instanceof HTMLInputElement||
            target instanceof HTMLTextAreaElement||
            target instanceof HTMLSelectElement||
            target?.isContentEditable
        )return;

        if(event.key==="ArrowLeft"){
            console.log("[CONTROLS] ARROW LEFT",{
                disabled:previousButton.disabled
            });

            event.preventDefault();

            if(!previousButton.disabled)onPrevious();

            return;
        }

        if(event.key==="ArrowRight"){
            console.log("[CONTROLS] ARROW RIGHT",{
                disabled:nextButton.disabled
            });

            event.preventDefault();

            if(!nextButton.disabled)onNext();
        }
    }

    window.addEventListener("keydown",handleKeydown);

    update(currentIndex);

    function destroy(){
        console.log("[CONTROLS] DESTROY",{
            hidden:controls.hidden,
            className:controls.className,
            connected:controls.isConnected
        });

        console.trace("[CONTROLS] DESTROY TRACE");

        window.removeEventListener("keydown",handleKeydown);
        controls.remove();

        console.log("[CONTROLS] DESTROY AFTER",{
            hidden:controls.hidden,
            connected:controls.isConnected
        });
    }

    return{
        element:controls,
        update,
        show,
        hide,
        destroy
    };
}
