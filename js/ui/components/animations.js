// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=10420;
const COLLAPSE_DURATION=10420;
const END_GAP=14;

const DEBUG_ANIMATIONS=false;

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

function easeOutCubic(progress){
    return 1-Math.pow(1-progress,3);
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

    setMargin(el,from.top,from.left);
    forceLayout();

    const startPosition=getPosition(el);
    const startTime=performance.now();

    log("START",getName(el),{
        margin:`${fmt(from.top)},${fmt(from.left)}`,
        pos:startPosition
    });

    log("TARGET",getName(el),{
        margin:`${fmt(to.top)},${fmt(to.left)}`,
        delta:`${fmt(to.top-from.top)},${fmt(to.left-from.left)}`,
        duration
    });

    return new Promise(resolve=>{
        let frameNumber=0;

        function frame(now){
            frameNumber++;

            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);
            const eased=easeOutCubic(progress);

            const top=from.top+(to.top-from.top)*eased;
            const left=from.left+(to.left-from.left)*eased;

            setMargin(el,top,left);

            if(DEBUG_ANIMATIONS&&frameNumber<=3){
                log("FRAME",getName(el),frameNumber,{
                    t:fmt(elapsed),
                    p:fmt(progress),
                    pos:getPosition(el),
                    margin:`${fmt(top)},${fmt(left)}`
                });
            }

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);
            forceLayout();

            log("END",getName(el),{
                t:fmt(performance.now()-startTime),
                pos:getPosition(el)
            });

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;
                clearSizeAnimationStyles(el);

                if(typeof complete==="function")
                    complete();

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

    log("EXPAND",getName(el),{
        pos:getPosition(el),
        margin:getCurrentMargin(el)
    });

    const hidden=getHiddenOffset(el);

    log("EXPAND HIDDEN",getName(el),{
        top:fmt(hidden.top),
        left:fmt(hidden.left)
    });

    setMargin(el,hidden.top,hidden.left);
    forceLayout();

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

    log("COLLAPSE",getName(el),{
        pos:getPosition(el),
        margin:getCurrentMargin(el)
    });

    const hidden=getHiddenOffset(el);

    log("HIDDEN",getName(el),{
        top:fmt(hidden.top),
        left:fmt(hidden.left)
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
