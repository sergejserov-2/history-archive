import { createDropdown } from "../dropdown.js";

// ======================================
// Cover editor
// ======================================

export function setupCoverEditor(root, photos, entity) {
    const input = root.querySelector("#entityCover");

    if(!input) {
        return null;
    }

    let coverPhotoId = entity?.coverPhotoId ?? null;

    const photoList = [
        {
            id: "",
            title: "Без фотографии"
        },
        ...(photos ?? []).map(photo => ({
            id: photo.id,
            title: photo.title ?? photo.id
        }))
    ];

    const selectedPhoto =
        photoList.find(photo => photo.id === coverPhotoId) ??
        photoList[0];

    const dropdown = createDropdown();

    dropdown.setItems(photoList, {
        onSelect(photo) {
            coverPhotoId = photo.id || null;
            input.value = photo.title;

            dropdown.close();
            input.blur();

            input.dispatchEvent(
                new CustomEvent("coverchange", {
                    bubbles: true,
                    detail: photo
                })
            );
        }
    });

    input.value = selectedPhoto.title;

    input.addEventListener("click", () => {
        if(dropdown.isOpen()) {
            dropdown.close();
            input.blur();
        }
        else {
            dropdown.open(input);
            input.focus();
        }
    });

    return {
        getData() {
            return {
                coverPhotoId
            };
        }
    };
}

// ======================================
// Render
// ======================================

export function renderCoverEditorHTML() {
    return `
        <label class="entity-cover">
            Обложка
            <div class="entity-cover__input-wrapper">
                <input
                    id="entityCover"
                    class="entity-cover__input"
                    type="text"
                    readonly
                    autocomplete="off"
                    placeholder="Выберите фотографию"
                >
            </div>
        </label>
    `;
}
