var XiaoSuActivity=function(exports){"use strict";const XSActivity_VERSION="v0.1.3",DEBUG=!0;function getDefaultExportFromCjs(x){return x&&x.__esModule&&Object.prototype.hasOwnProperty.call(x,"default")?x.default:x}var bcmodsdk={};!function(exports){!function(){const e="1.1.0";function o(e){alert("Mod ERROR:\n"+e);const o=new Error(e);throw console.error(o),o}const t=new TextEncoder;function n(e){return!!e&&"object"==typeof e&&!Array.isArray(e)}function r(e){const o=new Set;return e.filter((e=>!o.has(e)&&o.add(e)))}const i=new Map,a=new Set;function d(e){a.has(e)||(a.add(e),console.warn(e))}function s(e){const o=[],t=new Map,n=new Set;for(const r of p.values()){const i=r.patching.get(e.name);if(i){o.push(...i.hooks);for(const[o,a]of i.patches.entries())t.has(o)&&t.get(o)!==a&&d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o)||""}\nPatch2:\n${a}`),t.set(o,a),n.add(r.name)}}o.sort(((e,o)=>o.priority-e.priority));const r=function(e,o){if(0===o.size)return e;let t=e.toString().replaceAll("\r\n","\n");for(const[n,r]of o.entries())t.includes(n)||d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(e.original,t);let i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,e.name,n),d=r.apply(this,o);return null==a||a(),d};for(let t=o.length-1;t>=0;t--){const n=o[t],r=i;i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,e.name,n.mod),d=n.hook.apply(this,[o,e=>{if(1!==arguments.length||!Array.isArray(o))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`);return r.call(this,e)}]);return null==a||a(),d}}return{hooks:o,patches:t,patchesSources:n,enter:i,final:r}}function c(e,o=!1){let r=i.get(e);if(r)o&&(r.precomputed=s(r));else{let o=window;const a=e.split(".");for(let t=0;t<a.length-1;t++)if(o=o[a[t]],!n(o))throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const d=o[a[a.length-1]];if("function"!=typeof d)throw new Error(`ModSDK: Function ${e} to be patched not found`);const c=function(e){let o=-1;for(const n of t.encode(e)){let e=255&(o^n);for(let o=0;o<8;o++)e=1&e?-306674912^e>>>1:e>>>1;o=o>>>8^e}return((-1^o)>>>0).toString(16).padStart(8,"0").toUpperCase()}(d.toString().replaceAll("\r\n","\n")),l={name:e,original:d,originalHash:c};r=Object.assign(Object.assign({},l),{precomputed:s(l),router:()=>{},context:o,contextProperty:a[a.length-1]}),r.router=function(e){return function(...o){return e.precomputed.enter.apply(this,[o])}}(r),i.set(e,r),o[r.contextProperty]=r.router}return r}function l(){const e=new Set;for(const o of p.values())for(const t of o.patching.keys())e.add(t);for(const o of i.keys())e.add(o);for(const o of e)c(o,!0)}function f(){const e=new Map;for(const[o,t]of i)e.set(o,{name:o,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((e=>e.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return e}const p=new Map;function u(e){p.get(e.name)!==e&&o(`Failed to unload mod '${e.name}': Not registered`),p.delete(e.name),e.loaded=!1,l()}function g(e,t,r){"string"==typeof e&&"string"==typeof t&&(alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`),e={name:e,fullName:e,version:t},t={allowReplace:!0===r}),e&&"object"==typeof e||o("Failed to register mod: Expected info object, got "+typeof e),"string"==typeof e.name&&e.name||o("Failed to register mod: Expected name to be non-empty string, got "+typeof e.name);let i=`'${e.name}'`;"string"==typeof e.fullName&&e.fullName||o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`),i=`'${e.fullName} (${e.name})'`,"string"!=typeof e.version&&o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`),e.repository||(e.repository=void 0),void 0!==e.repository&&"string"!=typeof e.repository&&o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`),null==t&&(t={}),t&&"object"==typeof t||o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`);const a=!0===t.allowReplace,d=p.get(e.name);d&&(d.allowReplace&&a||o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(d));const s=e=>{"string"==typeof e&&e||o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`);let t=g.patching.get(e);return t||(t={hooks:[],patches:new Map},g.patching.set(e,t)),t},f={unload:()=>u(g),hookFunction:(e,t,n)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);"number"!=typeof t&&o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`);const a={mod:g.name,priority:t,hook:n};return r.hooks.push(a),l(),()=>{const e=r.hooks.indexOf(a);e>=0&&(r.hooks.splice(e,1),l())}},patchFunction:(e,t)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);n(t)||o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`);for(const[n,a]of Object.entries(t))"string"==typeof a?r.patches.set(n,a):null===a?r.patches.delete(n):o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`);l()},removePatches:e=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),s(e).patches.clear(),l()},callOriginal:(e,t,n)=>(g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),"string"==typeof e&&e||o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`),Array.isArray(t)||o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`),function(e,o,t=window){return c(e).original.apply(t,o)}(e,t,n)),getOriginalHash:e=>("string"==typeof e&&e||o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`),c(e).originalHash)},g={name:e.name,fullName:e.fullName,version:e.version,repository:e.repository,allowReplace:a,api:f,loaded:!0,patching:new Map};return p.set(e.name,g),Object.freeze(f)}function h(){const e=[];for(const o of p.values())e.push({name:o.name,fullName:o.fullName,version:o.version,repository:o.repository});return e}let m;const y=function(){if(void 0===window.bcModSdk)return window.bcModSdk=function(){const o={version:e,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:f,errorReporterHooks:Object.seal({hookEnter:null,hookChainExit:null})};return m=o,Object.freeze(o)}();if(n(window.bcModSdk)||o("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==e&&(alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk.version.startsWith("1.0.")&&void 0===window.bcModSdk._shim10register)){const e=window.bcModSdk,o=Object.freeze(Object.assign(Object.assign({},e),{registerMod:(o,t,n)=>o&&"object"==typeof o&&"string"==typeof o.name&&"string"==typeof o.version?e.registerMod(o.name,o.version,"object"==typeof t&&!!t&&!0===t.allowReplace):e.registerMod(o,t,n),_shim10register:!0}));window.bcModSdk=o}return window.bcModSdk}();Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y}()}(bcmodsdk);var bcModSDKRef=getDefaultExportFromCjs(bcmodsdk);const modules={};var ChangeType;!function(ChangeType){ChangeType[ChangeType.main=0]="main",ChangeType[ChangeType.dev=1]="dev"}(ChangeType||(ChangeType={}));let CHANGELOG=[{version:"0.0.1",description:"Initial release",type:ChangeType.dev,changes:["完成基本框架测试中..."]},{version:"0.0.2",description:"修复",type:ChangeType.dev,changes:["修复若干bug","添加部分动作"]},{version:"0.0.3",description:"修复",type:ChangeType.dev,changes:["修复若干bug","完善框架"]},{version:"0.0.4",description:"终于修复了重复加载的Bug",type:ChangeType.dev,changes:["修复重复加载的BUG!!!!!! O.o","修复若干其他bug","完善框架"]},{version:"0.0.5",description:"优化",type:ChangeType.dev,changes:["优化版本信息显示效果"]},{version:"0.1.0",description:"正式发布!当前功能如下: ",type:ChangeType.main,changes:["使用命令导出当前聊天室聊天记录 支持按时间范围导出 详细请查看 /xsa ","添加9个额外动作."]},{version:"0.1.1",description:"添加了新的动作.",type:ChangeType.main,changes:["添加了额外的17个动作","添加 /xsa act 命令 显示添加的全部动作","完成功能自动口吃处理命令:(` + message) --请输入 /xsa jieba 查看帮助"]},{version:"0.1.2",description:"添加修改高潮逻辑.",type:ChangeType.main,changes:["修复一些bug","修复了若干错别字","修改边缘影响，现在每45秒钟 边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间，如果失去边缘状态，则同样的时间后失去一层抵抗难度，并且减少0.3~1.3秒高潮持续时间."]},{version:"0.1.3",description:".",type:ChangeType.dev,changes:[]}];const bcModSDK=bcModSDKRef.registerMod({name:"XiaoSuActivity",fullName:"XiaoSu's Activity Expand",version:XSActivity_VERSION.startsWith("v")?XSActivity_VERSION.slice(1):XSActivity_VERSION,repository:"https://github.com/iceriny/XiaoSuActivity"});var ModuleCategory,MSGType;function hookFunction(target,priority,hook){return bcModSDK.hookFunction(target,priority,hook)}function conDebug(msg){if(!1===DEBUG)return;let result="string"==typeof msg?{name:"XiaoSuActivity_Debug",type:MSGType.DebugLog,content:msg,time:(new Date).toLocaleString(),ModVersion:XSActivity_VERSION}:{name:msg.name,type:msg.type,content:msg.content,time:(new Date).toLocaleString(),ModVersion:XSActivity_VERSION};console.debug(result)}function GetModule(moduleName){return modules[moduleName]}function copyAndDownloadHtmlElement(element,fileName,time_limit=null){const newDoc=document.implementation.createHTMLDocument();if(null===element)return void conDebug("element is null");const copiedElement=element.cloneNode(!0);null!==time_limit&&function(element,time_limit){element.querySelectorAll("[data-time]").forEach((element=>{const dataTimeValue=element.getAttribute("data-time");if(dataTimeValue){const currentTime=new Date(`2000-01-01 ${dataTimeValue}`),minTimeDate=new Date(`2000-01-01 ${time_limit.minTime}`),maxTimeDate=new Date(`2000-01-01 ${time_limit.maxTime}`);maxTimeDate<minTimeDate&&maxTimeDate.setDate(maxTimeDate.getDate()+1),(currentTime<minTimeDate||currentTime>maxTimeDate)&&element.remove()}}))}(copiedElement,time_limit),function(element){const style=element.style;for(;style.length>0;)style.removeProperty(style[0])}(copiedElement),copiedElement.style.fontSize="14.784px",copiedElement.style.fontFamily="Arial, sans-serif",copiedElement.style.display="flex",copiedElement.style.flexDirection="column",copiedElement.style.width="70vw",newDoc.body.style.display="flex",newDoc.body.style.alignItems="center",newDoc.body.style.justifyContent="center",newDoc.body.style.backgroundColor="#f2f2f2",newDoc.body.appendChild(copiedElement);const htmlString=newDoc.documentElement.outerHTML,blob=new Blob([htmlString],{type:"text/html"}),link=document.createElement("a");link.href=URL.createObjectURL(blob),link.download=fileName,link.click()}!function(ModuleCategory){ModuleCategory[ModuleCategory.Core=-1]="Core",ModuleCategory[ModuleCategory.Global=0]="Global",ModuleCategory[ModuleCategory.Test=1]="Test"}(ModuleCategory||(ModuleCategory={})),function(MSGType){MSGType[MSGType.DebugLog=0]="DebugLog",MSGType[MSGType.Workflow_Log=1]="Workflow_Log"}(MSGType||(MSGType={}));class BaseModule{constructor(){this.moduleName="Base",this.priority=0,this.Loaded=!1,this.init()}}const selfPlaceholder="SourceCharacter";class ActivityModule extends BaseModule{constructor(){super(...arguments),this.activityToAddDict={"XSAct_眯眼":{act:{Name:"XSAct_眯眼",Target:[""],TargetSelf:["ItemHead"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}眯了眯眼.`],img:"RestHead"},"XSAct_眼神飘忽":{act:{Name:"XSAct_眼神飘忽",Target:[""],TargetSelf:["ItemHead"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}眼神飘忽的左看右看.`],img:"RestHead"},"XSAct_甩头发":{act:{Name:"XSAct_甩头发",Target:[""],TargetSelf:["ItemHood"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["ItemHoodCovered"]},desc:null,descString:["",`${selfPlaceholder}甩动着头发.`],img:"RestHead"},"XSAct_大力甩头发":{act:{Name:"XSAct_大力甩头发",Target:[""],TargetSelf:["ItemHood"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["ItemHoodCovered"]},desc:null,descString:["",`${selfPlaceholder}连连摇头，慌乱的甩动着头发.`],img:"RestHead"},"XSAct_轻抚发梢":{act:{Name:"XSAct_轻抚发梢",Target:["ItemHood"],TargetSelf:["ItemHood"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["ItemHoodCovered","TargetItemHoodCovered","CantUseArms"]},desc:null,descString:[`${selfPlaceholder}轻柔抚动着TargetCharacter的头发.`,`${selfPlaceholder}轻柔抚动着自己的头发.`],img:"RestHead"},"XSAct_叼起头发":{act:{Name:"XSAct_叼起头发",Target:["ItemHood"],TargetSelf:["ItemHood"],MaxProgress:50,MaxProgressSelf:20,Prerequisite:["UseMouth","ItemHoodCovered","TargetItemHoodCovered"],StimulationAction:"Talk"},desc:null,descString:[`${selfPlaceholder}轻轻咬起TargetCharacter的头发.`,`${selfPlaceholder}轻轻咬起自己的头发.`],img:"SiblingsCheekKiss"},"XSAct_嗅头发":{act:{Name:"XSAct_嗅头发",Target:["ItemHood"],TargetSelf:["ItemHood"],MaxProgress:30,MaxProgressSelf:30,Prerequisite:["ItemHoodCovered","TargetItemHoodCovered"],StimulationAction:"Talk"},desc:null,descString:[`${selfPlaceholder}在TargetCharacter的发间嗅着，鼻息弥漫着TargetCharacter的发香.`,`${selfPlaceholder}撩起自己的头发轻轻嗅着.`],img:"SiblingsCheekKiss"},"XSAct_绕头发":{act:{Name:"XSAct_绕头发",Target:["ItemHood"],TargetSelf:["ItemHood"],MaxProgress:30,MaxProgressSelf:30,Prerequisite:["CantUseArms","ItemHoodCovered","TargetItemHoodCovered"]},desc:null,descString:[`${selfPlaceholder}勾起一缕TargetCharacter的发丝，在指尖绕来绕去.`,`${selfPlaceholder}勾起自己的一缕头发在指尖绕来绕去.`],img:"SiblingsCheekKiss"},"XSAct_皱鼻子":{act:{Name:"XSAct_皱鼻子",Target:[""],TargetSelf:["ItemNose"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["ItemHoodCovered"]},desc:null,descString:["",`${selfPlaceholder}皱了皱自己的鼻头.`],img:"RestHead"},"XSAct_打喷嚏":{act:{Name:"XSAct_打喷嚏",Target:[""],TargetSelf:["ItemNose"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["UseMouth","ItemHoodCovered"],StimulationAction:"Talk"},desc:null,descString:["",`${selfPlaceholder}打了个喷嚏.`],img:"Kiss"},"XSAct_深呼吸":{act:{Name:"XSAct_深呼吸",Target:[""],TargetSelf:["ItemNose"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["UseMouth","ItemHoodCovered"],StimulationAction:"Talk"},desc:null,descString:["",`${selfPlaceholder}深深的吸了口气.`],img:"Kiss"},"XSAct_低头":{act:{Name:"XSAct_低头",Target:[""],TargetSelf:["ItemHood"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["ItemHoodCovered","MoveHead"]},desc:null,descString:["",`${selfPlaceholder}红润着脸蛋低头逃避.`],img:"RestHead"},"XSAct_恳求的摇头":{act:{Name:"XSAct_恳求的摇头",Target:["ItemHead"],TargetSelf:[""],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["MoveHead"]},desc:null,descString:[`${selfPlaceholder}对着TargetCharacter的方向恳求的摇头.`,""],img:"RestHead"},"XSAct_恳求的看":{act:{Name:"XSAct_恳求的看",Target:["ItemHead"],TargetSelf:[""],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["TargetZoneNaked","MoveHead"]},desc:null,descString:[`${selfPlaceholder}汪着眼睛恳求的看着TargetCharacter.`,""],img:"RestHead"},"XSAct_内八夹腿":{act:{Name:"XSAct_内八夹腿",Target:[""],TargetSelf:["ItemLegs"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}通红的脸蛋忍耐着快感，大腿紧紧夹起来，摆出着内八的姿势，身体微微颤抖.`],img:"Kick"},"XSAct_噘嘴":{act:{Name:"XSAct_噘嘴",Target:[""],TargetSelf:["ItemMouth","ItemMouth2","ItemMouth3"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["UseMouth"]},desc:null,descString:["",`${selfPlaceholder}有些不满的噘起嘴巴.`],img:"PoliteKiss"},"XSAct_抿住嘴巴":{act:{Name:"XSAct_抿住嘴巴",Target:[""],TargetSelf:["ItemMouth","ItemMouth2","ItemMouth3"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["UseMouth"]},desc:null,descString:["",`${selfPlaceholder}抿住嘴巴.`],img:"PoliteKiss"},"XSAct_瘪嘴":{act:{Name:"XSAct_瘪嘴",Target:[""],TargetSelf:["ItemMouth","ItemMouth2","ItemMouth3"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["UseMouth"]},desc:null,descString:["",`${selfPlaceholder}瘪着嘴巴，一副委屈的样子.`],img:"PoliteKiss"},"XSAct_坐直身体":{act:{Name:"XSAct_坐直身体",Target:[""],TargetSelf:["ItemTorso","ItemTorso2"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}挺直了腰，坐直了身体.`],img:"Kick"},"XSAct_挺胸收腹":{act:{Name:"XSAct_挺胸收腹",Target:[""],TargetSelf:["ItemBreast"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}挺起胸部，微收下巴，腹部用力收腰.`],img:"Kick"},"XSAct_站直身体":{act:{Name:"XSAct_站直身体",Target:[""],TargetSelf:["ItemTorso","ItemTorso2"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["NotKneeling"]},desc:null,descString:["",`${selfPlaceholder}挺胸收腹，努力绷紧小腿，站直了身体.`],img:"Kick"},"XSAct_身体一颤":{act:{Name:"XSAct_身体一颤",Target:[""],TargetSelf:["ItemTorso","ItemTorso2"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}的身体猛然颤抖了一下.`],img:"Kick"},"XSAct_活动大腿":{act:{Name:"XSAct_活动大腿",Target:[""],TargetSelf:["ItemLegs"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}尝试活动了一下腿部.`],img:"Kick"},"XSAct_活动手臂":{act:{Name:"XSAct_活动手臂",Target:[""],TargetSelf:["ItemArms"],MaxProgress:30,MaxProgressSelf:30,Prerequisite:["CantUseArms"]},desc:null,descString:["",`${selfPlaceholder}一边按摩一边活动着手臂.`],img:"MasturbateHand"},"XSAct_绷紧膝盖":{act:{Name:"XSAct_绷紧膝盖",Target:[""],TargetSelf:["ItemLegs"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["NotKneeling"]},desc:null,descString:["",`${selfPlaceholder}努力的绷紧膝盖，尽可能站的更直.`],img:"Kick"},"XSAct_绷直脚踝":{act:{Name:"XSAct_绷直脚踝",Target:[""],TargetSelf:["ItemBoots"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}不自觉的用力绷直脚踝，释放涌来的快感.`],img:"Kick"},"XSAct_蜷缩脚趾":{act:{Name:"XSAct_蜷缩脚趾",Target:[""],TargetSelf:["ItemBoots"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]},desc:null,descString:["",`${selfPlaceholder}脚趾互相纠结，又时而蜷缩，忍耐着快感袭来.`],img:"Kick"},"XSAct_踮脚":{act:{Name:"XSAct_踮脚",Target:[""],TargetSelf:["ItemBoots"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:["CantUseFeet"]},desc:null,descString:["",`${selfPlaceholder}努力的踮起脚.`],img:"Kick"}},this.prerequisiteDict={ItemHoodCovered:{Name:"ItemHoodCovered",Action:args=>{const acting=args[1];return this.Judgment.ItemHoodCovered(acting)}},TargetItemHoodCovered:{Name:"TargetItemHoodCovered",Action:args=>{const acted=args[2];return this.Judgment.ItemHoodCovered(acted)}},ItemNoseCovered:{Name:"ItemNoseCovered",Action:args=>{const acting=args[1];return this.Judgment.ItemNoseCovered(acting)}},Kneeling:{Name:"Kneeling",Action:args=>{const acting=args[1];return this.Judgment.Kneeling(acting)}},NotKneeling:{Name:"NotKneeling",Action:args=>{const acting=args[1];return this.Judgment.NotKneeling(acting)}}},this.Judgment={ItemHoodCovered:acting=>""===InventoryPrerequisiteMessage(acting,"HoodEmpty"),ItemNoseCovered:acting=>InventoryGroupIsBlocked(acting,"NoseEmpty",!0),Kneeling:acting=>acting.IsKneeling(),NotKneeling:acting=>!acting.IsKneeling()}}init(){this.moduleName="ActivityModule",this.priority=50}Load(){this.LoadActivity(),this.hookListHandler(),this.Loaded=!0}hookListHandler(){hookFunction("ServerSend",5,((args,next)=>{var _a,_b,_c;if("ChatRoomChat"==args[0]&&"Activity"==(null===(_a=args[1])||void 0===_a?void 0:_a.Type)){let data=args[1];if(0==(null!==(_c=null===(_b=data.Dictionary[3])||void 0===_b?void 0:_b.ActivityName)&&void 0!==_c?_c:"").indexOf("XSAct_")){let{metadata:metadata,substitutions:substitutions}=ChatRoomMessageRunExtractors(data,Player),msg=ActivityDictionaryText(data.Content);msg=CommonStringSubstitute(msg,null!=substitutions?substitutions:[]),data.Dictionary.push({Tag:"MISSING ACTIVITY DESCRIPTION FOR KEYWORD "+data.Content,Text:msg})}}return next(args)})),hookFunction("ActivityCheckPrerequisite",500,((args,next)=>{const prereq=args[0];if(prereq in this.prerequisiteDict){return this.prerequisiteDict[prereq].Action(args)}return next(args)})),hookFunction("DrawImageResize",10,((args,next)=>{const parts=args[0].split("/"),aName=parts[parts.length-1].replace(".png","");if(0==aName.indexOf("XSAct_")){const resultName=`Assets/Female3DCG/Activity/${this.activityToAddDict[aName].img}.png`;return args[0]=resultName,next(args)}return next(args)})),hookFunction("ChatRoomMessage",this.priority,((args,next)=>{var _a,_b,_c,_d,_e;const data=args[0];if(conDebug({name:"ChatRoomMessage",type:MSGType.DebugLog,content:data}),"Activity"==data.Type){const actName=null===(_a=data.Dictionary[3])||void 0===_a?void 0:_a.ActivityName,TargetCharacter=null===(_b=data.Dictionary[1])||void 0===_b?void 0:_b.TargetCharacter;"Tickle"!=actName||Number.isNaN(TargetCharacter)||TargetCharacter!=(null===Player||void 0===Player?void 0:Player.MemberNumber)||(conDebug({type:MSGType.DebugLog,name:"检测到自己为目标的瘙痒动作",content:{"高潮阶段":null===(_c=Player.ArousalSettings)||void 0===_c?void 0:_c.OrgasmStage,"抵抗难度":ActivityOrgasmGameResistCount}}),1==(null===(_d=Player.ArousalSettings)||void 0===_d?void 0:_d.OrgasmStage)&&(conDebug({type:MSGType.DebugLog,name:"捕捉到抵抗场景，开始截断抵抗 增加难度 并重新触发",content:{"高潮阶段":null===(_e=Player.ArousalSettings)||void 0===_e?void 0:_e.OrgasmStage,"抵抗难度":ActivityOrgasmGameResistCount}}),ActivityOrgasmGameResistCount++,function(msg,sourceCharacter,targetCharacter){const sourceCharacterObj=sourceCharacter?ChatRoomCharacter.find((c=>c.MemberNumber==sourceCharacter)):void 0,targetCharacterObj=targetCharacter?ChatRoomCharacter.find((c=>c.MemberNumber==targetCharacter)):void 0;if(void 0===sourceCharacterObj&&void 0===targetCharacterObj)return;const sourceCharacterNickname=sourceCharacterObj?CharacterNickname(sourceCharacterObj):"",targetCharacterNickname=targetCharacterObj?CharacterNickname(targetCharacterObj):"",resultDict=[{Tag:"XSA_ActMessage",Text:msg.replaceAll("{source}",sourceCharacterNickname).replaceAll("{target}",targetCharacterNickname)}];void 0!==sourceCharacter&&resultDict.push({SourceCharacter:sourceCharacter}),void 0!==targetCharacter&&resultDict.push({TargetCharacter:targetCharacter}),conDebug({type:MSGType.Workflow_Log,name:"SendActivity()",content:{Type:"Activity",Content:"XSA_ActMessage",Dictionary:resultDict,Sender:sourceCharacter}}),ServerSend("ChatRoomChat",{Type:"Activity",Content:"XSA_ActMessage",Dictionary:resultDict,Sender:sourceCharacter})}("{target}紧闭双眼尽力抵抗着高潮，但被{source}的瘙痒干扰，从嘴巴里泄露出一声压抑的呻吟，差点没有忍住."),ActivityOrgasmStop(Player,100),ActivityOrgasmPrepare(Player)))}return next(args)}))}LoadActivity(){conDebug("加载自定义活动");let actLength=0;for(const aN in this.activityToAddDict){this.pushToActivity(this.activityToAddDict[aN].act),this.activityDictAdd();const activityDesc=this.activityToAddDict[aN].desc;null==activityDesc||activityDesc.forEach((d=>{null===ActivityDictionary||void 0===ActivityDictionary||ActivityDictionary.push(d)})),actLength+=1}conDebug(`自定义活动加载完成.动作数: ${actLength}`)}activityDictAdd(){for(const a in this.activityToAddDict){const pendingActivity=this.activityToAddDict[a],actName=pendingActivity.act.Name,nameWithoutPrefix=actName.substring(6),actTarget=pendingActivity.act.Target,actTargetSelf=pendingActivity.act.TargetSelf,addedValues=[];if(addedValues.push([`ActivityAct_${actName}`,`${nameWithoutPrefix}`]),addedValues.push([`Activity${actName}`,`${nameWithoutPrefix}`]),actTarget.length>0)for(const aT of actTarget)addedValues.push([`Label-ChatOther-${aT}-${actName}`,`${nameWithoutPrefix}`]),addedValues.push([`ChatOther-${aT}-${actName}`,pendingActivity.descString[0]]);if(void 0!==actTargetSelf&&"boolean"!=typeof actTargetSelf&&actTargetSelf.length>0)for(const aTS of actTargetSelf)addedValues.push([`Label-ChatSelf-${aTS}-${actName}`,`${nameWithoutPrefix}`]),addedValues.push([`ChatSelf-${aTS}-${actName}`,pendingActivity.descString[1]]);pendingActivity.desc=addedValues}}pushToActivity(activity){ActivityFemale3DCG.push(activity),ActivityFemale3DCGOrdering.push(activity.Name)}getAllAct(){const result=[];for(const a in this.activityToAddDict){const suffix=a.substring(6);result.push(suffix)}return conDebug({content:result,name:"ActivityNameXiaosu_onlyName",type:MSGType.DebugLog}),result}}class ChatroomModule extends BaseModule{Load(){this.hookListHandler(),this.Loaded=!0}init(){this.moduleName="ChatroomModule",this.priority=30}hookListHandler(){hookFunction("CommandParse",0,((args,next)=>{let msg=args[0];const match=msg.match(/^`([1-9])?( )? (.*)/);return match&&(msg=this.stammerHandler(match[3],parseInt(match[1]),!match[2])),args[0]=msg,next(args)}))}ExportChat(time_limit=null){const exportName=`${null===ChatRoomData||void 0===ChatRoomData?void 0:ChatRoomData.Name}_${(new Date).toLocaleString()}`;copyAndDownloadHtmlElement(document.getElementById("TextAreaChatLog"),exportName,time_limit)}stammerHandler(content,tenfoldStammeringProbability,isSegmentForCH){conDebug(`stammerHandler: content: ${content} tenfoldStammeringProbability: ${tenfoldStammeringProbability}`),Number.isNaN(tenfoldStammeringProbability)&&(tenfoldStammeringProbability=3);const stammeringProbability=tenfoldStammeringProbability/10,segmentList=isSegmentForCH?function(str){if(conDebug({name:"segmentForCHTest",type:MSGType.DebugLog,content:{Intl:!!window.Intl,Segmenter:!!window.Intl.Segmenter,GAME_LANG:TranslationLanguage.toLowerCase()}}),window.Intl&&window.Intl.Segmenter&&"cn"===TranslationLanguage.toLowerCase()){const segmenterResult=new Intl.Segmenter("zh",{granularity:"word"}).segment(str),results=[];for(const segment of segmenterResult)results.push(segment.segment);return conDebug(`segmentForCH: ${results}`),results}return null}(content.replace(/\s/g,"")):void 0,stringArray=segmentList||content.split(" ");return this.stammerForList(stringArray,stammeringProbability)}stammerForList(messageList,stammeringProbability){let result="";for(let i=0;i<messageList.length;i++){const currentWord=messageList[i];result+=currentWord,Math.random()<stammeringProbability&&(result+=this.addStammerEffect(currentWord)),i<messageList.length-1?Math.random()<stammeringProbability&&(result+="-"):result+="..."}return conDebug({name:"stammer",type:MSGType.DebugLog,content:result}),result}addStammerEffect(word,depth=0){if(depth>=3)return word;let result=Math.random()<.5?"...":`-${word}`;return Math.random()<.2&&(result=this.addStammerEffect(result,depth+1)),result}}const timeRangeRegex=/^(((0|1)\d|2[0-3]):[0-5]\d)-(((0|1)\d|2[0-3]):[0-5]\d)$/;class CommandsModule extends BaseModule{constructor(){super(...arguments),this.commandsDict={help:{Tag:"help",Description:"显示 [小酥的活动模组] 的相关命令.",Action:(args,msg,parsed)=>{this.DisplayHelp()}},export:{Tag:"export",Description:"导出当前聊天室的聊天记录. 输入: ‘/xsa export -h’ 显示导出命令的使用方法.",Action:(args,msg,parsed)=>{const params=this.getCommandParameters(parsed);if("h"==params)ChatRoomSendLocal("输入: ‘/xsa export -[时间]’导出指定时间范围内的聊天记录.\n例如: ‘/xsa export -05:34-20:40’\n默认导出当前聊天室的全部聊天记录.\n注意! \n如果时间段过长例如第一天的05:34到第二天的06:00则可能出现导出错误.",2e4);else if(""===params)conDebug("导出当前聊天室的全部聊天记录"),GetModule("ChatroomModule").ExportChat();else if(timeRangeRegex.test(params)){conDebug(`导出指定的 ${params} 时间段的聊天记录`);const separatorIndex=params.indexOf("-");if(-1!==separatorIndex){const time_limit={minTime:params.slice(0,separatorIndex).trim(),maxTime:params.slice(separatorIndex+1).trim()};GetModule("ChatroomModule").ExportChat(time_limit)}}}},v:{Tag:"v",Description:"显示 [小酥的活动模组] 的版本信息.",Action:(args,msg,parsed)=>{!function(){let content="";for(const c in CHANGELOG){const version=CHANGELOG[c].version,type=CHANGELOG[c].type==ChangeType.main?"主版本":"开发版本",description=CHANGELOG[c].description,changes=CHANGELOG[c].changes;let changesString='<ul style="list-style-position: inside;  padding-left: 0;">';for(const s of changes)changesString+=`<li>${s}</li>`;changesString+="</ul>";const styleForP='style="font-weight: bold; margin: 0;"';content+=`<div style="background-color: ${version!=XSActivity_VERSION||DEBUG||"主版本"!==type?"#442E3A":"#764460"}; display: flex; flex-direction: column;"> <p ${styleForP}>版本: ${version}</p> <p ${styleForP}>类型: ${type}</p> <p ${styleForP}>描述: ${description}</p><p>----</p> <p ${styleForP}>改动: ${changesString}</p><p>========</p></div>`}content+="<p>==当前页面显示时间1分钟==</p>",ChatRoomSendLocal(content,6e4)}()}},act:{Tag:"act",Description:"显示 [小酥的活动模组] 所添加的全部动作列表.",Action:(args,msg,parsed)=>{let content="";GetModule("ActivityModule").getAllAct().forEach((item=>{content+=`<p style="font-weight: bold; margin: 0;">${item}</p>`})),conDebug(`command: AL    content: ${content}`),ChatRoomSendLocal(content,2e4)}},jieba:{Tag:"jieba",Description:"显示 自动结巴效果 的命令帮助.",Action:(args,msg,parsed)=>{const stressStyle="style='word-wrap: break-word;list-style: square;color: #FFCEE9;background-color: #AB6B8E;border-radius: 3px;padding: .2em 0;'";ChatRoomSendLocal(`输入: <span ${stressStyle}>\`</span><span ${stressStyle}>空格</span><span style='word-wrap: break-word;list-style: square;color: #AB899C;background-color: #AB6B8E;border-radius: 3px;padding: .2em 0;'>空格</span> 开头的话将以口吃结巴的形式发出.\n结巴生效位置有两种方式: 如果键入两个<span ${stressStyle}>空格</span> 将会在空格位置概率产生结巴效果.\n如果键入一个<span ${stressStyle}>空格</span>将会使用分词系统进行结巴效果.\n该命令有一个可选参数:\n如果以<span ${stressStyle}>\`</span><span ${stressStyle}>[1-9]</span> 的形式作为开头，数字代表结巴程度，默认为3，越高将越口吃.\n不带结巴程度参数的例子:\n<span ${stressStyle}>\`</span> [要说 的 话]\n处理之后的效果就可能是:  「 要说...-的-的话... 」=>注意空格的位置.\n带参数的命令方法:\n<span ${stressStyle}>\`</span>3 [要说 的 话]\n此处的3就是结巴等级，代表着每处句子中的空格位置的词段都将有30%的概率发生结巴.上面的话就意味着发生了3等级的结巴效果.\n如果有两个空格: <span ${stressStyle}>\`</span>  [要说的话]`)}},edge:{Tag:"edge",Description:"显示 关于边缘机制的修改内容帮助.",Action:(args,msg,parsed)=>{ChatRoomSendLocal("模组修改了的边缘机制:\n每持续45秒钟边缘 ,将提高一层高潮抵抗难度，并且增加0.3~1.3秒的即将到来的高潮的持续时间-最多27秒持续时间.\n 如果失去边缘状态，将每45秒钟降低一层高潮抵抗难度，并且减少0.3~1.3秒的即将到来的高潮的持续时间-最少高潮持续时间范围4~7秒.\n\n")}}}}Load(){CommandCombine({Tag:"xsa",Description:"显示 [小酥的活动模组] 的相关命令.",Action:(args,msg,parsed)=>{parsed.length>0?this.CommandHandler(parsed):this.DisplayHelp()}}),this.Loaded=!0}init(){this.moduleName="CommandsModule",this.priority=20}getCommandParameters(parsed){const lastParam=parsed[parsed.length-1];return lastParam.startsWith("-")?lastParam.slice(1):""}DisplayHelp(msg=void 0){if(void 0===msg){let content="";for(const c in this.commandsDict)content+=`/xsa ${c} ${this.commandsDict[c].Description}\n`;content+=`小酥的活动模组 版本号: ${XSActivity_VERSION}\n`,ChatRoomSendLocal(content,1e4)}else ChatRoomSendLocal(msg,1e4)}CommandHandler(parsed){var _a,_b,_c,_d;const parsedCount=parsed.length;if(0==parsedCount&&this.DisplayHelp(),parsedCount>=1){const last=parsed[parsedCount-1];if(last.startsWith("-")){const cmd=parsed[parsedCount-2];cmd in this.commandsDict&&(null===(_b=null===(_a=this.commandsDict[cmd])||void 0===_a?void 0:_a.Action)||void 0===_b||_b.call(_a,"","",parsed))}else last in this.commandsDict&&(null===(_d=null===(_c=this.commandsDict[last])||void 0===_c?void 0:_c.Action)||void 0===_d||_d.call(_c,"","",parsed))}}}var _a$1,_a;class DataModule extends BaseModule{Load(){this.Loaded=!0}init(){this.moduleName="DataModule",this.priority=0,window.BROWSER_NAME=_a$1.browserName,window.BROWSER_VERSION=_a$1.browserVersion}}_a$1=DataModule,DataModule.userAgentString=navigator.userAgent,DataModule.browserVersionRegex=/(chrome|firefox|safari|opera|edge|msie|trident(?=\/))\/?\s*(\d+)/i,DataModule.match=_a$1.userAgentString.match(_a$1.browserVersionRegex),DataModule.browserName=_a$1.match?_a$1.match[1]:"unknown",DataModule.browserVersion=_a$1.match?parseInt(_a$1.match[2]):-1;class ArousalModule extends BaseModule{constructor(){super(...arguments),this.EdgeTimerLastCycleCall=0}init(){this.moduleName="ArousalModule",this.priority=60}Load(){window.EdgeCount=0,this.hookListHandler(),this.patchListHandler(),this.Loaded=!0}hookListHandler(){hookFunction("TimerProcess",this.priority,((args,next)=>{var _a;const currentTime=CommonTime();return 0==this.EdgeTimerLastCycleCall&&(this.EdgeTimerLastCycleCall=currentTime),void 0!==window.EdgeCount&&this.EdgeTimerLastCycleCall+45e3<=currentTime&&void 0!==(null===(_a=Player.ArousalSettings)||void 0===_a?void 0:_a.Progress)&&(Player.ArousalSettings.Progress>=93?(window.EdgeCount++,ActivityOrgasmGameResistCount++,this.EdgeTimerLastCycleCall=currentTime):(window.EdgeCount>=1&&window.EdgeCount--,ActivityOrgasmGameResistCount>=1&&ActivityOrgasmGameResistCount--,this.EdgeTimerLastCycleCall=0)),next(args)}))}patchListHandler(){var functionName,patches;functionName="ActivityOrgasmStart",patches={"C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;":"if (window.EdgeCount === undefined) {\n                C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;\n            } else {\n                const addedTime = (Math.random() + 0.3) * 1000 * window.EdgeCount;\n                C.ArousalSettings.OrgasmTimer = CurrentTime + (addedTime > 20000 ? 20000 : addedTime) + 4000 + (3000 * Math.random());\n            }"},bcModSDK.patchFunction(functionName,patches)}}class ModuleLoader{static LoadModules(){const moduleC=this.generateModule();return void 0!==this.mList&&this.mList.sort(((a,b)=>a.priority-b.priority)).forEach((m=>{m.Load(),conDebug(`模块 ${m.moduleName} 加载完成`)})),this.CheckModulesLoaded(moduleC)&&(this.CompleteLoadingSuccessful=!0,window.XSActivity_Loaded=!0),moduleC}static CheckModulesLoaded(moduleCount){if(5!=moduleCount)return!1;if(void 0===_a.mList)return!1;for(const m of _a.mList)if(!m.Loaded)return!1;return!0}static pushToModules(module){this.modules[module.moduleName]=module,void 0!==this.mList?this.mList.push(module):this.mList=[module],this.modulesCount++}static generateModule(){for(const mN in _a.ModuleMap)"Base"!==mN&&void 0===this.modules[mN]&&_a.ModuleMap[mN]();return this.modulesCount}}function init(){if(window.XSActivity_Loaded)return;const moduleCount=ModuleLoader.LoadModules();conDebug({type:MSGType.Workflow_Log,name:"XSActivity Loaded!",content:`Loaded ${moduleCount} modules    FullLoaded: ${ModuleLoader.CompleteLoadingSuccessful}`})}return _a=ModuleLoader,ModuleLoader.modules=modules,ModuleLoader.modulesCount=0,ModuleLoader.CompleteLoadingSuccessful=!1,ModuleLoader.ModuleMap={Base:()=>{throw new Error("Base为模块的抽象类，请勿加载")},ActivityModule:()=>{_a.pushToModules(new ActivityModule)},ChatroomModule:()=>{_a.pushToModules(new ChatroomModule)},CommandsModule:()=>{_a.pushToModules(new CommandsModule)},DataModule:()=>{_a.pushToModules(new DataModule)},ArousalModule:()=>{_a.pushToModules(new ArousalModule)}},conDebug({name:"Start Init",type:MSGType.Workflow_Log,content:"Init wait"}),null!=CurrentScreen&&"Login"!==CurrentScreen||hookFunction("LoginResponse",0,((args,next)=>{next(args),conDebug({name:"Init! Login Response caught",content:args,type:MSGType.Workflow_Log});const response=args[0];(response&&"string"==typeof response.Name&&"string"==typeof response.AccountName||!ModuleLoader.CompleteLoadingSuccessful)&&init()})),exports.init=init,exports}({});
//# sourceMappingURL=XSActivity_dev.js.map
