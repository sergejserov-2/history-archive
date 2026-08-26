// ======================================
// Universal geometry animations
// Margin + size
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

function getState(el){
    const rect=el?.getBoundingClientRect();
    const margin=getCurrentMargin(el);

    return {
        margin,
        rect:rect?{
            top:rect.top,
            left:rect.left,
            width:rect.width,
            height:rect.height
        }:null
    };
}

function logState(label,el,extra={}){
    if(!DEBUG_ANIMATIONS)
        return;

    const state=getState(el);

    log(label,getName(el),{
        margin:state.margin?`${fmt(state.margin.top)},${fmt(state.margin.left)}`:"-",
        pos:state.rect?`${fmt(state.rect.top)},${fmt(state.rect.left)}`:"-",
        size:state.rect?`${fmt(state.rect.width)}x${fmt(state.rect.height)}`:"-",
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
// Size
// ======================================

function getCurrentSize(el){
    const rect=getRect(el);

    if(!rect)
        return {
            width:0,
            height:0
        };

    return {
        width:rect.width,
        height:rect.height
    };
}

function setSize(el,width,height){
    el.style.setProperty("width",`${Math.max(0,width)}px`,"important");
    el.style.setProperty("height",`${Math.max(0,height)}px`,"important");
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
    el.style.removeProperty("width");
    el.style.removeProperty("height");
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
// Easing
// ======================================

function easeInOutCubic(progress){
    return progress<0.5
        ?4*progress*progress*progress
        :1-Math.pow(-2*progress+2,3)/2;
}

// ======================================
// Animation
// ======================================

function animateGeometry(el,target,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const startRect=getRect(el);
    const startMargin=getCurrentMargin(el);
    const startSize=getCurrentSize(el);

    if(!startRect)
        return Promise.resolve();

    const toMargin={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    const toSize={
        width:Number(target.width),
        height:Number(target.height)
    };

    if(!Number.isFinite(toSize.width))
        toSize.width=startSize.width;

    if(!Number.isFinite(toSize.height))
        toSize.height=startSize.height;

    logState("START",el,{
        targetMargin:`${fmt(toMargin.top)},${fmt(toMargin.left)}`,
        targetSize:`${fmt(toSize.width)}x${fmt(toSize.height)}`,
        duration
    });

    setMargin(el,startMargin.top,startMargin.left);
    setSize(el,startSize.width,startSize.height);
    forceLayout();

    const startTime=performance.now();
    let frameNumber=0;

    return new Promise(resolve=>{
        function frame(now){
            frameNumber++;

            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);
            const eased=easeInOutCubic(progress);

            const marginTop=startMargin.top+(toMargin.top-startMargin.top)*eased;
            const marginLeft=startMargin.left+(toMargin.left-startMargin.left)*eased;
            const width=startSize.width+(toSize.width-startSize.width)*eased;
            const height=startSize.height+(toSize.height-startSize.height)*eased;

            setMargin(el,marginTop,marginLeft);
            setSize(el,width,height);

            if(DEBUG_ANIMATIONS&&(frameNumber<=3||progress>=1)){
                const rect=getRect(el);

                log("FRAME",getName(el),frameNumber,{
                    t:fmt(elapsed),
                    p:fmt(progress),
                    eased:fmt(eased),
                    margin:`${fmt(marginTop)},${fmt(marginLeft)}`,
                    pos:rect?`${fmt(rect.top)},${fmt(rect.left)}`:"-",
                    size:rect?`${fmt(rect.width)}x${fmt(rect.height)}`:"-"
                });
            }

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,toMargin.top,toMargin.left);
            setSize(el,toSize.width,toSize.height);
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

    const current=getCurrentSize(el);

    return animateGeometry(
        el,
        {
            top:0,
            left:0,
            width:current.width,
            height:current.height
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
    const current=getCurrentSize(el);

    return animateGeometry(
        el,
        {
            top:hidden.top,
            left:hidden.left,
            width:current.width,
            height:0
        },
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
