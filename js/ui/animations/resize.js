const EXPAND_DURATION=5420;
const COLLAPSE_DURATION=5420;

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
            for(const sibling of parent.children){
                if(sibling===el)
                    continue;

                const r=getRect(sibling);
                if(!r)
                    continue;

                if(Math.abs(r.top-rect.top)<2)
                    return"horizontal";

                if(Math.abs(r.left-rect.left)<2)
                    return"vertical";
            }
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

function name(el){
    return el?.id||el?.className||el?.tagName||"element";
}

function geometry(el){
    if(!el)
        return null;

    const rect=getRect(el);
    const margins=getMargins(el);
    const parent=el.parentElement;
    const parentRect=getRect(parent);

    if(!rect)
        return null;

    const axis=getAxis(el);
    const gap=getGap(el,axis);

    return{
        name:name(el),
        top:+rect.top.toFixed(3),
        bottom:+rect.bottom.toFixed(3),
        height:+rect.height.toFixed(3),
        marginTop:+margins.top.toFixed(3),
        marginBottom:+margins.bottom.toFixed(3),
        marginLeft:+margins.left.toFixed(3),
        marginRight:+margins.right.toFixed(3),
        gap:+gap.toFixed(3),
        parentTop:parentRect?+parentRect.top.toFixed(3):null,
        parentBottom:parentRect?+parentRect.bottom.toFixed(3):null,
        parentHeight:parentRect?+parentRect.height.toFixed(3):null,
        hidden:el.hidden
    };
}

function logGeometry(label,el){
    console.log(`[animations] ${label}`,geometry(el));
}

function logLayout(label,el){
    if(!el)
        return;

    console.log(`[animations] ${label}`,{
        element:geometry(el),
        previous:geometry(el.previousElementSibling),
        next:geometry(el.nextElementSibling),
        parent:geometry(el.parentElement)
    });
}

function getHiddenMargins(el){
    const rect=getRect(el);
    const margins=getMargins(el);

    if(!rect)
        return margins;

    const axis=getAxis(el);
    const gap=getGap(el,axis);
    const hidden={...margins};

    if(axis==="vertical"){
        const total=rect.height+margins.top+margins.bottom+gap;
        const shift=total/2;

        console.log("[animations] HIDDEN CALC",{
            element:name(el),
            height:+rect.height.toFixed(3),
            marginTop:+margins.top.toFixed(3),
            marginBottom:+margins.bottom.toFixed(3),
            gap:+gap.toFixed(3),
            total:+total.toFixed(3),
            shift:+shift.toFixed(3),
            hiddenTop:+(margins.top-shift).toFixed(3),
            hiddenBottom:+(margins.bottom-shift).toFixed(3)
        });

        hidden.top-=shift;
        hidden.bottom-=shift;
    }else{
        const total=rect.width+margins.left+margins.right+gap;
        const shift=total/2;

        console.log("[animations] HIDDEN CALC",{
            element:name(el),
            width:+rect.width.toFixed(3),
            marginLeft:+margins.left.toFixed(3),
            marginRight:+margins.right.toFixed(3),
            gap:+gap.toFixed(3),
            total:+total.toFixed(3),
            shift:+shift.toFixed(3),
            hiddenLeft:+(margins.left-shift).toFixed(3),
            hiddenRight:+(margins.right-shift).toFixed(3)
        });

        hidden.left-=shift;
        hidden.right-=shift;
    }

    return hidden;
}

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

    console.groupCollapsed(`[animations] START ${name(el)}`);
    logGeometry("INITIAL",el);
    console.log("[animations] FROM",from);
    console.log("[animations] TO",to);
    console.groupEnd();

    setMargins(el,from);
    void document.documentElement.offsetHeight;

    logLayout("AFTER SET FROM",el);

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
            void document.documentElement.offsetHeight;

            logLayout("BEFORE CLEAR",el);

            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;

                logLayout("JUST BEFORE RESOLVE",el);

                resolve();

            },20);
        }

        el._animationFrame=requestAnimationFrame(frame);
    });
}

export function cancelSizeAnimation(el){
    if(!el)
        return;

    console.log("[animations] CANCEL",name(el));

    stop(el);
    clear(el);
}

export function clearSizeAnimation(el){
    if(!el)
        return;

    console.log("[animations] CLEAR",name(el));

    logLayout("BEFORE EXTERNAL CLEAR",el);

    clear(el);
    void document.documentElement.offsetHeight;

    logLayout("AFTER EXTERNAL CLEAR",el);
}

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    console.log("[animations] EXPAND",name(el));

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,hidden,visible,EXPAND_DURATION);
}

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    console.log("[animations] COLLAPSE",name(el));

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,visible,hidden,COLLAPSE_DURATION);
}
