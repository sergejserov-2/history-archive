// ======================================
// Subjects page
// ======================================

import {renderHeader} from "../components/header.js";

import {getSubjects} from "../../api/subjects.js";
import {getSubjectTypes} from "../../api/subjectTypes.js";

import {renderEntityList} from "../components/entityList.js";

import {isAdmin} from "../../admin/adminMode.js";

// ======================================
// Init
// ======================================

init();

async function init(){

    document.getElementById("header").innerHTML =
        renderHeader();

    const [
        subjects,
        subjectTypes
    ] = await Promise.all([
        getSubjects(),
        getSubjectTypes()
    ]);

    renderPage(
        subjects,
        subjectTypes
    );
}

// ======================================
// Page
// ======================================

function renderPage(
    subjects,
    subjectTypes
){

    const page =
        document.getElementById(
            "subjectsPage"
        );

    const groups =
        buildGroups(
            subjects,
            subjectTypes
        );

    const addButton =
        isAdmin()
        ?
        `
        <div
            class="entity-list__add admin-button"
            data-action="add-subject"
        >
            + Добавить субъект
        </div>
        `
        :
        "";

    page.innerHTML = `
        <section>

            <h1>
                Субъекты
            </h1>

            ${
                renderEntityList({
                    groups,
                    addButton
                })
            }

        </section>
    `;
}

// ======================================
// Groups
// ======================================

function buildGroups(
    subjects,
    subjectTypes
){

    const groups = [];

    const sortedTypes =
        [...subjectTypes]
        .sort(
            (a,b)=>
                (a.title ?? "")
                .localeCompare(
                    b.title ?? "",
                    "ru"
                )
        );

    for(const type of sortedTypes){

        const items =
            subjects
            .filter(
                subject=>
                    subject.typeId === type.id
            )
            .sort(
                (a,b)=>
                    (a.title ?? "")
                    .localeCompare(
                        b.title ?? "",
                        "ru"
                    )
            )
            .map(
                subject=>
                    createSubjectRow(
                        subject
                    )
            );

        if(!items.length){
            continue;
        }

        groups.push({
            title:
                type.title,
            items
        });
    }

    const withoutType =
        subjects
        .filter(
            subject=>
                !subject.typeId ||
                !subjectTypes.some(
                    type=>
                        type.id ===
                        subject.typeId
                )
        )
        .sort(
            (a,b)=>
                (a.title ?? "")
                .localeCompare(
                    b.title ?? "",
                    "ru"
                )
        )
        .map(
            subject=>
                createSubjectRow(
                    subject
                )
        );

    if(withoutType.length){

        groups.push({
            title:
                "Без типа",
            items:
                withoutType
        });
    }

    return groups;
}

// ======================================
// Row
// ======================================

function createSubjectRow(
    subject
){

    return {

        title:
            subject.title ??
            "Без названия",

        description:
            "",

        meta:
            formatPeriod(
                subject
            ),

        actions:
            isAdmin()
            ?
            `
            <button
                class="admin-button"
                data-action="edit-subject"
                data-id="${subject.id}"
            >
                <img
                    src="icons/edit.svg"
                    class="admin-icon"
                >
            </button>

            <button
                class="admin-button"
                data-action="delete-subject"
                data-id="${subject.id}"
            >
                <img
                    src="icons/delete.svg"
                    class="admin-icon"
                >
            </button>
            `
            :
            "",

        href:
            `object.html?modal=subject&entityId=${subject.id}`
    };
}

// ======================================
// Period
// ======================================

function formatPeriod(
    subject
){

    if(
        subject.dateStart &&
        subject.dateEnd
    ){
        return `${subject.dateStart} – ${subject.dateEnd}`;
    }

    if(subject.dateStart){
        return `с ${subject.dateStart}`;
    }

    if(subject.dateEnd){
        return `до ${subject.dateEnd}`;
    }

    return "";
}
