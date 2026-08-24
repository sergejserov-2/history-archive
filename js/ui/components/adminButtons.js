/* ==========================================
   ADMIN BUTTONS
========================================== */

export function renderAdminButtons(actions=[]){

    return `
        <span class="admin-buttons" data-admin-buttons>
            ${actions.map(action=>`
                <button
                    class="admin-button"
                    data-action="${action.type}"
                    ${action.id?`data-id="${action.id}"`:""}
                    ${action.title?`title="${action.title}"`:""}
                >
                    <img
                        src="icons/${action.icon}.svg"
                        class="admin-icon"
                    >
                </button>
            `).join("")}
        </span>
    `;

}

export function showAdminButtons(container,actions=[]){

    if(!container)return;

    container.innerHTML=
        renderAdminButtons(actions);

    const buttons=
        container.querySelector(
            "[data-admin-buttons]"
        );

    requestAnimationFrame(()=>{

        buttons?.classList.add(
            "admin-buttons--visible"
        );

    });

}

export function hideAdminButtons(container){

    const buttons=
        container?.querySelector(
            "[data-admin-buttons]"
        );

    if(!buttons)return;

    buttons.classList.remove(
        "admin-buttons--visible"
    );

    buttons.classList.add(
        "admin-buttons--closing"
    );

    setTimeout(()=>buttons.remove(),200);

}
