// ======================================
// Admin actions
// ======================================

export function initAdmin() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".admin-button"
                );

            if (!button) {

                return;

            }

            const action =
                button.dataset.action;

            console.log(
                "ADMIN ACTION:",
                action
            );

        }
    );

}
