// ======================================
// Universal geometry animations
// ======================================

const EXPAND_DURATION=420;
const COLLAPSE_DURATION=420;

// ======================================
// Geometry
// ======================================

function getRect(el){
    return el?.getBoundingClientRect()||null;
}

function getMargins(el){
    const s=getComputedStyle(el);
    return{
        top:parseFloat(s.marginTop)||0,
        right:parseFloat(s.marginRight)||0,
        bottom:parseFloat(s.marginBottom)||0,
        left:parseFloat(s.marginLeft)||0
    };
}

function setMargins(el,m){
    el.style.setProperty("margin-top",`${m.top}px`,"important");
    el.style.setProperty("margin-right",`${m.right}px`,"important");
    el.style.setProperty("margin-bottom",`${m.bottom}px`,"important");
    el.style.setProperty("margin-left",`${m.left}px`,"important");
}

function getAxis(el){
    const parent=el?.parentElement;
    if(!parent)
        return"vertical";

    const s=getComputedStyle(parent);

    if(s.display==="flex")
        return s.flexDirection.startsWith("row")?"horizontal":"vertical";

    if(s.display==="grid"){
        const rect=getRect(el);
        if(rect){
            const siblings=[...parent.children].filter(x=>x!==el);
            if(siblings.some(x=>{
                const r=getRect(x);
                return r&&Math.abs(r.top-rect.top)<2;
            }))
                return"horizontal";
        }
        return s.gridAutoFlow.includes("column")?"horizontal":"vertical";
    }

    return"vertical";
}

function getGap(el,axis){
    const parent=el?.parentElement;
    if(!parent)
        return 0;

    const s=getComputedStyle(parent);
    return axis==="horizontal"
        ?parseFloat(s.columnGap)||0
        :parseFloat(s.rowGap)||0;
}

function getHiddenMargins(el){
    const rect=getRect(el);
    const margins=getMargins(el);
    if(!rect)
        return margins;

    const axis=getAxis(el);
    const gap=getGap(el,axis);
    const size=axis==="horizontal"?rect.width:rect.height;
    const shift=(size+gap)/2;

    const hidden={...margins};

    if(axis==="horizontal"){
        hidden.left-=shift;
        hidden.right-=shift;
    }else{
        hidden.top-=shift;
        hidden.bottom-=shift;
    }

    return hidden;
}

// ======================================
// Animation
// ======================================

function stop(el){
    if(el._animationFrame)
        cancelAnimationFrame(el._animationFrame);
    if(el._animationTimer)
        clearTimeout(el._animationTimer);

    el._animationFrame=null;
    el._animationTimer=null;
}

function clear(el){
    el.style.removeProperty("margin-top");
    el.style.removeProperty("margin-right");
    el.style.removeProperty("margin-bottom");
    el.style.removeProperty("margin-left");
}

function ease(t){
    return 1-Math.pow(1-t,3);
}

function animate(el,from,to,duration){
    if(!el)
        return Promise.resolve();

    stop(el);
    setMargins(el,from);
    void el.offsetHeight;

    const start=performance.now();

    return new Promise(resolve=>{
        function frame(now){
            const t=Math.min(1,(now-start)/duration);
            const e=ease(t);

            setMargins(el,{
                top:from.top+(to.top-from.top)*e,
                right:from.right+(to.right-from.right)*e,
                bottom:from.bottom+(to.bottom-from.bottom)*e,
                left:from.left+(to.left-from.left)*e
            });

            if(t<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }

            el._animationFrame=null;
            setMargins(el,to);

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;
                clear(el);
                resolve();
            },20);
        }

        el._animationFrame=requestAnimationFrame(frame);
    });
}

// ======================================
// Cancel
// ======================================

export function cancelSizeAnimation(el){
    if(!el)
        return;

    stop(el);
    clear(el);
}

// ======================================
// Expand
// ======================================

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,hidden,visible,EXPAND_DURATION);
}

// ======================================
// Collapse
// ======================================

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,visible,hidden,COLLAPSE_DURATION);
}
