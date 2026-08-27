// ======================================
// Universal geometry animations
// Margin based
// ======================================

const EXPAND_DURATION=420;
const COLLAPSE_DURATION=420;

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

function getMargins(el){
    const style=window.getComputedStyle(el);

    return{
        top:parseFloat(style.marginTop)||0,
        right:parseFloat(style.marginRight)||0,
        bottom:parseFloat(style.marginBottom)||0,
        left:parseFloat(style.marginLeft)||0
    };
}

function setMargins(el,margin){
    el.style.setProperty(
        "margin-top",
        `${margin.top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-right",
        `${margin.right}px`,
        "important"
    );

    el.style.setProperty(
        "margin-bottom",
        `${margin.bottom}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${margin.left}px`,
        "important"
    );
}

// ======================================
// Gap
// ======================================

function getGaps(el){
    const parent=el?.parentElement;

    if(!parent)
        return{
            row:0,
            column:0
        };

    const style=window.getComputedStyle(parent);

    return{
        row:parseFloat(style.rowGap)||0,
        column:parseFloat(style.columnGap)||0
    };
}

// ======================================
// Neighbours
// ======================================

function getNeighbours(el){
    const parent=el?.parentElement;

    if(!parent)
        return{
            top:null,
            right:null,
            bottom:null,
            left:null
        };

    const rect=getRect(el);

    if(!rect)
        return{
            top:null,
            right:null,
            bottom:null,
            left:null
        };

    const children=[
        ...parent.children
    ].filter(child=>child!==el);

    let top=null;
    let right=null;
    let bottom=null;
    let left=null;

    let topDistance=Infinity;
    let rightDistance=Infinity;
    let bottomDistance=Infinity;
    let leftDistance=Infinity;

    for(const child of children){

        const childRect=getRect(child);

        if(!childRect)
            continue;

        if(childRect.bottom<=rect.top){
            const distance=rect.top-childRect.bottom;

            if(distance<topDistance){
                topDistance=distance;
                top=child;
            }
        }

        if(childRect.top>=rect.bottom){
            const distance=childRect.top-rect.bottom;

            if(distance<bottomDistance){
                bottomDistance=distance;
                bottom=child;
            }
        }

        if(childRect.right<=rect.left){
            const distance=rect.left-childRect.right;

            if(distance<leftDistance){
                leftDistance=distance;
                left=child;
            }
        }

        if(childRect.left>=rect.right){
            const distance=childRect.left-rect.right;

            if(distance<rightDistance){
                rightDistance=distance;
                right=child;
            }
        }
    }

    return{
        top,
        right,
        bottom,
        left
    };
}

// ======================================
// Stop
// ======================================

function stopSizeAnimation(el){
    if(!el)
        return;

    if(el._animationFrame){
        cancelAnimationFrame(
            el._animationFrame
        );
        el._animationFrame=null;
    }

    if(el._animationTimer){
        clearTimeout(
            el._animationTimer
        );
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
    el.style.removeProperty("margin-right");
    el.style.removeProperty("margin-bottom");
    el.style.removeProperty("margin-left");
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
// Hidden margins
// ======================================

function getHiddenMargins(el){
    const rect=getRect(el);
    const parent=el?.parentElement;

    if(!rect||!parent)
        return getMargins(el);

    const parentRect=getRect(parent);
    const margins=getMargins(el);
    const gaps=getGaps(el);
    const neighbours=getNeighbours(el);

    if(!parentRect)
        return margins;

    const hidden={
        ...margins
    };

    const hasTop=!!neighbours.top;
    const hasBottom=!!neighbours.bottom;
    const hasLeft=!!neighbours.left;
    const hasRight=!!neighbours.right;

    // Horizontal neighbours
    if(hasLeft||hasRight){

        const leftDistance=
            hasLeft
                ?rect.left-
                 getRect(neighbours.left).right+
                 gaps.column+
                 margins.left
                :0;

        const rightDistance=
            hasRight
                ?getRect(neighbours.right).left-
                 rect.right+
                 gaps.column+
                 margins.right
                :0;

        if(hasLeft&&hasRight){

            const half=
                (leftDistance+rightDistance)/2;

            hidden.left=
                margins.left-half;

            hidden.right=
                margins.right-half;

        }else if(hasLeft){

            hidden.left=
                margins.left-leftDistance;

        }else{

            hidden.right=
                margins.right-rightDistance;
        }
    }

    // Vertical neighbours
    if(hasTop||hasBottom){

        const topDistance=
            hasTop
                ?rect.top-
                 getRect(neighbours.top).bottom+
                 gaps.row+
                 margins.top
                :0;

        const bottomDistance=
            hasBottom
                ?getRect(neighbours.bottom).top-
                 rect.bottom+
                 gaps.row+
                 margins.bottom
                :0;

        if(hasTop&&hasBottom){

            const half=
                (topDistance+bottomDistance)/2;

            hidden.top=
                margins.top-half;

            hidden.bottom=
                margins.bottom-half;

        }else if(hasTop){

            hidden.top=
                margins.top-topDistance;

        }else{

            hidden.bottom=
                margins.bottom-bottomDistance;
        }
    }

    log(
        "HIDDEN MARGINS",
        getName(el),
        {
            neighbours:{
                top:!!neighbours.top,
                right:!!neighbours.right,
                bottom:!!neighbours.bottom,
                left:!!neighbours.left
            },
            margins,
            hidden
        }
    );

    return hidden;
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

function animateMargins(
    el,
    from,
    target,
    duration
){
    if(!el)
        return Promise.resolve();

    stopSizeAnimation(el);

    const to={
        top:Number(target.top)||0,
        right:Number(target.right)||0,
        bottom:Number(target.bottom)||0,
        left:Number(target.left)||0
    };

    setMargins(el,from);
    forceLayout();

    const startTime=performance.now();

    return new Promise(resolve=>{

        function frame(now){

            const elapsed=
                now-startTime;

            const progress=
                Math.min(
                    1,
                    elapsed/duration
                );

            const eased=
                easeOutCubic(progress);

            const margin={
                top:
                    from.top+
                    (to.top-from.top)*eased,

                right:
                    from.right+
                    (to.right-from.right)*eased,

                bottom:
                    from.bottom+
                    (to.bottom-from.bottom)*eased,

                left:
                    from.left+
                    (to.left-from.left)*eased
            };

            setMargins(el,margin);

            if(progress<1){

                el._animationFrame=
                    requestAnimationFrame(frame);

                return;
            }

            el._animationFrame=null;

            setMargins(el,to);
            forceLayout();

            el._animationTimer=
                setTimeout(()=>{

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

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animateMargins(
        el,
        hidden,
        visible,
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animateMargins(
        el,
        visible,
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
