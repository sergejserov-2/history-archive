// ==========================================
// PAGE LOADER
// ==========================================

const PAGE_REVEAL_DURATION=360;

let initialized=false;

export function initPageLoader(){

    if(initialized)return;

    initialized=true;

    document.body.classList.add(
        "page-loading"
    );
}

export function revealPage(){

    return new Promise(resolve=>{

        requestAnimationFrame(()=>{

            requestAnimationFrame(()=>{

                document.body.classList.remove(
                    "page-loading"
                );

                document.body.classList.add(
                    "page-ready"
                );

                setTimeout(
                    resolve,
                    PAGE_REVEAL_DURATION
                );

            });

        });

    });

}
