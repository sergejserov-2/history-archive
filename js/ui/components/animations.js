// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=1420;
const COLLAPSE_DURATION=1420;
const END_GAP=14;
const DEBUG_ANIMATIONS=true;
const GEOMETRY_EPSILON=1;

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

function forceLayout(){
    document.documentElement.offsetHeight;
}

function getCurrentMargin(el){
    const computed=window.getComputedStyle(el);
    return {
        top:parseFloat(computed.marginTop)||0,
        left:parseFloat(computed.marginLeft)||0
    };
}

function getGeometry(el){
    const rect=getRect(el);
    const parentRect=getRect(el?.parentElement);
    if(!rect||!parentRect)
        return null;
    return {
        margin:getCurrentMargin(el),
        element:{
            left:rect.left,
            top:rect.top,
            right:rect.right,
            bottom:rect.bottom,
            width:rect.width,
            height:rect.height
        },
        parent:{
            left:parentRect.left,
            top:parentRect.top,
            right:parentRect.right,
            bottom:parentRect.bottom,
            width:parentRect.width,
            height:parentRect.height
        }
    };
}

function geometryDiff(a,b){
    if(!a||!b)
        return null;
    return {
        element:{
            left:b.element.left-a.element.left,
            top:b.element.top-a.element.top,
            width:b.element.width-a.element.width,
            height:b.element.height-a.element.height
        },
        parent:{
            left:b.parent.left-a.parent.left,
            top:b.parent.top-a.parent.top,
            width:b.parent.width-a.parent.width,
            height:b.parent.height-a.parent.height
        }
    };
}

function hasGeometryJump(diff){
    if(!diff)
        return false;
    return Math.abs(diff.element.left)>GEOMETRY_EPSILON||
        Math.abs(diff.element.top)>GEOMETRY_EPSILON||
        Math.abs(diff.element.width)>GEOMETRY_EPSILON||
        Math.abs(diff.element.height)>GEOMETRY_EPSILON||
        Math.abs(diff.parent.left)>GEOMETRY_EPSILON||
        Math.abs(diff.parent.top)>GEOMETRY_EPSILON||
        Math.abs(diff.parent.width)>GEOMETRY_EPSILON||
        Math.abs(diff.parent.height)>GEOMETRY_EPSILON;
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
    log("STOP",getName(el),getGeometry(el));
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
    log("CANCEL",getName(el));
}

function setMargin(el,top,left){
    el.style.setProperty("margin-top",`${top}px`,"important");
    el.style.setProperty("margin-left",`${left}px`,"important");
}

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

    return {top,left};
}

function easeInOut(progress){
    return (1-Math.cos(progress*Math.PI))/2;
}

function animateMargins(el,target,duration,complete){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);
    const to={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    const initialGeometry=getGeometry(el);

    log("========================================");
    log("ANIMATION START",getName(el));
    log("FROM",from);
    log("TO",to);
    log("DURATION",duration);
    log("INITIAL GEOMETRY",initialGeometry);

    return new Promise(resolve=>{
        const startTime=performance.now();
        let frameNumber=0;
        let previousGeometry=initialGeometry;
        let previousElapsed=0;
        let previousEased=0;

        function frame(now){
            frameNumber++;

            const elapsed=Math.max(0,now-startTime);
            const progress=Math.min(1,elapsed/duration);
            const eased=easeInOut(progress);

            const top=from.top+(to.top-from.top)*eased;
            const left=from.left+(to.left-from.left)*eased;

            setMargin(el,top,left);
            forceLayout();

            const geometry=getGeometry(el);
            const diff=geometryDiff(previousGeometry,geometry);

            if(
                frameNumber<=3||
                progress>=0.25&&progress<=0.4||
                progress>=0.95||
                hasGeometryJump(diff)
            ){
                log("FRAME",{
                    frame:frameNumber,
                    elapsed,
                    elapsedDelta:elapsed-previousElapsed,
                    progress,
                    eased,
                    easedDelta:eased-previousEased,
                    margin:{
                        top,
                        left
                    },
                    geometry,
                    diff
                });
            }

            if(hasGeometryJump(diff)){
                log("******** GEOMETRY CHANGE ********",{
                    frame:frameNumber,
                    progress,
                    diff,
                    geometry
                });
            }

            previousGeometry=geometry;
            previousElapsed=elapsed;
            previousEased=eased;

            if(progress<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            setMargin(el,to.top,to.left);
            forceLayout();

            const finalGeometry=getGeometry(el);

            log("FINAL MARGIN SET",{
                margin:getCurrentMargin(el),
                geometry:finalGeometry
            });

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;

                const beforeClear=getGeometry(el);

                log("BEFORE CLEAR",{
                    margin:getCurrentMargin(el),
                    geometry:beforeClear
                });

                clearSizeAnimationStyles(el);
                forceLayout();

                const afterClear=getGeometry(el);

                log("AFTER CLEAR",{
                    margin:getCurrentMargin(el),
                    geometry:afterClear,
                    diff:geometryDiff(beforeClear,afterClear)
                });

                if(typeof complete==="function")
                    complete();

                log("ANIMATION END",getName(el));
                log("========================================");

                resolve();
            },20);
        }

        el._animationFrame=requestAnimationFrame(frame);
        log("FIRST RAF SCHEDULED");
    });
}

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    log("******** EXPAND ********",getName(el));

    return animateMargins(
        el,
        {
            top:0,
            left:0
        },
        EXPAND_DURATION
    );
}

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    log("******** COLLAPSE ********",getName(el));

    const before=getGeometry(el);

    log("COLLAPSE BEFORE HIDDEN",before);

    const hidden=getHiddenOffset(el);

    const after=getGeometry(el);

    log("COLLAPSE AFTER HIDDEN",{
        current:after,
        hidden,
        geometryDiff:geometryDiff(before,after)
    });

    return animateMargins(
        el,
        hidden,
        COLLAPSE_DURATION
    );
}

export function animateResize(el){
    if(!el)
        return Promise.resolve();

    log("RESIZE",getName(el),getGeometry(el));

    return Promise.resolve();
}
