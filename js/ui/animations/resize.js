const EXPAND_DURATION=320;
const COLLAPSE_DURATION=320;
const CHANGE_DURATION=6320;

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
    if(!parent)return"vertical";
    const s=getComputedStyle(parent);
    if(s.display==="flex")return s.flexDirection.startsWith("row")?"horizontal":"vertical";
    if(s.display==="grid"){
        const rect=getRect(el);
        if(rect){
            for(const sibling of parent.children){
                if(sibling===el)continue;
                const r=getRect(sibling);
                if(!r)continue;
                if(Math.abs(r.top-rect.top)<2)return"horizontal";
                if(Math.abs(r.left-rect.left)<2)return"vertical";
            }
        }
        return s.gridAutoFlow.includes("column")?"horizontal":"vertical";
    }
    return"vertical";
}

function getGap(el,axis){
    const parent=el?.parentElement;
    if(!parent)return 0;
    const s=getComputedStyle(parent);
    return axis==="horizontal"?parseFloat(s.columnGap)||0:parseFloat(s.rowGap)||0;
}

export function getSize(el){
    const rect=getRect(el);
    const margins=getMargins(el);
    if(!rect)return 0;
    const axis=getAxis(el);
    const gap=getGap(el,axis);
    return axis==="vertical"
        ?rect.height+margins.top+margins.bottom+gap
        :rect.width+margins.left+margins.right+gap;
}

function getHiddenMargins(el){
    const rect=getRect(el);
    const margins=getMargins(el);
    if(!rect)return margins;
    const axis=getAxis(el);
    const gap=getGap(el,axis);
    const hidden={...margins};
    const size=rect[axis==="vertical"?"height":"width"]+margins.top+margins.bottom+gap;
    const shift=size/2;
    if(axis==="vertical"){
        hidden.top-=shift;
        hidden.bottom-=shift;
    }else{
        hidden.left-=shift;
        hidden.right-=shift;
    }
    return hidden;
}

function stop(el){
    if(el._animationFrame)cancelAnimationFrame(el._animationFrame);
    if(el._animationTimer)clearTimeout(el._animationTimer);
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

function interpolate(from,to,t){
    return{
        top:from.top+(to.top-from.top)*t,
        right:from.right+(to.right-from.right)*t,
        bottom:from.bottom+(to.bottom-from.bottom)*t,
        left:from.left+(to.left-from.left)*t
    };
}

function animate(el,from,to,duration){
    if(!el)return Promise.resolve();
    stop(el);
    setMargins(el,from);
    void el.offsetHeight;
    const start=performance.now();
    return new Promise(resolve=>{
        function frame(now){
            const t=Math.min(1,(now-start)/duration);
            setMargins(el,interpolate(from,to,ease(t)));
            if(t<1){
                el._animationFrame=requestAnimationFrame(frame);
                return;
            }
            el._animationFrame=null;
            setMargins(el,to);
            el._animationTimer=setTimeout(()=>{
                el._animationTimer=null;
                resolve();
            },20);
        }
        el._animationFrame=requestAnimationFrame(frame);
    });
}

function animateGroup(elements,mode,duration){
    if(!elements?.length)return Promise.resolve();
    const items=elements.filter(Boolean).map(el=>({
        el,
        visible:getMargins(el),
        size:getSize(el)
    }));
    if(!items.length)return Promise.resolve();
    const total=items.reduce((sum,item)=>sum+item.size,0);
    for(const item of items){
        stop(item.el);
        setMargins(item.el,item.visible);
    }
    const first=items[0];
    void first.el.offsetHeight;
    const axis=getAxis(first.el);
    const shift=total/2;
    const animations=items.map(item=>({
        el:item.el,
        from:{...item.visible},
        to:{...item.visible}
    }));
    if(mode==="collapse"){
        if(axis==="vertical"){
            animations[0].to.top-=shift;
            animations[0].to.bottom-=shift;
        }else{
            animations[0].to.left-=shift;
            animations[0].to.right-=shift;
        }
    }else{
        if(axis==="vertical"){
            animations[0].from.top-=shift;
            animations[0].from.bottom-=shift;
        }else{
            animations[0].from.left-=shift;
            animations[0].from.right-=shift;
        }
    }
    const start=performance.now();
    return new Promise(resolve=>{
        function frame(now){
            const t=Math.min(1,(now-start)/duration);
            const e=ease(t);
            for(const item of animations)
                setMargins(item.el,interpolate(item.from,item.to,e));
            if(t<1){
                const frameId=requestAnimationFrame(frame);
                for(const item of animations)item.el._animationFrame=frameId;
                return;
            }
            for(const item of animations){
                item.el._animationFrame=null;
                setMargins(item.el,item.to);
            }
            const timer=setTimeout(()=>{
                for(const item of animations)item.el._animationTimer=null;
                resolve();
            },20);
            for(const item of animations)item.el._animationTimer=timer;
        }
        const frameId=requestAnimationFrame(frame);
        for(const item of animations)item.el._animationFrame=frameId;
    });
}

export function cancelSizeAnimation(el){
    if(!el)return;
    stop(el);
    clear(el);
}

export function clearSizeAnimation(el){
    if(!el)return;
    clear(el);
}

export function animateExpand(el){
    if(!el)return Promise.resolve();
    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);
    return animate(el,hidden,visible,EXPAND_DURATION);
}

export function animateCollapse(el){
    if(!el)return Promise.resolve();
    const visible=getMargins(el);
    const hidden=getHiddenMargins(el);
    return animate(el,visible,hidden,COLLAPSE_DURATION);
}

export function animateExpandGroup(elements){
    return animateGroup(elements,"expand",EXPAND_DURATION);
}

export function animateCollapseGroup(elements){
    return animateGroup(elements,"collapse",COLLAPSE_DURATION);
}

export function animateChange(el,oldSize){
    if(!el||!Number.isFinite(oldSize))return Promise.resolve();

    console.log("[resize] CHANGE START");
    console.log("[resize] oldSize:",oldSize);

    const beforeRect=getRect(el);
    const beforeMargins=getMargins(el);
    const beforeAxis=getAxis(el);
    const beforeGap=getGap(el,beforeAxis);

    console.log("[resize] before rect:",beforeRect);
    console.log("[resize] before rect height:",beforeRect?.height);
    console.log("[resize] before margins:",beforeMargins);
    console.log("[resize] before axis:",beforeAxis);
    console.log("[resize] before gap:",beforeGap);
    console.log("[resize] before getSize:",getSize(el));
    console.log("[resize] before scrollHeight:",el.scrollHeight);
    console.log("[resize] before offsetHeight:",el.offsetHeight);
    console.log("[resize] before computed height:",getComputedStyle(el).height);

    void el.offsetHeight;

    console.log("[resize] after forced layout rect:",getRect(el));
    console.log("[resize] after forced layout height:",getRect(el)?.height);
    console.log("[resize] after forced layout getSize:",getSize(el));

    return new Promise(resolve=>{
        requestAnimationFrame(()=>{
            requestAnimationFrame(()=>{
                const newSize=getSize(el);

                console.log("[resize] AFTER 2 RAF");
                console.log("[resize] after 2 RAF rect:",getRect(el));
                console.log("[resize] after 2 RAF rect height:",getRect(el)?.height);
                console.log("[resize] after 2 RAF getSize:",newSize);

                if(newSize===oldSize){
                    console.log("[resize] size unchanged");
                    resolve();
                    return;
                }

                const margins=getMargins(el);
                const axis=getAxis(el);
                const delta=newSize-oldSize;
                const from={...margins};
                const to={...margins};

                if(axis==="vertical"){
                    from.top-=delta/2;
                    from.bottom-=delta/2;
                }else{
                    from.left-=delta/2;
                    from.right-=delta/2;
                }

                console.log("[resize] newSize:",newSize);
                console.log("[resize] delta:",delta);
                console.log("[resize] animation from:",from);
                console.log("[resize] animation to:",to);

                // Ставим начальное состояние до запуска анимации.
                setMargins(el,from);
                void el.offsetHeight;

                console.log("[resize] START STATE SET");
                console.log("[resize] start state rect:",getRect(el));
                console.log("[resize] start state size:",getSize(el));
                console.log("[resize] start state margins:",getMargins(el));

                requestAnimationFrame(()=>{
                    const start=performance.now();
                    let frameNumber=0;

                    function frame(now){
                        const t=Math.min(1,Math.max(0,(now-start)/CHANGE_DURATION));
                        const e=ease(t);
                        const current=interpolate(from,to,e);

                        setMargins(el,current);

                        if(frameNumber<10){
                            const rect=getRect(el);
                            console.log(`[resize] CHANGE FRAME ${frameNumber}`,{
                                t,
                                ease:e,
                                rectHeight:rect?.height,
                                rectWidth:rect?.width,
                                size:getSize(el),
                                margins:getMargins(el)
                            });
                        }

                        frameNumber++;

                        if(t<1){
                            el._animationFrame=requestAnimationFrame(frame);
                            return;
                        }

                        el._animationFrame=null;
                        setMargins(el,to);

                        console.log("[resize] CHANGE END",{
                            rect:getRect(el),
                            size:getSize(el),
                            margins:getMargins(el)
                        });

                        el._animationTimer=setTimeout(()=>{
                            el._animationTimer=null;
                            clear(el);
                            resolve();
                        },20);
                    }

                    el._animationFrame=requestAnimationFrame(frame);
                });
            });
        });
    });
}
