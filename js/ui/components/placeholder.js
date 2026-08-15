
// ======================================
// Loading placeholder
// ======================================

export function renderLoadingPlaceholder(extraClass=""){

    return `
        <div class="loading-placeholder ${extraClass}">
            <div class="loading-placeholder__bg"></div>
            <div class="loading-placeholder__spinner"></div>
        </div>
    `;

}
