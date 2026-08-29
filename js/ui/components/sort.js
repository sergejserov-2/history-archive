export function sortEntities(items=[],direction="asc"){
    const sorted=[...items];

    sorted.sort((a,b)=>{
        const result=compareEntities(a,b);

        return direction==="desc"
            ?-result
            :result;
    });

    return sorted;
}

export function compareEntities(a,b){
    if(
        a.sortValue!==undefined||
        b.sortValue!==undefined
    ){
        const aValue=Number(a.sortValue??0);
        const bValue=Number(b.sortValue??0);

        if(
            Number.isFinite(aValue)&&
            Number.isFinite(bValue)&&
            aValue!==bValue
        ){
            return aValue-bValue;
        }
    }

    const metaResult=compareValues(
        a.meta,
        b.meta
    );

    if(metaResult!==0){
        return metaResult;
    }

    return compareValues(
        a.title,
        b.title
    );
}

function compareValues(a,b){
    const aValue=String(a??"").trim();
    const bValue=String(b??"").trim();

    const aNumber=getFirstNumber(aValue);
    const bNumber=getFirstNumber(bValue);

    if(aNumber!==null&&bNumber===null){
        return-1;
    }

    if(aNumber===null&&bNumber!==null){
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
