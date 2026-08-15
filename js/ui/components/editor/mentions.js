const MENTION_TRIGGER="[";
export function setupMentionEditor(root,subjects=[]){
    const textarea=root.querySelector("#entityDescription");
    if(!textarea)return null;
    let select=null;

    function removeSelect(){
        select?.remove();
        select=null;
    }

    function showSelect(position){
        removeSelect();
        select=document.createElement("select");
        select.className="entity-mention-select";

        const empty=document.createElement("option");
        empty.value="";
        empty.textContent="Выберите субъект";
        select.appendChild(empty);

        for(const subject of subjects){
            const option=document.createElement("option");
            option.value=subject.id;
            option.textContent=`${subject.title??"Без названия"} — ${subject.id}`;
            select.appendChild(option);
        }

        textarea.parentElement.appendChild(select);
        select.focus();

        select.onchange=()=>{
            if(!select.value)return;

            const value=textarea.value;

            textarea.value=
                value.slice(0,position)+
                `[${select.value}|`+
                value.slice(position);

            const cursor=
                position+
                select.value.length+
                2;

            textarea.focus();
            textarea.setSelectionRange(cursor,cursor);
            removeSelect();
        };

        select.onblur=()=>{
            setTimeout(removeSelect,100);
        };
    }

    textarea.addEventListener("keydown",event=>{
        if(event.key!==MENTION_TRIGGER)return;

        const position=textarea.selectionStart;

        if(
            textarea.selectionStart!==
            textarea.selectionEnd
        )return;

        event.preventDefault();
        showSelect(position);
    });

    return{
        destroy(){
            removeSelect();
        }
    };
}
