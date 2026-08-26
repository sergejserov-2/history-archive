// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=1420;
const COLLAPSE_DURATION=1420;

const END_GAP=14;

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

function snapshot(el){
    if(!el)
        return null;

    const rect=getRect(el);
    const parent=el.parentElement;
    const parentRect=getRect(parent);

    return {
        margin:getCurrentMargin(el),
        elementRect:rect
            ? {
                top:rect.top,
                bottom:rect.bottom,
                left:rect.left,
                right:rect.right,
                width:rect.width,
                height:rect.height
            }
            : null,
        parentRect:parentRect
            ? {
                top:parentRect.top,
                bottom:parentRect.bottom,
                left:parentRect.left,
                right:parentRect.right,
                width:parentRect.width,
                height:parentRect.height
            }
            : null
    };
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

    log("STOP",getName(el),snapshot(el));
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

    log("CANCEL BEFORE",getName(el),snapshot(el));

    stopSizeAnimation(el);
    clearSizeAnimationStyles(el);

    log("CANCEL AFTER",getName(el),snapshot(el));
}

// ======================================
// Margin
// ======================================

function setMargin(el,top,left){
    el.style.setProperty(
        "margin-top",
        `${top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${left}px`,
        "important"
    );
}

// ======================================
// Hidden offset
// ======================================

function getHiddenOffset(el){
    const parent=el?.parentElement;

    if(!parent){
        const result={
            top:-300-END_GAP,
            left:-100-END_GAP
        };

        log(
            "HIDDEN NO PARENT",
            getName(el),
            result
        );

        return result;
    }

    const elementRect=getRect(el);
    const parentRect=getRect(parent);

    if(!elementRect||!parentRect){
        const result={
            top:-300-END_GAP,
            left:-100-END_GAP
        };

        log(
            "HIDDEN NO RECT",
            getName(el),
            {
                result,
                elementRect,
                parentRect
            }
        );

        return result;
    }

    const hiddenTop=
        parentRect.top-
        elementRect.bottom;

    const top=
        hiddenTop-
        END_GAP;

    const distanceLeft=
        Math.abs(
            elementRect.left-
            parentRect.left
        );

    const distanceRight=
        Math.abs(
            parentRect.right-
            elementRect.right
        );

    let left;

    if(distanceLeft<=distanceRight){
        const hiddenLeft=
            parentRect.left-
            elementRect.right;

        left=
            hiddenLeft-
            END_GAP;
    }else{
        const hiddenLeft=
            parentRect.right-
            elementRect.left;

        left=
            hiddenLeft+
            END_GAP;
    }

    const result={
        top,
        left
    };

    log(
        "HIDDEN CALCULATED",
        getName(el),
        {
            elementRect:{
                top:elementRect.top,
                bottom:elementRect.bottom,
                left:elementRect.left,
                right:elementRect.right,
                width:elementRect.width,
                height:elementRect.height
            },
            parentRect:{
                top:parentRect.top,
                bottom:parentRect.bottom,
                left:parentRect.left,
                right:parentRect.right,
                width:parentRect.width,
                height:parentRect.height
            },
            hiddenTop,
            distanceLeft,
            distanceRight,
            END_GAP,
            result
        }
    );

    return result;
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

function animateMargins(
    el,
    target,
    duration,
    complete
){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const from=getCurrentMargin(el);

    const to={
        top:Number(target.top)||0,
        left:Number(target.left)||0
    };

    log(
        "========================================"
    );

    log(
        "ANIMATION START",
        getName(el)
    );

    log(
        "FROM",
        from
    );

    log(
        "TO",
        to
    );

    log(
        "DURATION",
        duration
    );

    log(
        "INITIAL SNAPSHOT",
        snapshot(el)
    );

    return new Promise(resolve=>{

        const startTime=performance.now();
        let frameNumber=0;

        function frame(now){

            frameNumber++;

            const elapsed=
                now-
                startTime;

            const progress=
                Math.min(
                    1,
                    elapsed/duration
                );

            const eased=
                easeInOut(progress);

            const top=
                from.top+
                (
                    to.top-
                    from.top
                )*
                eased;

            const left=
                from.left+
                (
                    to.left-
                    from.left
                )*
                eased;

            const before=snapshot(el);

            setMargin(
                el,
                top,
                left
            );

            const after=snapshot(el);

            if(
                DEBUG_ANIMATIONS &&
                (
                    frameNumber<=5||
                    (
                        progress>=.25&&
                        progress<=.55
                    )||
                    progress>=.95
                )
            ){

                log(
                    "FRAME",
                    {
                        frame:frameNumber,
                        elapsed,
                        progress,
                        eased,
                        calculatedMargin:{
                            top,
                            left
                        },
                        before,
                        after
                    }
                );

            }

            if(progress<1){

                el._animationFrame=
                    requestAnimationFrame(
                        frame
                    );

                return;
            }

            el._animationFrame=null;

            setMargin(
                el,
                to.top,
                to.left
            );

            log(
                "FINAL MARGIN SET",
                getName(el),
                {
                    margin:getCurrentMargin(el),
                    snapshot:snapshot(el)
                }
            );

            el._animationTimer=
                setTimeout(()=>{

                    el._animationTimer=null;

                    log(
                        "BEFORE CLEAR",
                        getName(el),
                        snapshot(el)
                    );

                    clearSizeAnimationStyles(el);

                    log(
                        "AFTER CLEAR",
                        getName(el),
                        snapshot(el)
                    );

                    if(
                        typeof complete===
                        "function"
                    )
                        complete();

                    log(
                        "ANIMATION END",
                        getName(el)
                    );

                    log(
                        "========================================"
                    );

                    resolve();

                },20);
        }

        log(
            "FIRST RAF SCHEDULED",
            getName(el)
        );

        el._animationFrame=
            requestAnimationFrame(
                frame
            );
    });
}

// ======================================
// Expand
// ======================================

export function animateExpand(el){

    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const current=
        getCurrentMargin(el);

    log(
        "******** EXPAND ********",
        getName(el)
    );

    log(
        "EXPAND BEFORE",
        {
            current,
            snapshot:snapshot(el)
        }
    );

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

    const current=
        getCurrentMargin(el);

    log(
        "******** COLLAPSE ********",
        getName(el)
    );

    log(
        "COLLAPSE BEFORE HIDDEN",
        {
            current,
            snapshot:snapshot(el)
        }
    );

    const hidden=
        getHiddenOffset(el);

    log(
        "COLLAPSE AFTER HIDDEN",
        {
            current:getCurrentMargin(el),
            hidden,
            snapshot:snapshot(el)
        }
    );

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

    log(
        "RESIZE",
        getName(el),
        snapshot(el)
    );

    return Promise.resolve();
}
