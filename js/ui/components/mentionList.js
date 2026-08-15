const MENTION_PATTERN=/\[([^|\]]+)\|([^\]]*)\]/g;

export function getMentionedObjects(subjectId,objects=[],photos=[],sources=[],records=[]){
    if(!subjectId)return[];
    const result=new Map();
    const hasMention=text=>{
        if(typeof text!=="string")return false;
        return [...text.matchAll(MENTION_PATTERN)]
            .some(match=>match[1].trim()===subjectId);
    };
    for(const object of objects){
        if(hasMention(object?.description))result.set(object.id,object);
    }
    for(const photo of photos){
        if(!hasMention(photo?.description))continue;
        const object=objects.find(item=>item.id===photo.objectId);
        if(object)result.set(object.id,object);
    }
    for(const source of sources){
        if(!hasMention(source?.description))continue;
        const object=objects.find(item=>item.id===source.objectId);
        if(object)result.set(object.id,object);
    }
    for(const record of records){
        if(!hasMention(record?.description))continue;
        const object=objects.find(item=>item.id===record.objectId);
        if(object)result.set(object.id,object);
    }
    return[...result.values()];
}

export function renderMentionList(subject,objects=[],photos=[],sources=[],records=[]){
    const mentionedObjects=getMentionedObjects(
        subject?.id,
        objects,
        photos,
        sources,
        records
    );
    if(!mentionedObjects.length)return"";
    return`
        <div class="subject-modal__mentions">
            <div class="subject-modal__mentions-title">Упоминается на страницах</div>
            <div class="subject-modal__mentions-list">
                ${mentionedObjects.map(object=>`
                    <a class="subject-modal__mention" href="object.html?id=${encodeURIComponent(object.id)}">
                        ${escapeHTML(object.title??"Без названия")}
                    </a>
                `).join("")}
            </div>
        </div>
    `;
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
