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
        position.textContent=`Фотография ${index+1} из ${total}`;
        previousButton.disabled=index<=0;
        nextButton.disabled=index>=total-1;
    }

    function show(){
        controls.classList.remove("viewer-controls--hidden");
        controls.style.visibility="visible";
        controls.style.opacity="1";
        controls.style.pointerEvents="none";
        previousButton.style.pointerEvents="auto";
        nextButton.style.pointerEvents="auto";
    }

    function hide(){
        controls.classList.add("viewer-controls--hidden");
        controls.style.opacity="0";
        controls.style.visibility="hidden";
        controls.style.pointerEvents="none";
    }

    previousButton.onclick=event=>{
        event.preventDefault();
        if(!previousButton.disabled)onPrevious();
    };

    nextButton.onclick=event=>{
        event.preventDefault();
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
            event.preventDefault();
            if(!previousButton.disabled)onPrevious();
            return;
        }

        if(event.key==="ArrowRight"){
            event.preventDefault();
            if(!nextButton.disabled)onNext();
        }
    }

    window.addEventListener("keydown",handleKeydown);

    update(currentIndex);

    function destroy(){
        window.removeEventListener("keydown",handleKeydown);
        controls.remove();
    }

    return{
        element:controls,
        update,
        show,
        hide,
        destroy
    };
}
