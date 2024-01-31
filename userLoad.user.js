// ==UserScript==
// @name 小酥的动作拓展
// @namespace https://www.bondageprojects.com/
// @version 0.0.1
// @description 小酥的动作拓展 一些额外的动作
// @author XiaoSu
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @run-at document-end
// @grant none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    script.langauge = "JavaScript";
    script.setAttribute("crossorigin", "anonymous");
    script.src = `https://iceriny.github.io/XiaoSuActivity/bundle.js?${Date.now()}`;
    document.head.appendChild(script);
})();
