// ======================================
// Subject mentions
// ======================================

const MENTION_PATTERN=/\[([^|\]]+)\|([^\]]*)\]/g;

export function getMentions(text=""){
    return [...text.matchAll(MENTION_PATTERN)].map(match=>({
        subjectId:match[1].trim(),
        label:match[2].trim()
    }));
}

export function setupMentionEditor(
    root,
    subjects=[]
){

    const textarea=
        root.querySelector("#entityDescription");

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

        const empty=
            document.createElement("option");

        empty.value="";
        empty.textContent="Выберите субъект";

        select.appendChild(empty);

        for(const subject of subjects){

            const option=
                document.createElement("option");

            option.value=subject.id;
            option.textContent=
                `${subject.title??"Без названия"} — ${subject.id}`;

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

            textarea.setSelectionRange(
                cursor,
                cursor
            );

            removeSelect();
        };

        select.onblur=()=>{
            setTimeout(
                removeSelect,
                100
            );
        };
    }

    textarea.addEventListener(
        "keydown",
        event=>{

            if(event.key!=="[")return;

            const position=
                textarea.selectionStart;

            if(
                textarea.selectionStart!==
                textarea.selectionEnd
            )return;

            event.preventDefault();

            showSelect(position);

        }
    );

    return{
        destroy(){
            removeSelect();
        }
    };
}

// ======================================
// Render mentions
// ======================================

export function renderMentions(
    text="",
    subjects=[]
){

    if(!text)return"";

    const subjectMap=
        new Map(
            subjects.map(
                subject=>[
                    subject.id,
                    subject
                ]
            )
        );

    return escapeHTML(text).replace(
        MENTION_PATTERN,
        (match,id,label)=>{

            const subject=
                subjectMap.get(id.trim());

            if(!subject)
                return label||match;

            return `
                <a
                    href="#"
                    class="subject-mention"
                    data-subject-id="${escapeHTML(subject.id)}"
                >${escapeHTML(label.trim())}</a>
            `;
        }
    );
}

// ======================================
// Mention links
// ======================================

export function setupMentionLinks(
    root,
    onSubjectClick
){

    root.addEventListener(
        "click",
        event=>{

            const link=
                event.target.closest(
                    ".subject-mention"
                );

            if(!link)return;

            event.preventDefault();

            const id=
                link.dataset.subjectId;

            if(id)
                onSubjectClick?.(id);
        }
    );
}

// ======================================
// Escape
// ======================================

function escapeHTML(value=""){
    return value
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
