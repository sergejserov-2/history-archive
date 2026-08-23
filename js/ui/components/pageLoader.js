let loader=null;

export function showPageLoader(){

    if(loader)return;

    loader=document.createElement("div");

    loader.className="page-loader";

    document.body.appendChild(loader);
}

export function hidePageLoader(){

    if(!loader)return;

    loader.classList.add(
        "page-loader--hidden"
    );

    const currentLoader=loader;

    loader=null;

    currentLoader.addEventListener(
        "transitionend",
        ()=>{
            currentLoader.remove();
        },
        {once:true}
    );
}
