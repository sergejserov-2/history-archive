import {
    renderObjectEditor,
    initObjectEditor
}
from "./editors/objectEditor.js";

export function initAdmin(

    object,

    types,

    objects

) {

document.addEventListener(

"click",

event=>{

const button =
event.target.closest(
".admin-button"
);

if(!button)
return;

const block =
document.querySelector(
".object__info"
);

block.innerHTML =

renderObjectEditor(

object,

types,

objects

);

initObjectEditor(

object,

types,

objects,

()=>location.reload()

);

}

);

}
