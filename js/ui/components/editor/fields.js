import {renderFieldCounterHTML} from "./counters.js";

export function renderFieldsEditorHTML(cfg, entity, limits) {
    const fields = [];
    if(cfg.fields?.includes("author")){
        fields.push(`
            <label>
                Автор
                <input
                    id="entity_author"
                    value="${entity.author ?? ""}"
                    maxlength="${limits.author}"
                >
                ${renderFieldCounterHTML("entity_author", entity.author, limits.author)}
            </label>
        `);
    }
    return fields.join("");
}

export function setupFieldsEditor(root, cfg = {}) {
    return {
        getData(){
            const data = {};
            (cfg.fields ?? []).forEach(field => {
                if(
                    field === "date" ||
                    field === "dateStart" ||
                    field === "dateEnd"
                ){
                    return;
                }
                const input = root.querySelector(`#entity_${field}`);
                if(input){
                    data[field] = input.value.trim();
                }
            });
            return data;
        }
    };
}
