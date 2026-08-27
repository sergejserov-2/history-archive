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

function getGeometry(el){
    const rect=getRect(el);
    const style=getComputedStyle(el);

    if(!rect)
        return null;

    return{
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
        return{
            axis:"vertical",
            direction:"forward"
        };

    const style=getComputedStyle(parent);
    const display=style.display;

    if(display==="flex")
        return getFlexLayout(el,parent,style);

    if(display==="grid")
        return getGridLayout(el,parent,style);

    return{
        axis:"vertical",
        direction:"forward"
    };
}

// ======================================
// Flex
// ======================================

function getFlexLayout(el,parent,style){
    let axis=
        style.flexDirection==="row"||
        style.flexDirection==="row-reverse"
            ?"horizontal"
            :"vertical";

    let direction=
        style.flexDirection==="row-reverse"||
        style.flexDirection==="column-reverse"
            ?"reverse"
            :"forward";

    const justifyEnd=
        style.justifyContent==="flex-end"||
        style.justifyContent==="end";

    if(justifyEnd)
        direction=
            direction==="forward"
                ?"reverse"
                :"forward";

    if(
        axis==="horizontal"&&
        style.direction==="rtl"
    )
        direction=
            direction==="forward"
                ?"reverse"
                :"forward";

    return{
        axis,
        direction
    };
}

// ======================================
// Grid
// ======================================

function getGridLayout(el,parent,style){
    const children=[
        ...parent.children
    ].filter(child=>child!==el);

    const rect=getRect(el);

    if(!rect)
        return{
            axis:"vertical",
            direction:"forward"
        };

    const before=children
        .map(child=>({
            element:child,
            rect:getRect(child)
        }))
        .filter(item=>item.rect)
        .filter(item=>{
            return item.rect.bottom<=rect.top+1;
        })
        .sort((a,b)=>{
            return b.rect.bottom-a.rect.bottom;
        })[0];

    const after=children
        .map(child=>({
            element:child,
            rect:getRect(child)
        }))
        .filter(item=>item.rect)
        .filter(item=>{
            return item.rect.top>=rect.bottom-1;
        })
        .sort((a,b)=>{
            return a.rect.top-b.rect.top;
        })[0];

    const left=children
        .map(child=>({
            element:child,
            rect:getRect(child)
        }))
        .filter(item=>item.rect)
        .filter(item=>{
            return item.rect.right<=rect.left+1;
        })
        .sort((a,b)=>{
            return b.rect.right-a.rect.right;
        })[0];

    const right=children
        .map(child=>({
            element:child,
            rect:getRect(child)
        }))
        .filter(item=>item.rect)
        .filter(item=>{
            return item.rect.left>=rect.right-1;
        })
        .sort((a,b)=>{
            return a.rect.left-b.rect.left;
        })[0];

    const verticalDistance=
        Math.min(
            before
                ?Math.abs(rect.top-before.rect.bottom)
                :Infinity,
            after
                ?Math.abs(after.rect.top-rect.bottom)
                :Infinity
        );

    const horizontalDistance=
        Math.min(
            left
                ?Math.abs(rect.left-left.rect.right)
                :Infinity,
            right
                ?Math.abs(right.rect.left-rect.right)
                :Infinity
        );

    if(horizontalDistance<verticalDistance)
        return{
            axis:"horizontal",
            direction:
                left&&!right
                    ?"reverse"
                    :"forward"
        };

    return{
        axis:"vertical",
        direction:
            before&&!after
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

    const style=getComputedStyle(parent);

    return axis==="horizontal"
        ?parseFloat(style.columnGap)||0
        :parseFloat(style.rowGap)||0;
}

// ======================================
// Styles
// ======================================

function setSize(el,axis,value){
    value=Math.max(0,value);

    if(axis==="horizontal")
        el.style.setProperty(
            "width",
            `${value}px`,
            "important"
        );
    else
        el.style.setProperty(
            "height",
            `${value}px`,
            "important"
        );
}

function setMargins(
    el,
    top,
    right,
    bottom,
    left
){
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

    el.style.removeProperty("width");
    el.style.removeProperty("height");
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
    stopSizeAnimation(el);

    const axis=layout.axis;
    const direction=layout.direction;

    const gap=getGap(el,axis);

    const size=
        axis==="horizontal"
            ?geometry.width
            :geometry.height;

    const marginStart=
        axis==="horizontal"
            ?geometry.marginLeft
            :geometry.marginTop;

    const marginEnd=
        axis==="horizontal"
            ?geometry.marginRight
            :geometry.marginBottom;

    const compensationStart=
        marginStart+gap;

    const compensationEnd=
        marginEnd+gap;

    const fromSize=
        expanding
            ?0
            :size;

    const toSize=
        expanding
            ?size
            :0;

    const fromCompensation=
        expanding
            ?1
            :0;

    const toCompensation=
        expanding
            ?0
            :1;

    const startTime=performance.now();

    function apply(progress){
        const eased=easeOutCubic(progress);

        const currentSize=
            fromSize+
            (toSize-fromSize)*eased;

        const compensation=
            fromCompensation+
            (toCompensation-fromCompensation)*eased;

        const start=
            compensationStart*compensation;

        const end=
            compensationEnd*compensation;

        setSize(
            el,
            axis,
            currentSize
        );

        if(axis==="horizontal"){

            if(direction==="forward"){
                setMargins(
                    el,
                    geometry.marginTop,
                    end,
                    geometry.marginBottom,
                    start
                );
            }else{
                setMargins(
                    el,
                    geometry.marginTop,
                    start,
                    geometry.marginBottom,
                    end
                );
            }

            return;
        }

        if(direction==="forward"){
            setMargins(
                el,
                start,
                geometry.marginRight,
                end,
                geometry.marginLeft
            );
        }else{
            setMargins(
                el,
                end,
                geometry.marginRight,
                start,
                geometry.marginLeft
            );
        }
    }

    apply(0);
    forceLayout();

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
        {
            width:fmt(geometry.width),
            height:fmt(geometry.height)
        }
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
        {
            width:fmt(geometry.width),
            height:fmt(geometry.height)
        }
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
