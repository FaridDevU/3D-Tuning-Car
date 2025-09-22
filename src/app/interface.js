
import $ from 'jquery';

const PALETTE_HTML = $(`<div class="config-palette">

        <div class="config-palette__wrapper">

            <ul class="config-tab__list">

                <li>
                    <a class="config-tab" data-id="body_colors">
                        <span>BODY COLOR</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="mirror_colors">
                        <span>SIDE MIRRORS</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="wheel_designs">
                        <span>WHEELS</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="wheel_colors">
                        <span>WHEEL COLOR</span>
                    </a>
                </li>

                <li>
                    <a class="config-tab" data-id="caliper_colors">
                        <span>CALIPERS</span>
                    </a>
                </li>

            </ul>

            <div class="config-options__wrap">
                <div id="body_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="mirror_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="wheel_designs" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="wheel_colors" class="config-options">
                    <ul>
                    </ul>
                </div>

                <div id="caliper_colors" class="config-options">
                    <ul>
                    </ul>
                </div>
            </div>
        </div>
     </div>`);

export const Interface = (() => {
    let metaData = {};
    let cBodyColor;
    let cOVRMColor;
    let cbOnEntityColor = (target, color) => void 0;
    let cbOnEntityVisible = (target) => void 0;

    const appendTextureSwatches = (container, config, cb) => {
        $(container).empty();
        config.designs.forEach(design => {
            const url = `assets/aventador/${design.thumb}.png`;
            const swatch = $(`<li><button class="texture-swatch"><span>${design.name}</span></button></li>`)
            $('button', swatch).css({ 'background-image': 'url(' + url + ')' });
            $('button', swatch).on('click', ((e) => { return () => cb(e) })(design.value));
            $(container.append(swatch));
        })
    }

    const appendColorSwatches = (container, config, def, cb) => {
        $(container).empty();
        var colorList = config.colors.slice(0);
        if (def)
            colorList.unshift({ "name": "Current", "value": def });
        colorList.forEach(color => {
            const swatch = $(`<li><button class="color-swatch"><span>${color.name}</span></button></li>`)
            $('button', swatch).css({ "background": color.value });
            $('button', swatch).on('click', ((e, c) => { return () => cb(e, c) })(config.target, color.value));
            $(container).append(swatch);
        })
    }

    const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                               (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    const onConfigTabClicked = (item) => {
        const target = $(item.currentTarget)
        const tabId = target.data('id');

        if (isMobile()) {
            item.preventDefault();
            target.addClass('mobile-active');
            setTimeout(() => target.removeClass('mobile-active'), 150);
        }

        if (target.hasClass("active")) {
            $(`#${tabId} > ul`, PALETTE_HTML).empty();
            return target.removeClass('active');
        }
        $('.config-tab', PALETTE_HTML).removeClass('active');
        $('.config-options', PALETTE_HTML).hide();
        const container = $(`#${tabId} > ul`, PALETTE_HTML);
        if (tabId == 'wheel_designs') {
            appendTextureSwatches(container, metaData[tabId], (target) => {
                if (!cbOnEntityVisible) return;
                cbOnEntityVisible(target);
            })
        }
        else {
            appendColorSwatches(container, metaData[tabId], (tabId === 'mirror_colors') ? cBodyColor : null, (target, color) => {
                if (!cbOnEntityColor) return;
                cbOnEntityColor(target, color);
                if (target == 'Mt_MirrorCover') cOVRMColor = color;
                if (target == 'Mt_Body') {
                    cBodyColor = color;
                    if (metaData.mirror_colors.colors.filter(e => e.value === cOVRMColor).length === 0)
                        cbOnEntityColor('Mt_MirrorCover', color);
                }
            })
        }
        $(`.config-tab[data-id=${tabId}]`, PALETTE_HTML).addClass("active");
        $(`#${tabId}`, PALETTE_HTML).show();
    }

    const initialize = (meta) => {
        metaData = meta;
        cBodyColor = meta.body_colors.colors[meta.body_colors.default].value;
        cOVRMColor = meta.mirror_colors.colors[meta.mirror_colors.default].value;
        $('body').append(PALETTE_HTML);
        $('.config-tab', PALETTE_HTML).on('click', onConfigTabClicked);
    }

    const setOnEntityColor = (cb) => cbOnEntityColor = cb;
    const setOnEntityVisible = (cb) => cbOnEntityVisible = cb;

    return { initialize, setOnEntityColor, setOnEntityVisible }
})();