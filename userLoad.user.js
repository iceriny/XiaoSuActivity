// ==UserScript==
// @name         小酥的动作拓展
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  小酥的动作拓展 一些额外的动作
// @author       XiaoSu
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bondage-europe.com
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://github.com/FuhuiNeko/BC_Mods/raw/main/Fuhui_Sub_Activity_Main.js?t=' + new Date().getTime(),
        onload: function (response) {
            if (response.status == 200) {
                let script = document.createElement('script')
                script.textContent = response.responseText;
                document.head.appendChild(script);
                console.log('小酥的动作拓展成功加载!');
            } else {
                console.error('小酥的动作拓展加载失败!', response.status, response.statusText);
            }
        }, onerror: function (error) {
            console.error('小酥的动作拓展 - 加载时发生了错误...', error);
        }
    });
})();