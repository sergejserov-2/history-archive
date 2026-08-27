// ======================================
// Universal geometry animations
// Size + margin compensation
// ======================================

const EXPAND_DURATION=5420;
const COLLAPSE_DURATION=5420;

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
// Computed geometry
// ======================================

function getGeometry(el){
    const style=window.getComputedStyle(el);
    const rect=getRect(el);

    if(!rect)
        return null;

    return {
        width:rect.width,
        height:rect.height,
        marginTop:parseFloat(style.marginTop)||0,
        marginRight:parseFloat(style.marginRight)||0,
        marginBottom:parseFloat(style.marginBottom)||0,
        marginLeft:parseFloat(style.marginLeft)||0
    };
}

// ======================================
// Layout
// ======================================

function getLayout(el){
    const parent=el?.parentElement;

    if(!parent)
        return {
            axis:"vertical",
            direction:"forward"
        };

    const style=window.getComputedStyle(parent);

    if(
        style.display==="flex"&&
        (
            style.flexDirection==="row"||
            style.flexDirection==="row-reverse"
        )
    ){
        return {
            axis:"horizontal",
            direction:
                style.flexDirection==="row"
                    ?"forward"
                    :"reverse"
        };
    }

    return {
        axis:"vertical",
        direction:
            style.flexDirection==="column-reverse"
                ?"reverse"
                :"forward"
    };
}

// ======================================
// Gap
// ======================================

function getGap(el,axis){
    const parent=el?.parentElement;

    if(!parent)
        return 0;

    const style=window.getComputedStyle(parent);

    return axis==="horizontal"
        ?parseFloat(style.columnGap)||0
        :parseFloat(style.rowGap)||0;
}

// ======================================
// Compensation
// ======================================

function getCompensation(el,axis){
    const style=window.getComputedStyle(el);

    const gap=getGap(el,axis);

    if(axis==="horizontal"){
        return {
            start:parseFloat(style.marginLeft)||0,
            end:(parseFloat(style.marginRight)||0)+gap
        };
    }

    return {
        start:parseFloat(style.marginTop)||0,
        end:(parseFloat(style.marginBottom)||0)+gap
    };
}

// ======================================
// Size
// ======================================

function setSize(el,width,height){
    el.style.setProperty(
        "width",
        `${Math.max(0,width)}px`,
        "important"
    );

    el.style.setProperty(
        "height",
        `${Math.max(0,height)}px`,
        "important"
    );
}

function setMargins(el,top,right,bottom,left){
    el.style.setProperty(
        "margin-top",
        `${top}px`,
        "important"
    );

    el.style.setProperty(
        "margin-right",
        `${right}px`,
        "important"
    );

    el.style.setProperty(
        "margin-bottom",
        `${bottom}px`,
        "important"
    );

    el.style.setProperty(
        "margin-left",
        `${left}px`,
        "important"
    );
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
}

// ======================================
// Clear
// ======================================

function clearSizeAnimationStyles(el){
    if(!el)
        return;

    el.style.removeProperty("width");
    el.style.removeProperty("height");
    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-right");
    el.style.removeProperty("margin-bottom");
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
// Easing
// ======================================

function easeOutCubic(progress){
    return 1-Math.pow(1-progress,3);
}

// ======================================
// Animation
// ======================================

function animateGeometry(
    el,
    geometry,
    layout,
    expanding,
    duration
){
    if(!el||!geometry)
        return Promise.resolve();

    stopSizeAnimation(el);

    const axis=layout.axis;

    const startSize=expanding
        ?0
        :(axis==="horizontal"
            ?geometry.width
            :geometry.height);

    const endSize=expanding
        ?(axis==="horizontal"
            ?geometry.width
            :geometry.height)
        :0;

    const compensation=getCompensation(
        el,
        axis
    );

    const startMarginStart=expanding
        ?compensation.start
        :0;

    const endMarginStart=expanding
        ?0
        :compensation.start;

    const startMarginEnd=expanding
        ?compensation.end
        :0;

    const endMarginEnd=expanding
        ?0
        :compensation.end;

    const margins={
        top:geometry.marginTop,
        right:geometry.marginRight,
        bottom:geometry.marginBottom,
        left:geometry.marginLeft
    };

    function apply(progress){
        const eased=easeOutCubic(progress);

        const size=
            startSize+
            (endSize-startSize)*eased;

        const marginStart=
            startMarginStart+
            (endMarginStart-startMarginStart)*eased;

        const marginEnd=
            startMarginEnd+
            (endMarginEnd-startMarginEnd)*eased;

        if(axis==="horizontal"){
            const left=
                layout.direction==="forward"
                    ?marginStart
                    :marginEnd;

            const right=
                layout.direction==="forward"
                    ?marginEnd
                    :marginStart;

            setSize(
                el,
                size,
                geometry.height
            );

            setMargins(
                el,
                margins.top,
                right,
                margins.bottom,
                left
            );

            return;
        }

        const top=
            layout.direction==="forward"
                ?marginStart
                :marginEnd;

        const bottom=
            layout.direction==="forward"
                ?marginEnd
                :marginStart;

        setSize(
            el,
            geometry.width,
            size
        );

        setMargins(
            el,
            top,
            margins.right,
            bottom,
            margins.left
        );
    }

    apply(0);
    forceLayout();

    const startTime=performance.now();

    return new Promise(resolve=>{

        function frame(now){
            const progress=Math.min(
                1,
                (now-startTime)/duration
            );

            apply(progress);

            if(progress<1){
                el._animationFrame=
                    requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;

            apply(1);
            forceLayout();

            el._animationTimer=setTimeout(()=>{

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

    const geometry=getGeometry(el);

    if(!geometry)
        return Promise.resolve();

    const layout=getLayout(el);

    log(
        "EXPAND",
        getName(el),
        layout,
        geometry
    );

    return animateGeometry(
        el,
        geometry,
        layout,
        true,
        EXPAND_DURATION
    );
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const geometry=getGeometry(el);

    if(!geometry)
        return Promise.resolve();

    const layout=getLayout(el);

    log(
        "COLLAPSE",
        getName(el),
        layout,
        geometry
    );

    return animateGeometry(
        el,
        geometry,
        layout,
        false,
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
