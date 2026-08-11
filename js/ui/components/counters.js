// ======================================
// Field counters
// ======================================

export function setupFieldCounters(root){

    const fields = [

        {
            selector:
                "#entityTitle",

            counter:
                '[data-counter-for="entityTitle"]'
        },

        {
            selector:
                "#entityDescription",

            counter:
                '[data-counter-for="entityDescription"]'
        },

        {
            selector:
                "#entity_author",

            counter:
                '[data-counter-for="entity_author"]'
        }

    ];

    fields.forEach(field=>{

        const input =
            root.querySelector(
                field.selector
            );

        const counter =
            root.querySelector(
                field.counter
            );

        if(!input || !counter){

            return;

        }

        function updateCounter(){

            const remaining =
                input.maxLength -
                input.value.length;

            counter.textContent =
                `Осталось: ${remaining}`;

        }

        input.addEventListener(
            "input",
            updateCounter
        );

        updateCounter();

    });

}
