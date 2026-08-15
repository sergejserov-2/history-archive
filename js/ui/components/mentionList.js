const MENTION_PATTERN=/\[([^|\]]+)\|([^\]]*)\]/g;

export function getMentionedObjects(subjectId,objects=[],photos=[],sources=[],records=[]){
    if(!subjectId)return[];
    const result=new Map();
    const hasMention=text=>{
        if(typeof text!=="string")return false;
        return [...text.matchAll(MENTION_PATTERN)].some(match=>match[1].trim()===subjectId);
    };
    const addParents=entity=>{
        if(!hasMention(entity?.description))return;
        for(const parentId of entity?.parents??[]){
            const id=typeof parentId==="object"?parentId.objectId??parentId.id:parentId;
            const object=objects.find(item=>item.id===id);
            if(object)result.set(object.id,object);
        }
    };
    for(const object of objects){
        if(hasMention(object?.description))result.set(object.id,object);
    }
    for(const photo of photos)addParents(photo);
    for(const source of sources)addParents(source);
    for(const record of records)addParents(record);
    return[...result.values()];
}

export function renderMentionList(subject,objects=[],photos=[],sources=[],records=[]){
    const mentionedObjects=getMentionedObjects(subject?.id,objects,photos,sources,records);
    if(!mentionedObjects.length)return"";
    return`
        <div class="subject-mmentions">
            <div class="subject-mentions-title">Упоминается на страницах</div>
            <div class="subject-mentions-list">
                ${mentionedObjects.map(object=>`
                    <a class="subject-mention__row" href="object.html?id=${encodeURIComponent(object.id)}">
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
