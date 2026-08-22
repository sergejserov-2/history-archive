export function renderDate(value){

    if(!value)return"";

    const date=value instanceof Date
        ?value
        :new Date(value);

    if(Number.isNaN(date.getTime()))return"";

    const months=[
        "I","II","III","IV","V","VI",
        "VII","VIII","IX","X","XI","XII"
    ];

    const day=String(date.getDate()).padStart(2,"0");
    const month=months[date.getMonth()];
    const year=String(date.getFullYear()).slice(-2);

    return`
        <span class="date">
            <span class="date__day">${day}</span>
            <span class="date__slash">/</span>
            <span class="date__month">${month}</span>
            <span class="date__year">–${year}</span>
        </span>
    `;
}

export function renderDateTime(value){

    if(!value)return"";

    const date=value instanceof Date
        ?value
        :new Date(value);

    if(Number.isNaN(date.getTime()))return"";

    const time=date.toLocaleTimeString(
        "ru-RU",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

    return`${renderDate(date)}, ${time}`;
}
