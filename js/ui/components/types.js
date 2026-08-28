modal.root.addEventListener("click",async event=>{
    const adminButton=event.target.closest(".admin-button");

    if(adminButton?.classList.contains("admin-button--disabled"))return;

    if(adminButton){
        event.preventDefault();
        event.stopPropagation();

        const action=adminButton.dataset.action;
        const id=adminButton.dataset.id;

        if(action==="edit-objectType"||action==="edit-recordType"||action==="edit-subjectType"){
            const type=action.replace("edit-","");
            const typeEntity=getTypeById(type,id,modal);
            if(!typeEntity)return;

            await openModal("editor",{
                entityId:id,
                entityType:type
            });

            return;
        }

        if(action==="delete-objectType"||action==="delete-recordType"||action==="delete-subjectType"){
            const type=action.replace("delete-","");
            const typeEntity=getTypeById(type,id,modal);
            if(!typeEntity)return;

            if(isTypeUsed(type,id,modal))return;

            if(!confirm(`Удалить тип «${typeEntity.title??id}»?`))return;

            try{
                await deleteEntity(type,id,{
                    objectTypes:modal.objectTypes,
                    recordTypes:modal.recordTypes,
                    subjectTypes:modal.subjectTypes,
                    objects:modal.objects,
                    records:modal.records,
                    subjects:modal.subjects
                });

                await refreshTypesModal();
            }catch(error){
                console.error("Ошибка удаления типа:",error);
                alert("Не удалось удалить тип");
            }

            return;
        }

        if(action==="add-type"){
            await openModal("editor",{entityType:"objectType"});
            return;
        }

        return;
    }

    const row=event.target.closest(".entity-list-row");
    if(!row)return;

    const id=row.dataset.id;
    if(!id)return;

    event.preventDefault();
});
