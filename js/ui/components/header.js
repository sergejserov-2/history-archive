// ======================================
// Header component
// ======================================

export function renderHeader() {

    return `

<header class="header">

    <div class="header__logo">

        <a href="index.html">
            История района
        </a>

    </div>

    <div class="header__search">

        <input
            type="text"
            id="searchInput"
            placeholder="Поиск..."
        >

    </div>

    <div class="header__buttons">

        <button id="loginButton">

            Войти

        </button>

    </div>

</header>

`;

}
