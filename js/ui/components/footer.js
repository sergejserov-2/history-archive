export function renderFooter(){
    return`
        <footer class="footer">
            <div class="footer__content">
                <div class="footer__main">
                    <div class="footer__project">
                        <div class="footer__title">
                            Краснохолмское краеведение
                        </div>
                        <div class="footer__description">
                            Цифровой архив, посвящённый истории
                            Краснохолмского района. Авторы проекта - Сергей и Ангелина Серовы.
                        </div>
                    </div>

                    <div class="footer__column">
                        <div class="footer__heading">
                            Связь
                        </div>
                        <a
                            class="footer__link"
                            href="#"
                        >
                            ВКонтакте
                        </a>
                        <a
                            class="footer__link"
                            href="#"
                        >
                            Telegram
                        </a>
                        <button
                            class="footer__link footer__feedback"
                            type="button"
                            data-feedback-open
                        >
                            Обратная связь
                        </button>
                    </div>

                    <div class="footer__column">
                        <div class="footer__heading">
                            Информация
                        </div>
                        <a
                            class="footer__link"
                            href="#"
                        >
                            Использование материалов
                        </a>
                        <a
                            class="footer__link"
                            href="#"
                        >
                            Правообладателям
                        </a>
                        <a
                            class="footer__link"
                            href="#"
                        >
                            Сообщить об ошибке
                        </a>
                    </div>
                </div>

                <div class="footer__bottom">
                    <span>
                        История Краснохолмского района · 2026
                    </span>

                    <span>
                        Архив постоянно пополняется
                    </span>
                </div>
            </div>
        </footer>
    `;
}
