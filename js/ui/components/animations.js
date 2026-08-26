// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 6420;
const COLLAPSE_DURATION = 6420;

const START_GAP = 140;
const END_GAP = 14;

const DEBUG_ANIMATIONS = false;

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

// ======================================
// Geometry
// ======================================

function getRect(el){
    return el?.getBoundingClientRect()||null;
}

function forceLayout(){
    document.documentElement.offsetHeight;
}

// ======================================
// Current margin
// ======================================

function getCurrentMargin(el){
    const computed=window.getComputedStyle(el);

    return {
        top:parseFloat(computed.marginTop)||0,
        left:parseFloat(computed.marginLeft)||0
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

    log("STOP",getName(el));
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
// Margin
// ======================================

function setMargin(el,top,left){
    el.style.setProperty("margin-top",`${top}px`,"important");
    el.style.setProperty("margin-left",`${left}px`,"important");
}

// ======================================
// Hidden offset
// ======================================

function getHiddenOffset(el){
    const parent=el?.parentElement;

    if(!parent){
        return {
            top:-300-END_GAP,
            left:-100-END_GAP
        };
    }

    const elementRect=getRect(el);
    const parentRect=getRect(parent);

    if(!elementRect||!parentRect){
        return {
            top:-300-END_GAP,
            left:-100-END_GAP
        };
    }

    const hiddenTop=parentRect.top-elementRect.bottom;
    const top=hiddenTop-END_GAP;

    const distanceLeft=Math.abs(elementRect.left-parentRect.left);
    const distanceRight=Math.abs(parentRect.right-elementRect.right);

    let left;

    if(distanceLeft<=distanceRight){
        const hiddenLeft=parentRect.left-elementRect.right;
        left=hiddenLeft-END_GAP;
    }else{
        const hiddenLeft=parentRect.right-elementRect.left;
        left=hiddenLeft+END_GAP;
    }

    return {
        top,
        left
    };
}

// ======================================
// Easing
// ======================================

function easeInOut(progress){
    return (1-Math.cos(progress*Math.PI))/2;
}

// ======================================
// Margin animation
// ======================================

function animateMargins(el,target,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);

    const to={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    log("START",getName(el),{
        from,
        to,
        duration
    });

    return new Promise(resolve=>{
        const startTime=performance.now();

        function frame(now){
            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);
            const eased=easeInOut(progress);

            const top=from.top+(to.top-from.top)*eased;
            const left=from.left+(to.left-from.left)*eased;

            setMargin(el,top,left);

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;

                clearSizeAnimationStyles(el);

                if(typeof complete==="function")
                    complete();

                log("END",getName(el));

                resolve();
            },20);
        }

        el._animationFrame=requestAnimationFrame(frame);
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const current=getCurrentMargin(el);

    return animateMargins(
        el,
        {
            top:0,
            left:0
        },
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    // Стартовая позиция: +14 px от обычной
    setMargin(el,START_GAP,START_GAP);

    forceLayout();

    const hidden=getHiddenOffset(el);

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
