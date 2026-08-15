import{createDropdown}from"../dropdown.js";

const MENTION_PATTERN=/\[([^|\]]+)\|([^\]]*)\]/g;
const MENTION_TRIGGER="[";
export function getMentions(text=""){
    return[...text.matchAll(MENTION_PATTERN)].map(match=>({
        subjectId:match[1].trim(),
        label:match[2].trim()
    }));
}

export function setupMentionEditor(root,subjects=[]){
    const textarea=root.querySelector("#entityDescription");
    if(!textarea)return null;
    let dropdown=null;
    let mentionStart=null;

    function removeDropdown(){
        dropdown?.destroy();
        dropdown=null;
        mentionStart=null;
    }

    function getMentionState(){
        const position=textarea.selectionStart;
        if(position!==textarea.selectionEnd)return null;

        const before=textarea.value.slice(0,position);
        const start=before.lastIndexOf(MENTION_TRIGGER);

        if(start<0)return null;

        const fragment=before.slice(start+1);

        if(fragment.includes("]"))return null;
        if(fragment.includes("|"))return null;
        if(fragment.includes("\n"))return null;

        return{
            start,
            query:fragment
        };
    }

    function getCursorPosition(){
        const style=getComputedStyle(textarea);
        const position=textarea.selectionStart;
        const text=textarea.value.slice(0,position);
        const lines=text.split("\n");
        const lineText=lines.at(-1)??"";

        const mirror=document.createElement("div");
        mirror.style.position="fixed";
        mirror.style.visibility="hidden";
        mirror.style.whiteSpace="pre-wrap";
        mirror.style.wordWrap="break-word";
        mirror.style.boxSizing="border-box";
        mirror.style.width=`${textarea.clientWidth}px`;
        mirror.style.padding=style.padding;
        mirror.style.border=style.border;
        mirror.style.font=style.font;
        mirror.style.lineHeight=style.lineHeight;
        mirror.textContent=lineText||" ";

        const marker=document.createElement("span");
        marker.textContent="\u200b";
        mirror.appendChild(marker);

        document.body.appendChild(mirror);

        const rect=marker.getBoundingClientRect();
        const textareaRect=textarea.getBoundingClientRect();

        const result={
            left:textareaRect.left+(rect.left-mirror.getBoundingClientRect().left),
            top:textareaRect.top+(rect.top-mirror.getBoundingClientRect().top)
        };

        mirror.remove();

        return result;
    }

    function showDropdown(state){
        if(!state)return;

        mentionStart=state.start;

        const query=state.query
            .trim()
            .toLocaleLowerCase("ru");

        const filtered=subjects.filter(subject=>
            (subject.title??"")
                .toLocaleLowerCase("ru")
                .includes(query)
        );

        if(!filtered.length){
            removeDropdown();
            return;
        }

const dropdown=createDropdown({
    className:"entity-mention-dropdown",
    maxHeight:240,
    matchAnchorWidth:false
});

        dropdown.setItems(
            filtered.map(subject=>({
                id:subject.id,
                title:subject.title??"Без названия"
            })),
            {
                onSelect(subject){
                    const position=textarea.selectionStart;
                    const value=textarea.value;

                    textarea.value=
                        value.slice(0,mentionStart)+
                        `[${subject.id}|`+
                        value.slice(position);

                    const cursor=
                        mentionStart+
                        subject.id.length+
                        2;

                    textarea.focus();
                    textarea.setSelectionRange(cursor,cursor);

                    removeDropdown();
                }
            }
        );

        const cursor=getCursorPosition();

        dropdown.element.style.left=`${cursor.left}px`;
        dropdown.element.style.top=`${cursor.top+22}px`;
        dropdown.element.style.width="280px";

        dropdown.open();
    }

    textarea.addEventListener("keydown",event=>{
        if(event.key!==MENTION_TRIGGER)return;
        if(textarea.selectionStart!==textarea.selectionEnd)return;

        setTimeout(()=>{
            const state=getMentionState();
            if(state)showDropdown(state);
        },0);
    });

    textarea.addEventListener("input",()=>{
        const state=getMentionState();

        if(!state){
            removeDropdown();
            return;
        }

        showDropdown(state);
    });

    textarea.addEventListener("click",()=>{
        const state=getMentionState();

        if(state)showDropdown(state);
        else removeDropdown();
    });

    textarea.addEventListener("blur",()=>{
        setTimeout(removeDropdown,150);
    });

    return{
        destroy(){
            removeDropdown();
        }
    };
}

export function renderMentions(
    text="",
    subjects=[],
    getHref=null
){
    if(!text)return"";

    const subjectMap=new Map(
        subjects.map(subject=>[
            subject.id,
            subject
        ])
    );

    return escapeHTML(text).replace(
        MENTION_PATTERN,
        (match,id,label)=>{
            const subject=subjectMap.get(id.trim());

            if(!subject)
                return label||match;

            const href=
                typeof getHref==="function"
                    ?getHref(subject)
                    :"#";

            return`
                <a
                    href="${escapeHTML(href)}"
                    class="subject-mention"
                >${escapeHTML(label.trim())}</a>
            `;
        }
    );
}

export function getSubjectHref(subject){
    if(!subject?.id)return"#";

    const url=new URL(
        window.location.href
    );

    url.searchParams.set(
        "modal",
        "subject"
    );

    url.searchParams.set(
        "entityId",
        subject.id
    );

    return url.pathname+
        "?"+
        url.searchParams.toString();
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
