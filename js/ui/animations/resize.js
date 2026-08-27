// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=5420;
const COLLAPSE_DURATION=5420;

const DEBUG_ANIMATIONS=true;

// ======================================
// Debug
// ======================================

function log(...args){
    if(DEBUG_ANIMATIONS)
        console.log("[animations]",...args);
}

function getName(el){
    return el?.id||el?.className||el?.tagName||"element";
}

function fmt(value){
    return Number(value||0).toFixed(2);
}

// ======================================
// Geometry
// ======================================

function getRect(el){
    return el?.getBoundingClientRect()||null;
}

function forceLayout(){
    void document.documentElement.offsetHeight;
}

// ======================================
// Margin
// ======================================

function getMargins(el){
    const style=window.getComputedStyle(el);

    return{
        top:parseFloat(style.marginTop)||0,
        right:parseFloat(style.marginRight)||0,
        bottom:parseFloat(style.marginBottom)||0,
        left:parseFloat(style.marginLeft)||0
    };
}

function setMargins(el,margin){
    el.style.setProperty(
        "margin-top",
        `${margin.top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-right",
        `${margin.right}px`,
        "important"
    );

    el.style.setProperty(
        "margin-bottom",
        `${margin.bottom}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${margin.left}px`,
        "important"
    );
}

// ======================================
// Layout direction
// ======================================

function getLayoutAxis(el){
    const parent=el?.parentElement;

    if(!parent)
        return"vertical";

    const style=window.getComputedStyle(parent);

    if(
        style.display==="grid"
    ){
        const columns=
            style.gridTemplateColumns;

        const rows=
            style.gridTemplateRows;

        if(
            columns&&
            columns!=="none"&&
            rows==="none"
        )
            return"horizontal";
    }

    if(
        style.flexDirection==="row"||
        style.flexDirection==="row-reverse"
    )
        return"horizontal";

    return"vertical";
}

// ======================================
// Gap
// ======================================

function getGap(el,axis){
    const parent=el?.parentElement;

    if(!parent)
        return 0;

    const style=window.getComputedStyle(parent);

    return axis==="horizontal"
        ?parseFloat(style.columnGap)||0
        :parseFloat(style.rowGap)||0;
}

// ======================================
// Hidden margins
// ======================================

function getHiddenMargins(el){
    const rect=getRect(el);

    if(!rect)
        return getMargins(el);

    const margins=getMargins(el);
    const axis=getLayoutAxis(el);
    const gap=getGap(el,axis);

    const size=
        axis==="horizontal"
            ?rect.width
            :rect.height;

    const total=
        size+
        (axis==="horizontal"
            ?margins.left+margins.right
            :margins.top+margins.bottom)+
        gap*2;

    const half=total/2;

    const hidden={
        ...margins
    };

    if(axis==="horizontal"){
        hidden.left=margins.left-half;
        hidden.right=margins.right-half;
    }else{
        hidden.top=margins.top-half;
        hidden.bottom=margins.bottom-half;
    }

    log(
        "HIDDEN MARGINS",
        getName(el),
        {
            axis,
            size:fmt(size),
            gap:fmt(gap),
            total:fmt(total),
            hidden
        }
    );

    return hidden;
}

// ======================================
// Stop
// ======================================

function stopSizeAnimation(el){
    if(!el)
        return;

    if(el._animationFrame){
        cancelAnimationFrame(
            el._animationFrame
        );
        el._animationFrame=null;
    }

    if(el._animationTimer){
        clearTimeout(
            el._animationTimer
        );
        el._animationTimer=null;
    }
}

// ======================================
// Clear
// ======================================

function clearSizeAnimationStyles(el){
    if(!el)
        return;

    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-right");
    el.style.removeProperty("margin-bottom");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("transition");
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el){
    if(!el)
        return;

    stopSizeAnimation(el);
    clearSizeAnimationStyles(el);

    log("CANCEL",getName(el));
}

// ======================================
// Easing
// ======================================

function easeOutCubic(progress){
    return 1-Math.pow(1-progress,3);
}

// ======================================
// Margin animation
// ======================================

function animateMargins(
    el,
    from,
    target,
    duration
){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const to={
        top:Number(target.top)||0,
        right:Number(target.right)||0,
        bottom:Number(target.bottom)||0,
        left:Number(target.left)||0
    };

    setMargins(el,from);
    forceLayout();

    const startTime=performance.now();

    return new Promise(resolve=>{

        function frame(now){

            const elapsed=
                now-startTime;

            const progress=
                Math.min(
                    1,
                    elapsed/duration
                );

            const eased=
                easeOutCubic(progress);

            const margin={
                top:
                    from.top+
                    (to.top-from.top)*eased,

                right:
                    from.right+
                    (to.right-from.right)*eased,

                bottom:
                    from.bottom+
                    (to.bottom-from.bottom)*eased,

                left:
                    from.left+
                    (to.left-from.left)*eased
            };

            setMargins(el,margin);

            if(progress<1){

                el._animationFrame=
                    requestAnimationFrame(frame);

                return;
            }

            el._animationFrame=null;

            setMargins(el,to);
            forceLayout();

            el._animationTimer=
                setTimeout(()=>{

                    el._animationTimer=null;

                    clearSizeAnimationStyles(el);

                    resolve();

                },20);
        }

        el._animationFrame=
            requestAnimationFrame(frame);
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animateMargins(
        el,
        hidden,
        visible,
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animateMargins(
        el,
        visible,
        hidden,
        COLLAPSE_DURATION
    );
}

// ======================================
// Resize
// ======================================

export function animateResize(el){
    if(!el)
        return Promise.resolve();

    log("RESIZE",getName(el));

    return Promise.resolve();
}
