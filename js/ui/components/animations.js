// ======================================
// Universal geometry animations
// Position based
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

function fmt(value){
    return Number(value).toFixed(2);
}

function pos(el){
    const r=el?.getBoundingClientRect();
    return r?{x:r.left,y:r.top}:null;
}

function size(el){
    const r=el?.getBoundingClientRect();
    return r?{w:r.width,h:r.height}:null;
}

function state(el){
    const p=pos(el);
    const s=size(el);
    return {
        pos:p?`${fmt(p.x)},${fmt(p.y)}`:"-",
        size:s?`${fmt(s.w)}x${fmt(s.h)}`:"-"
    };
}

// ======================================
// Layout
// ======================================

function forceLayout(){
    document.documentElement.offsetHeight;
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
    el.style.removeProperty("transform");
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
// Hidden position
// ======================================

function getHiddenOffset(el){
    const parent=el?.parentElement;

    if(!parent)
        return {top:-300-END_GAP,left:-100-END_GAP};

    const elementRect=el.getBoundingClientRect();
    const parentRect=parent.getBoundingClientRect();

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

function ease(progress){
    return 1-Math.pow(1-progress,3);
}

// ======================================
// Position animation
// ======================================

function animatePosition(el,target,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const start=pos(el);

    if(!start)
        return Promise.resolve();

    const targetMargin={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    log("START",getName(el),{
        pos:`${fmt(start.x)},${fmt(start.y)}`
    });

    setMargin(el,targetMargin.top,targetMargin.left);
    forceLayout();

    const end=pos(el);

    if(!end){
        clearSizeAnimationStyles(el);
        return Promise.resolve();
    }

    const dx=end.x-start.x;
    const dy=end.y-start.y;

    el.style.setProperty("transform","translate(0px,0px)","important");
    forceLayout();

    log("TARGET",getName(el),{
        pos:`${fmt(end.x)},${fmt(end.y)}`,
        delta:`${fmt(dx)},${fmt(dy)}`,
        duration
    });

    // Return layout to the visual starting position.
    el.style.setProperty("transform",`translate(${dx}px,${dy}px)`,"important");
    forceLayout();

    const startTime=performance.now();
    let frameNumber=0;

    return new Promise(resolve=>{
        function frame(now){
            frameNumber++;

            const elapsed=now-startTime;
            const progress=Math.min(1,elapsed/duration);
            const eased=ease(progress);

            const x=dx*(1-eased);
            const y=dy*(1-eased);

            el.style.setProperty("transform",`translate(${x}px,${y}px)`,"important");

            if(DEBUG_ANIMATIONS&&(frameNumber<=3||progress>=1)){
                const p=pos(el);
                log("FRAME",getName(el),frameNumber,{
                    t:fmt(elapsed),
                    p:p?`${fmt(p.x)},${fmt(p.y)}`:"-",
                    move:`${fmt(x)},${fmt(y)}`
                });
            }

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,targetMargin.top,targetMargin.left);
            el.style.removeProperty("transform");
            forceLayout();

            log("END",getName(el),state(el));

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

    log("EXPAND CALL",getName(el),state(el));

    return animatePosition(
        el,
        {top:0,left:0},
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    log("COLLAPSE CALL",getName(el),state(el));

    const hidden=getHiddenOffset(el);

    log("HIDDEN TARGET",getName(el),hidden);

    return animatePosition(
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
