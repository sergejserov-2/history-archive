import {
    adminEdit,
    adminDelete
} from "../components/adminButtons.js";
import{isAdmin,onAdminStateChanged}from"../../admin/adminMode.js";
import{initAdmin}from"../../admin/admin.js";
import{getObject,getType,getParents,getChildren,getAllObjects}from"../../api/objects.js";
import{getTypes}from"../../api/types.js";
import{renderHeader}from"../components/header.js";
import{renderBreadcrumbs}from"../components/breadcrumbs.js";
import{renderChildren}from"../components/children.js";
import{getRecords}from"../../api/records.js";
import{renderRecords}from"../components/records.js";
import{getRecordTypes}from"../../api/recordTypes.js";
import{getPhotos}from"../../api/photos.js";
import{renderPhotos}from"../components/photos.js";
import{getSources}from"../../api/sources.js";
import{renderSources}from"../components/sources.js";
import{getSubjects}from"../../api/subjects.js";
import{getSubjectTypes}from"../../api/subjectTypes.js";
import{renderStatusBadgeHTML}from"../components/editor/status.js";
import{renderMentions,getSubjectHref}from"../components/mentionLink.js";
import{restoreModalFromUrl}from"../components/modalReload.js";
import{createPageUpdates}from"../../admin/update.js";
import{renderFeedbackPrompt,initFeedbackPrompt}from"../components/feedbackPrompt.js";
import{openFeedbackFormByObjectId}from"../components/feedbackForm.js";
import{initCoverDrag}from"../components/coverDrag.js";
import{initPageLoader,revealPage}from"../components/pageLoader.js";

initPageLoader();

const params=new URLSearchParams(window.location.search);
const objectId=params.get("id");

let pageObject=null;
let pageType=null;
let pageParents=[];
let pageChildren=[];
let pageRecords=[];
let pagePhotos=[];
let pageSources=[];
let pageSubjects=[];
let pageSubjectTypes=[];
let pageRecordTypes=[];
let pageAdminMode=false;
let pageTypes=[];
let pageObjects=[];

const page={
    get object(){return pageObject;},
    set object(value){pageObject=value;},
    get type(){return pageType;},
    set type(value){pageType=value;},
    get parents(){return pageParents;},
    get children(){return pageChildren;},
    set children(value){pageChildren=value;},
    get records(){return pageRecords;},
    set records(value){pageRecords=value;},
    get photos(){return pagePhotos;},
    set photos(value){pagePhotos=value;},
    get sources(){return pageSources;},
    set sources(value){pageSources=value;},
    get subjects(){return pageSubjects;},
    get subjectTypes(){return pageSubjectTypes;},
    get recordTypes(){return pageRecordTypes;},
    get admin(){return pageAdminMode;},
    get objects(){return pageObjects;},
    get types(){return pageTypes;},
    renderObjectBlock,
    getChildren:()=>getChildren(pageObject.id,pageObjects),
    renderCoverState:async()=>{
        const block=document.querySelector(".object");

        if(block){
            block.outerHTML=renderObjectBlock();
            initCoverDrag(block.parentElement);
        }
    }
};

const updates=createPageUpdates(page);

async function loadPage(){

    console.time("LOAD DATA");

    console.time("getAllObjects");

    const[objects,types]=
        await Promise.all([
            getAllObjects(),
            getTypes()
        ]);

    console.timeEnd("getAllObjects");

    const object=
        objects.find(
            item=>item.id===objectId
        );

    if(!object){

        document.body.innerHTML=
            "<h1>Объект не найден</h1>";

        return;

    }

    document.title=
        object.title||
        "Исторический архив";

    pageObject=object;
    pageObjects=objects;
    pageTypes=types;

    pageType=
        types.find(
            type=>type.id===object.typeId
        )??null;

    const timed=(name,promise)=>
        promise.then(result=>{
            console.timeEnd(name);
            return result;
        });

    console.time("getRecordTypes");
    console.time("getParents");
    console.time("getChildren");
    console.time("getRecords");
    console.time("getPhotos");
    console.time("getSources");
    console.time("getSubjects");
    console.time("getSubjectTypes");

    [
        pageRecordTypes,
        pageSubjectTypes,
        pageParents,
        pageChildren,
        pageRecords,
        pagePhotos,
        pageSources,
        pageSubjects
    ]=await Promise.all([
        timed(
            "getRecordTypes",
            getRecordTypes()
        ),
        timed(
            "getSubjectTypes",
            getSubjectTypes()
        ),
        timed(
            "getParents",
            getParents(
                object,
                objects,
                types
            )
        ),
        getChildren(
            object.id,
            objects
        ),
        timed(
            "getRecords",
            getRecords(object.id)
        ),
        timed(
            "getPhotos",
            getPhotos(object.id)
        ),
        timed(
            "getSources",
            getSources(object.id)
        ),
        timed(
            "getSubjects",
            getSubjects()
        )
    ]);

    console.timeEnd("LOAD DATA");

    console.time("RENDER PAGE");

    await renderPage();

    console.timeEnd("RENDER PAGE");

}

export function onPhotoDeleted(){
    return updates.updatePhotosBlock();
}

export function onSourceDeleted(){
    return updates.updateSourcesBlock();
}

export function onRecordDeleted(){
    return updates.updateRecordsBlock();
}

export function onObjectDeleted(){
    return updates.onObjectDeleted();
}

function renderObjectBlock(){

    const coverPhoto=
        pagePhotos.find(
            photo=>photo.id===pageObject.coverPhotoId
        );

    const status=
        renderStatusBadgeHTML(
            pageObject.status
        );

    return`
        <section class="object">
            <div class="object__cover" data-cover-drag>
                ${
                    coverPhoto?.previewPath
                    ?
                    `<div class="object__cover-bg" style="background-image:url('${coverPhoto.previewPath}')"></div>
                    <img
                        class="object__cover-image"
                        data-cover-image
                        src="${coverPhoto.previewPath}"
                        alt="${coverPhoto.title??""}"
                        draggable="false"
                    >`
                    :
                    `<div class="object__cover-placeholder">Фото отсутствует</div>`
                }
            </div>

            <div class="object__info">

                <div class="object__type">
                    ${pageType?.title??""}
                </div>

<h1 class="object__title">

    <span class="object__title-text">
        ${pageObject.title??""}
    </span>

    ${adminEdit(
        "object",
        pageObject.id
    )}

    ${adminDelete(
        "object",
        pageObject.id
    )}

    ${status}

</h1>

                ${
                    pageObject.description?.trim()
                    ?
                    `<div class="object__description">
                        ${renderMentions(
                            pageObject.description.trim(),
                            pageSubjects,
                            getSubjectHref
                        )}
                    </div>`
                    :
                    ""
                }

                ${
                    pageAdminMode||
                    pageRecords.length
                    ?
                    renderRecords(
                        pageRecords,
                        pageRecordTypes,
                        pageAdminMode,
                        pageSubjects
                    )
                    :
                    ""
                }

            </div>
        </section>
    `;

}

async function renderPage(){

    const childrenHTML=
        await renderChildren(
            pageChildren,
            pageAdminMode,
            pageObject,
            pageObjects,
            pageTypes
        );

    const breadcrumbsHTML=
        renderBreadcrumbs(
            pageObject,
            pageParents
        );

    document.body.innerHTML=`
        ${renderHeader(page,updates)}

        <main class="page">

            ${breadcrumbsHTML}

            ${renderObjectBlock()}

            ${
                !pageAdminMode
                ?
                renderFeedbackPrompt(
                    pageObject.id
                )
                :
                ""
            }

            ${
                pageAdminMode||
                pagePhotos.length
                ?
                `
                <section id="gallery">

                    <h2>Фотографии</h2>

                    ${renderPhotos(
                        pagePhotos,
                        pageAdminMode
                    )}

                </section>
                `
                :
                ""
            }

            ${
                pageAdminMode||
                pageSources.length
                ?
                `
                <section id="sources">

                    <h2>Источники</h2>

                    ${renderSources(
                        pageSources,
                        pageAdminMode,
                        pageSubjects
                    )}

                </section>
                `
                :
                ""
            }

            ${
                pageAdminMode||
                pageChildren.length
                ?
                `
                <section id="children">

                    <h2>Дочерние объекты</h2>

                    ${childrenHTML}

                </section>
                `
                :
                ""
            }

        </main>
    `;

    initCoverDrag(document);
    initFeedbackPrompt();

}

loadPage()
    .then(async()=>{

        onAdminStateChanged(
            admin=>{

                pageAdminMode=admin;

                if(admin){

                    initAdmin(
                        page,
                        updates
                    );

                }

            }
        );

        await revealPage();

        await restoreModalFromUrl();

    })
    .catch(error=>{

        console.error(
            "Ошибка загрузки страницы:",
            error
        );

    });
