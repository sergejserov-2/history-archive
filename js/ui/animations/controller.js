import{
    animateExpand,
    animateCollapse,
    animateExpandGroup,
    animateCollapseGroup,
    cancelSizeAnimation,
    clearSizeAnimation
}from"./resize.js";

import{
    showVisibility,
    hideVisibility
}from"./visibility.js";

const ENTER_DELAY=10;
const EXIT_DELAY=10;

const HIDDEN_CLASS="animation--hidden";

const ENTER_STATE="enter";
const EXIT_STATE="exit";

const collapseQueue=[];
let collapseFlushScheduled=false;

function getSiblingGroup(elements){
    const result=[];
    const set=new Set(elements);

    for(const element of elements){
        if(!element?.parentElement)
            continue;

        if(!result.length){
            result.push(element);
            continue;
        }

        const last=result[result.length-1];

        if(element.parentElement!==last.parentElement)
            continue;

        const children=[...last.parentElement.children];
        const lastIndex=children.indexOf(last);
        const elementIndex=children.indexOf(element);

        if(Math.abs(lastIndex-elementIndex)===1)
            result.push(element);
    }

    return result;
}

function queueCollapse(element){
    return new Promise(resolve=>{
        collapseQueue.push({element,resolve});

        if(collapseFlushScheduled)
            return;

        collapseFlushScheduled=true;

        queueMicrotask(flushCollapseQueue);
    });
}

function flushCollapseQueue(){
    collapseFlushScheduled=false;

    const queue=collapseQueue.splice(0);

    if(!queue.length)
        return;

    const groups=[];

    for(const item of queue){
        let group=groups.find(group=>{
            if(!group.length)
                return false;

            const first=group[0];
            return first.parentElement===item.element.parentElement;
        });

        if(!group){
            group=[item.element];
            groups.push(group);
            continue;
        }

        const children=[...item.element.parentElement.children];
        const indexes=group.map(element=>children.indexOf(element));
        const index=children.indexOf(item.element);

        if(indexes.some(value=>Math.abs(value-index)===1))
            group.push(item.element);
        else{
            group=[item.element];
            groups.push(group);
        }
    }

    console.log("[animation] collapse groups:",groups);

    for(const group of groups){
        const items=queue.filter(item=>group.includes(item.element));

        animateCollapseGroup(group).then(()=>{
            for(const item of items)
                item.resolve();
        });
    }
}

export function cancelAnimation(element){
    if(!element)
        return;

    if(element._animationTimer){
        clearTimeout(element._animationTimer);
        element._animationTimer=null;
    }

    cancelSizeAnimation(element);

    element.classList.remove("animation--entering");
    element.classList.remove("animation--exiting");

    element._animationState=null;
}

export function show(element){
    if(!element)
        return Promise.resolve();

    cancelAnimation(element);

    element._animationState=ENTER_STATE;
    element.hidden=false;

    element.classList.add(HIDDEN_CLASS);

    return animateExpand(element).then(()=>{
        if(element._animationState!==ENTER_STATE)
            return;

        return new Promise(resolve=>{
            element._animationTimer=setTimeout(()=>{
                if(element._animationState!==ENTER_STATE){
                    resolve();
                    return;
                }

                showVisibility(element).then(()=>{
                    if(element._animationState!==ENTER_STATE){
                        resolve();
                        return;
                    }

                    element._animationState=null;
                    element._animationTimer=null;
                    resolve();
                });
            },ENTER_DELAY);
        });
    });
}

export function hide(element){
    if(!element)
        return Promise.resolve();

    cancelAnimation(element);

    if(element.hidden)
        return Promise.resolve();

    element._animationState=EXIT_STATE;

    return hideVisibility(element).then(()=>{
        if(element._animationState!==EXIT_STATE)
            return;

        return new Promise(resolve=>{
            element._animationTimer=setTimeout(()=>{
                if(element._animationState!==EXIT_STATE){
                    resolve();
                    return;
                }

                queueCollapse(element).then(()=>{
                    if(element._animationState!==EXIT_STATE){
                        resolve();
                        return;
                    }

                    element.hidden=true;
                    clearSizeAnimation(element);

                    element._animationState=null;
                    element._animationTimer=null;
                    resolve();
                });
            },EXIT_DELAY);
        });
    });
}
