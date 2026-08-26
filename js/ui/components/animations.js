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

function fmt(n){
    return Number(n||0).toFixed(2);
}

function logState(label,el,extra={}){
    if(!DEBUG_ANIMATIONS)
        return;
    const rect=el?.getBoundingClientRect();
    const margin=getCurrentMargin(el);
    log(label,getName(el),{
        margin:`${fmt(margin.top)},${fmt(margin.left)}`,
        pos:rect?`${fmt(rect.top)},${fmt(rect.left)}`:"-",
        size:rect?`${fmt(rect.width)}x${fmt(rect.height)}`:"-",
        ...extra
    });
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

    return {top,left};
}

// ======================================
// Margin animation
// ======================================

function animateMargins(el,target,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const startRect=getRect(el);
    const startMargin=getCurrentMargin(el);

    if(!startRect)
        return Promise.resolve();

    const to={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    logState("START",el);

    // Сначала ставим текущее значение без изменения геометрии.
    setMargin(el,startMargin.top,startMargin.left);
    forceLayout();

    const lockedRect=getRect(el);

    if(!lockedRect)
        return Promise.resolve();

    const start={
        top:startMargin.top,
        left:startMargin.left,
        rectTop:lockedRect.top,
        rectLeft:lockedRect.left
    };

    log("TARGET",getName(el),{
        margin:`${fmt(to.top)},${fmt(to.left)}`,
        startPos:`${fmt(start.rectTop)},${fmt(start.rectLeft)}`,
        delta:`${fmt(to.top-start.top)},${fmt(to.left-start.left)}`,
        duration
    });

    const startTime=performance.now();
    let frameNumber=0;

    return new Promise(resolve=>{
        function frame(now){
            frameNumber++;

            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);

            const expectedTop=start.top+(to.top-start.top)*progress;
            const expectedLeft=start.left+(to.left-start.left)*progress;

            setMargin(el,expectedTop,expectedLeft);

            forceLayout();

            const rect=getRect(el);

            if(rect){
                const driftTop=rect.top-start.rectTop;
                const driftLeft=rect.left-start.rectLeft;

                if(Math.abs(driftTop)>0.01||Math.abs(driftLeft)>0.01){
                    const correctedTop=expectedTop-driftTop;
                    const correctedLeft=expectedLeft-driftLeft;

                    setMargin(el,correctedTop,correctedLeft);
                    forceLayout();
                }
            }

            if(DEBUG_ANIMATIONS&&(frameNumber<=3||progress>=1)){
                const current=getRect(el);
                log("FRAME",getName(el),frameNumber,{
                    t:fmt(elapsed),
                    p:current?`${fmt(current.top)},${fmt(current.left)}`:"-",
                    move:current?`${fmt(current.top-start.rectTop)},${fmt(current.left-start.rectLeft)}`:"-",
                    margin:current?`${fmt(getCurrentMargin(el).top)},${fmt(getCurrentMargin(el).left)}`:"-"
                });
            }

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);
            forceLayout();

            logState("BEFORE CLEAR",el);

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;
                clearSizeAnimationStyles(el);

                if(typeof complete==="function")
                    complete();

                logState("END",el);

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
