export function sortEntities(items=[],direction="asc"){
    return[...items].sort((a,b)=>{
        const result=compareEntities(a,b);

        return direction==="desc"
            ?-result
            :result;
    });
}

export function compareEntities(a,b){
    const metaResult=compareValues(
        a.meta,
        b.meta
    );

    if(metaResult!==0){
        return metaResult;
    }

    const authorResult=compareValues(
        a.author,
        b.author
    );

    if(authorResult!==0){
        return authorResult;
    }

    return compareValues(
        a.title,
        b.title
    );
}

export function insertSortedElement({
    container,
    element,
    item,
    getItem,
    selector,
    direction="asc"
}={}){
    if(
        !container||
        !element||
        !item||
        typeof getItem!=="function"||
        !selector
    ){
        return null;
    }

    const elements=[
        ...container.querySelectorAll(selector)
    ];

    const before=elements.find(existing=>{
        const existingItem=getItem(existing);

        if(!existingItem){
            return false;
        }

        const result=compareEntities(
            item,
            existingItem
        );

        return direction==="desc"
            ?result>0
            :result<0;
    });

    if(before){
        container.insertBefore(
            element,
            before
        );
    }else{
        container.appendChild(element);
    }

    return element;
}

function compareValues(a,b){
    const aValue=String(a??"").trim();
    const bValue=String(b??"").trim();

    const aNumber=getFirstNumber(aValue);
    const bNumber=getFirstNumber(bValue);

    if(
        aNumber!==null&&
        bNumber===null
    ){
        return-1;
    }

    if(
        aNumber===null&&
        bNumber!==null
    ){
        return 1;
    }

    if(
        aNumber!==null&&
        bNumber!==null&&
        aNumber!==bNumber
    ){
        return aNumber-bNumber;
    }

    return aValue.localeCompare(
        bValue,
        "ru",
        {
            numeric:true,
            sensitivity:"base"
        }
    );
}

function getFirstNumber(value){
    if(!value)return null;

    const match=value.match(/\d+/);

    if(!match)return null;

    const number=Number(match[0]);

    return Number.isFinite(number)
        ?number
        :null;
}
