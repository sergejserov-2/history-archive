export function getMentionedObjects(subjectId,objects=[]){
    if(!subjectId)return[];
    const pattern=new RegExp(`\\[${escapeRegExp(subjectId)}\\|[^\\]]*\\]`);
    return objects.filter(object=>
        typeof object?.description==="string"&&
        pattern.test(object.description)
    );
}

export function renderMentionList(subject,objects=[]){
    const mentionedObjects=getMentionedObjects(subject?.id,objects);
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

function escapeRegExp(value=""){
    return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
}

function escapeHTML(value=""){
    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","'");
}
