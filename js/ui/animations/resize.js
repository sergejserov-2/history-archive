// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=4420;
const COLLAPSE_DURATION=4420;

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

function getPosition(el){
    const rect=el?.getBoundingClientRect();
    return rect?`${fmt(rect.top)},${fmt(rect.left)}`:"-";
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

function getCurrentMargin(el){
    const computed=window.getComputedStyle(el);

    return {
        top:parseFloat(computed.marginTop)||0,
        left:parseFloat(computed.marginLeft)||0
    };
}

function setMargin(el,top,left){
    el.style.setProperty("margin-top",`${top}px`,"important");
    el.style.setProperty("margin-left",`${left}px`,"important");
}

// ======================================
// End gap
// ======================================

function getEndGap(el,axis){
    const style=window.getComputedStyle(el);
    const parent=el?.parentElement;

    if(!parent)
        return 0;

    const parentStyle=window.getComputedStyle(parent);

    const margin=axis==="vertical"
        ?parseFloat(style.marginBottom)||0
        :parseFloat(style.marginRight)||0;

    const rowGap=parseFloat(parentStyle.rowGap)||0;
    const columnGap=parseFloat(parentStyle.columnGap)||0;

    const gap=axis==="vertical"?rowGap:columnGap;

    return margin||gap;
}

// ======================================
// Direction
// ======================================

function getAnimationDirection(el){
    const parent=el?.parentElement;

    if(!parent)
        return{
            axis:"vertical",
            sign:-1
        };

    const style=window.getComputedStyle(parent);
    const direction=style.direction||"ltr";
    const flexDirection=style.flexDirection||"row";

    const children=[
        ...parent.children
    ];

    const index=children.indexOf(el);

    const isColumn=
        flexDirection==="column"||
        flexDirection==="column-reverse";

    const isReverse=
        flexDirection==="row-reverse"||
        flexDirection==="column-reverse";

    if(isColumn){
        let sign=index>=children.length/2?1:-1;

        if(isReverse)
            sign*=-1;

        return{
            axis:"vertical",
            sign
        };
    }

    let sign=index>=children.length/2?1:-1;

    if(direction==="rtl")
        sign*=-1;

    if(isReverse)
        sign*=-1;

    return{
        axis:"horizontal",
        sign
    };
}

// ======================================
// Stop
// ======================================

function stopSizeAnimation(el){
    if(!el)
        return;

    if(el._animationFrame){
        cancelAnimationFrame(el._animationFrame);
        el._animationFrame=null;
    }

    if(el._animationTimer){
        clearTimeout(el._animationTimer);
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
// Hidden offset
// ======================================

function getHiddenOffset(el){
    const parent=el?.parentElement;

    if(!parent)
        return{
            top:-300,
            left:0
        };

    const elementRect=getRect(el);
    const parentRect=getRect(parent);

    if(!elementRect||!parentRect)
        return{
            top:-300,
            left:0
        };

    const direction=getAnimationDirection(el);

    const verticalGap=getEndGap(el,"vertical");
    const horizontalGap=getEndGap(el,"horizontal");

    if(direction.axis==="vertical"){
        const distance=elementRect.height+verticalGap;

        return{
            top:direction.sign<0
                ?-distance
                :distance,
            left:0
        };
    }

    const distance=elementRect.width+horizontalGap;

    return{
        top:0,
        left:direction.sign<0
            ?-distance
            :distance
    };
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

function animateMargins(el,target,duration){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);

    const to={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    setMargin(el,from.top,from.left);
    forceLayout();

    const startTime=performance.now();

    log("START",getName(el),{
        margin:`${fmt(from.top)},${fmt(from.left)}`,
        pos:getPosition(el)
    });

    return new Promise(resolve=>{
        function frame(now){
            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);
            const eased=easeOutCubic(progress);

            const top=
                from.top+
                (to.top-from.top)*eased;

            const left=
                from.left+
                (to.left-from.left)*eased;

            setMargin(el,top,left);

            if(progress<1){
                el._animationFrame=
                    requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);
            forceLayout();

            el._animationTimer=setTimeout(()=>{
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

    const current=getCurrentMargin(el);

    const hidden=getHiddenOffset(el);

    setMargin(
        el,
        hidden.top,
        hidden.left
    );

    forceLayout();

    log("EXPAND",getName(el),{
        from:`${fmt(hidden.top)},${fmt(hidden.left)}`,
        to:`${fmt(current.top)},${fmt(current.left)}`
    });

    return animateMargins(
        el,
        current,
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const hidden=getHiddenOffset(el);

    log("COLLAPSE",getName(el),{
        from:getCurrentMargin(el),
        to:hidden
    });

    return animateMargins(
        el,
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
