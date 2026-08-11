// ======================================
// Cover editor
// ======================================

export function setupCoverEditor(root, photos, entity){
    const select =
        root.querySelector("#entityCover");
    
    if(!select){return null;}
    
    let coverPhotoId = entity?.coverPhotoId ?? null;
    
    select.onchange = e=>{
        coverPhotoId = e.target.value || null;
    };
    
    return {getData(){return {coverPhotoId};}};
}

export function renderCoverEditorHTML(cfg, entity) {
    return `
        <label>
            Обложка
            <select id="entityCover">
                <option value="">
                    Без фотографии
                </option>
                ${(cfg.cover.photos ?? [])
                    .map(photo => `
                        <option
                            value="${photo.id}"
                            ${photo.id === entity.coverPhotoId ? "selected" : ""}
                        >
                            ${photo.title ?? photo.id}
                        </option>
                    `)
                    .join("")}
            </select>
        </label>
    `;
}
