// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 10420;
const COLLAPSE_DURATION = 10420;
const END_GAP = 14;

const DEBUG_ANIMATIONS = true;

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

function logState(label,el){
    if(!DEBUG_ANIMATIONS||!el)
        return;

    const margin=getCurrentMargin(el);
    const rect=getRect(el);

    console.log(`[animations] ${label}`,{
        margin:`${margin.top.toFixed(2)},${margin.left.toFixed(2)}`,
        pos:rect?`${rect.top.toFixed(2)},${rect.left.toFixed(2)}`:"?",
        size:rect?`${rect.width.toFixed(2)}x${rect.height.toFixed(2)}`:"?"
    });
}

// ======================================
// Geometry
// ======================================

function getRect(el){
    return el?.getBoundingClientRect()||null;
}

// ======================================
// Current margin
// ======================================

function getCurrentMargin(el){
    const computed=getComputedStyle(el);

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

    if(!parent)
        return {
            top:-300-END_GAP,
            left:-100-END_GAP
        };

    const elementRect=getRect(el);
    const parentRect=getRect(parent);

    if(!elementRect||!parentRect)
        return {
            top:-300-END_GAP,
            left:-100-END_GAP
        };

    const top=parentRect.top-elementRect.bottom-END_GAP;

    const distanceLeft=Math.abs(elementRect.left-parentRect.left);
    const distanceRight=Math.abs(parentRect.right-elementRect.right);

    let left;

    if(distanceLeft<=distanceRight)
        left=parentRect.left-elementRect.right-END_GAP;
    else
        left=parentRect.right-elementRect.left+END_GAP;

    return {top,left};
}

// ======================================
// Margin animation
// ======================================

function animateMargins(el,to,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);
    const startRect=getRect(el);
    const startTime=performance.now();

    logState("START",el);

    log("TARGET",getName(el),{
        margin:`${to.top},${to.left}`,
        pos:startRect?`${startRect.top.toFixed(2)},${startRect.left.toFixed(2)}`:"?",
        duration
    });

    return new Promise(resolve=>{
        let frameNumber=0;

        function frame(now){
            frameNumber++;

            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);

            const top=from.top+(to.top-from.top)*progress;
            const left=from.left+(to.left-from.left)*progress;

            setMargin(el,top,left);

            if(frameNumber<=3||progress>=1)
                logState(`FRAME ${frameNumber} ${elapsed.toFixed(1)}ms`,el);

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);

            logState("BEFORE CLEAR",el);

            clearSizeAnimationStyles(el);

            logState("END",el);

            if(typeof complete==="function")
                complete();

            resolve();
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

    logState("EXPAND CALL",el);

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

    logState("COLLAPSE CALL",el);

    const hidden=getHiddenOffset(el);

    log("HIDDEN TARGET",getName(el),hidden);
    logState("COLLAPSE TARGET",el);

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
