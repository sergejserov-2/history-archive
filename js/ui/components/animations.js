// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION = 10420;
const COLLAPSE_DURATION = 10420;
const END_GAP = 14;

const DEBUG_ANIMATIONS = false;

function log(...args){
    if(DEBUG_ANIMATIONS)
        console.log("[animations]",...args);
}

function getName(el){
    return el?.id||el?.className||el?.tagName||"element";
}

function getRect(el){
    return el?.getBoundingClientRect()||null;
}

function getCurrentMargin(el){
    const computed=getComputedStyle(el);
    return {
        top:parseFloat(computed.marginTop)||0,
        left:parseFloat(computed.marginLeft)||0
    };
}

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

function clearSizeAnimationStyles(el){
    if(!el)
        return;

    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-left");
    el.style.removeProperty("transition");
}

export function cancelSizeAnimation(el){
    if(!el)
        return;

    stopSizeAnimation(el);
    clearSizeAnimationStyles(el);
}

function setMargin(el,top,left){
    el.style.setProperty("margin-top",`${top}px`,"important");
    el.style.setProperty("margin-left",`${left}px`,"important");
}

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

function animateMargins(el,to,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);
    const startTime=performance.now();

    log("ANIMATION START",getName(el),{from,to,duration});

    return new Promise(resolve=>{
        function frame(now){
            const progress=Math.min(1,(now-startTime)/duration);

            setMargin(
                el,
                from.top+(to.top-from.top)*progress,
                from.left+(to.left-from.left)*progress
            );

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;
            setMargin(el,to.top,to.left);

            clearSizeAnimationStyles(el);

            if(typeof complete==="function")
                complete();

            resolve();
        }

        el._animationFrame=requestAnimationFrame(frame);
    });
}

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    return animateMargins(el,{top:0,left:0},EXPAND_DURATION);
}

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    return animateMargins(el,getHiddenOffset(el),COLLAPSE_DURATION);
}

export function animateResize(el){
    if(!el)
        return Promise.resolve();

    return Promise.resolve();
}
