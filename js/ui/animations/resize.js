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

function isSection(el){
    return el?.tagName==="SECTION";
}

function logSectionFrame(el,label){
    if(!isSection(el))
        return;

    const parent=el.parentElement;
    const rect=getRect(el);
    const parentRect=getRect(parent);
    const margins=getMargins(el);

    if(!rect||!parentRect)
        return;

    console.log(`[animations] ${label} ${el.id||el.className}`,{
        parentHeight:+parentRect.height.toFixed(3),
        top:+rect.top.toFixed(3),
        height:+rect.height.toFixed(3),
        marginTop:+margins.top.toFixed(3),
        marginBottom:+margins.bottom.toFixed(3)
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
        const shift=(rect.height+margins.top+margins.bottom+gap)/2;
        hidden.top-=shift;
        hidden.bottom-=shift;
    }else{
        const shift=(rect.width+margins.left+margins.right+gap)/2;
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

function interpolate(from,to,e){
    return{
        top:from.top+(to.top-from.top)*e,
        right:from.right+(to.right-from.right)*e,
        bottom:from.bottom+(to.bottom-from.bottom)*e,
        left:from.left+(to.left-from.left)*e
    };
}

function animateGroup(items,duration){
    if(!items.length)
        return Promise.resolve();

    for(const item of items){
        stop(item.el);
        setMargins(item.el,item.from);
    }

    void document.documentElement.offsetHeight;

    for(const item of items)
        logSectionFrame(item.el,"START");

    const start=performance.now();

    return new Promise(resolve=>{
        function frame(now){
            const t=Math.min(1,(now-start)/duration);
            const e=ease(t);

            for(const item of items)
                setMargins(item.el,interpolate(item.from,item.to,e));

            if(t<1){
                const frameId=requestAnimationFrame(frame);
                for(const item of items)
                    item.el._animationFrame=frameId;
                return;
            }

            for(const item of items){
                item.el._animationFrame=null;
                setMargins(item.el,item.to);
            }

            const timer=setTimeout(()=>{
                for(const item of items){
                    item.el._animationTimer=null;
                    logSectionFrame(item.el,"BEFORE RESOLVE");
                }
                resolve();
            },20);

            for(const item of items)
                item.el._animationTimer=timer;
        }

        const frameId=requestAnimationFrame(frame);
        for(const item of items)
            item.el._animationFrame=frameId;
    });
}

function animate(el,from,to,duration){
    return animateGroup([{el,from,to}],duration);
}

export function cancelSizeAnimation(el){
    if(!el)
        return;

    stop(el);
    clear(el);
}

export function clearSizeAnimation(el){
    if(!el)
        return;

    clear(el);
}

export function animateExpand(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,hidden,visible,EXPAND_DURATION);
}

export function animateCollapse(el){
    if(!el)
        return Promise.resolve();

    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);

    return animate(el,visible,hidden,COLLAPSE_DURATION);
}

export function animateExpandGroup(elements){
    if(!elements?.length)
        return Promise.resolve();

    const items=elements.map(el=>({
        el,
        from:getHiddenMargins(el),
        to:getMargins(el)
    }));

    return animateGroup(items,EXPAND_DURATION);
}

export function animateCollapseGroup(elements){
    if(!elements?.length)
        return Promise.resolve();

    const items=elements.map(el=>({
        el,
        from:getMargins(el),
        to:getHiddenMargins(el)
    }));

    return animateGroup(items,COLLAPSE_DURATION);
}
