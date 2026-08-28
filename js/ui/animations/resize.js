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
}
