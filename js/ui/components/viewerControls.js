export function createViewerControls({currentIndex,total,onPrevious,onNext}){
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
            time:performance.now(),
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
        console.log("[CONTROLS] SHOW BEFORE",{
            time:performance.now(),
            hidden:controls.hidden,
            opacity:getComputedStyle(controls).opacity,
            visibility:getComputedStyle(controls).visibility,
            className:controls.className,
            connected:controls.isConnected
        });

        controls.hidden=false;
        controls.classList.remove("viewer-controls--hidden");

        console.log("[CONTROLS] SHOW AFTER",{
            time:performance.now(),
            hidden:controls.hidden,
            opacity:getComputedStyle(controls).opacity,
            visibility:getComputedStyle(controls).visibility,
            className:controls.className,
            connected:controls.isConnected
        });
    }

    function hide(){
        console.log("[CONTROLS] HIDE BEFORE",{
            time:performance.now(),
            hidden:controls.hidden,
            opacity:getComputedStyle(controls).opacity,
            visibility:getComputedStyle(controls).visibility,
            className:controls.className,
            connected:controls.isConnected
        });

        controls.hidden=true;
        controls.classList.add("viewer-controls--hidden");

        console.log("[CONTROLS] HIDE AFTER",{
            time:performance.now(),
            hidden:controls.hidden,
            opacity:getComputedStyle(controls).opacity,
            visibility:getComputedStyle(controls).visibility,
            className:controls.className,
            connected:controls.isConnected
        });
    }

    previousButton.onclick=event=>{
        event.preventDefault();

        console.log("[CONTROLS] PREVIOUS CLICK",{
            time:performance.now(),
            disabled:previousButton.disabled
        });

        if(!previousButton.disabled)onPrevious();
    };

    nextButton.onclick=event=>{
        event.preventDefault();

        console.log("[CONTROLS] NEXT CLICK",{
            time:performance.now(),
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
            console.log("[CONTROLS] KEY LEFT",{
                time:performance.now(),
                disabled:previousButton.disabled,
                hidden:controls.hidden,
                className:controls.className
            });

            event.preventDefault();

            if(!previousButton.disabled)onPrevious();

            return;
        }

        if(event.key==="ArrowRight"){
            console.log("[CONTROLS] KEY RIGHT",{
                time:performance.now(),
                disabled:nextButton.disabled,
                hidden:controls.hidden,
                className:controls.className
            });

            event.preventDefault();

            if(!nextButton.disabled)onNext();
        }
    }

    window.addEventListener("keydown",handleKeydown);

    update(currentIndex);

    function destroy(){
        console.log("[CONTROLS] DESTROY BEFORE",{
            time:performance.now(),
            hidden:controls.hidden,
            opacity:getComputedStyle(controls).opacity,
            visibility:getComputedStyle(controls).visibility,
            className:controls.className,
            connected:controls.isConnected,
            parent:controls.parentElement?.className
        });

        window.removeEventListener("keydown",handleKeydown);
        controls.remove();

        console.log("[CONTROLS] DESTROY AFTER",{
            time:performance.now(),
            connected:controls.isConnected,
            parent:controls.parentElement?.className
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
