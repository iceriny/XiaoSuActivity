var XiaoSuActivity=function(exports){"use strict";function getDefaultExportFromCjs(x){return x&&x.__esModule&&Object.prototype.hasOwnProperty.call(x,"default")?x.default:x}var bcmodsdk={};!function(exports){!function(){const e="1.1.0";function o(e){alert("Mod ERROR:\n"+e);const o=new Error(e);throw console.error(o),o}const t=new TextEncoder;function n(e){return!!e&&"object"==typeof e&&!Array.isArray(e)}function r(e){const o=new Set;return e.filter((e=>!o.has(e)&&o.add(e)))}const i=new Map,a=new Set;function d(e){a.has(e)||(a.add(e),console.warn(e))}function s(e){const o=[],t=new Map,n=new Set;for(const r of p.values()){const i=r.patching.get(e.name);if(i){o.push(...i.hooks);for(const[o,a]of i.patches.entries())t.has(o)&&t.get(o)!==a&&d(`ModSDK: Mod '${r.name}' is patching function ${e.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${o}\nPatch1:\n${t.get(o)||""}\nPatch2:\n${a}`),t.set(o,a),n.add(r.name)}}o.sort(((e,o)=>o.priority-e.priority));const r=function(e,o){if(0===o.size)return e;let t=e.toString().replaceAll("\r\n","\n");for(const[n,r]of o.entries())t.includes(n)||d(`ModSDK: Patching ${e.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(e.original,t);let i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,e.name,n),d=r.apply(this,o);return null==a||a(),d};for(let t=o.length-1;t>=0;t--){const n=o[t],r=i;i=function(o){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,e.name,n.mod),d=n.hook.apply(this,[o,e=>{if(1!==arguments.length||!Array.isArray(o))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof e}`);return r.call(this,e)}]);return null==a||a(),d}}return{hooks:o,patches:t,patchesSources:n,enter:i,final:r}}function c(e,o=!1){let r=i.get(e);if(r)o&&(r.precomputed=s(r));else{let o=window;const a=e.split(".");for(let t=0;t<a.length-1;t++)if(o=o[a[t]],!n(o))throw new Error(`ModSDK: Function ${e} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const d=o[a[a.length-1]];if("function"!=typeof d)throw new Error(`ModSDK: Function ${e} to be patched not found`);const c=function(e){let o=-1;for(const n of t.encode(e)){let e=255&(o^n);for(let o=0;o<8;o++)e=1&e?-306674912^e>>>1:e>>>1;o=o>>>8^e}return((-1^o)>>>0).toString(16).padStart(8,"0").toUpperCase()}(d.toString().replaceAll("\r\n","\n")),l={name:e,original:d,originalHash:c};r=Object.assign(Object.assign({},l),{precomputed:s(l),router:()=>{},context:o,contextProperty:a[a.length-1]}),r.router=function(e){return function(...o){return e.precomputed.enter.apply(this,[o])}}(r),i.set(e,r),o[r.contextProperty]=r.router}return r}function l(){const e=new Set;for(const o of p.values())for(const t of o.patching.keys())e.add(t);for(const o of i.keys())e.add(o);for(const o of e)c(o,!0)}function f(){const e=new Map;for(const[o,t]of i)e.set(o,{name:o,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((e=>e.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return e}const p=new Map;function u(e){p.get(e.name)!==e&&o(`Failed to unload mod '${e.name}': Not registered`),p.delete(e.name),e.loaded=!1,l()}function g(e,t,r){"string"==typeof e&&"string"==typeof t&&(alert(`Mod SDK warning: Mod '${e}' is registering in a deprecated way.\nIt will work for now, but please inform author to update.`),e={name:e,fullName:e,version:t},t={allowReplace:!0===r}),e&&"object"==typeof e||o("Failed to register mod: Expected info object, got "+typeof e),"string"==typeof e.name&&e.name||o("Failed to register mod: Expected name to be non-empty string, got "+typeof e.name);let i=`'${e.name}'`;"string"==typeof e.fullName&&e.fullName||o(`Failed to register mod ${i}: Expected fullName to be non-empty string, got ${typeof e.fullName}`),i=`'${e.fullName} (${e.name})'`,"string"!=typeof e.version&&o(`Failed to register mod ${i}: Expected version to be string, got ${typeof e.version}`),e.repository||(e.repository=void 0),void 0!==e.repository&&"string"!=typeof e.repository&&o(`Failed to register mod ${i}: Expected repository to be undefined or string, got ${typeof e.version}`),null==t&&(t={}),t&&"object"==typeof t||o(`Failed to register mod ${i}: Expected options to be undefined or object, got ${typeof t}`);const a=!0===t.allowReplace,d=p.get(e.name);d&&(d.allowReplace&&a||o(`Refusing to load mod ${i}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(d));const s=e=>{"string"==typeof e&&e||o(`Mod ${i} failed to patch a function: Expected function name string, got ${typeof e}`);let t=g.patching.get(e);return t||(t={hooks:[],patches:new Map},g.patching.set(e,t)),t},f={unload:()=>u(g),hookFunction:(e,t,n)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);"number"!=typeof t&&o(`Mod ${i} failed to hook function '${e}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&o(`Mod ${i} failed to hook function '${e}': Expected hook function, got ${typeof n}`);const a={mod:g.name,priority:t,hook:n};return r.hooks.push(a),l(),()=>{const e=r.hooks.indexOf(a);e>=0&&(r.hooks.splice(e,1),l())}},patchFunction:(e,t)=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`);const r=s(e);n(t)||o(`Mod ${i} failed to patch function '${e}': Expected patches object, got ${typeof t}`);for(const[n,a]of Object.entries(t))"string"==typeof a?r.patches.set(n,a):null===a?r.patches.delete(n):o(`Mod ${i} failed to patch function '${e}': Invalid format of patch '${n}'`);l()},removePatches:e=>{g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),s(e).patches.clear(),l()},callOriginal:(e,t,n)=>(g.loaded||o(`Mod ${i} attempted to call SDK function after being unloaded`),"string"==typeof e&&e||o(`Mod ${i} failed to call a function: Expected function name string, got ${typeof e}`),Array.isArray(t)||o(`Mod ${i} failed to call a function: Expected args array, got ${typeof t}`),function(e,o,t=window){return c(e).original.apply(t,o)}(e,t,n)),getOriginalHash:e=>("string"==typeof e&&e||o(`Mod ${i} failed to get hash: Expected function name string, got ${typeof e}`),c(e).originalHash)},g={name:e.name,fullName:e.fullName,version:e.version,repository:e.repository,allowReplace:a,api:f,loaded:!0,patching:new Map};return p.set(e.name,g),Object.freeze(f)}function h(){const e=[];for(const o of p.values())e.push({name:o.name,fullName:o.fullName,version:o.version,repository:o.repository});return e}let m;const y=function(){if(void 0===window.bcModSdk)return window.bcModSdk=function(){const o={version:e,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:f,errorReporterHooks:Object.seal({hookEnter:null,hookChainExit:null})};return m=o,Object.freeze(o)}();if(n(window.bcModSdk)||o("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&o(`Failed to init Mod SDK: Different version already loaded ('1.1.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==e&&(alert(`Mod SDK warning: Loading different but compatible versions ('1.1.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk.version.startsWith("1.0.")&&void 0===window.bcModSdk._shim10register)){const e=window.bcModSdk,o=Object.freeze(Object.assign(Object.assign({},e),{registerMod:(o,t,n)=>o&&"object"==typeof o&&"string"==typeof o.name&&"string"==typeof o.version?e.registerMod(o.name,o.version,"object"==typeof t&&!!t&&!0===t.allowReplace):e.registerMod(o,t,n),_shim10register:!0}));window.bcModSdk=o}return window.bcModSdk}();Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y}()}(bcmodsdk);const ModVersion="0.0.1",modules={},bcModSDK=getDefaultExportFromCjs(bcmodsdk).registerMod({name:"XiaoSuActivity",fullName:"XiaoSu's Activity Expand",version:"v0.0.1".startsWith("v")?"v0.0.1".slice(1):"v0.0.1",repository:"https://github.com/iceriny/XiaoSuActivity"});var ModuleCategory,MSGType;function hookFunction(target,priority,hook){return bcModSDK.hookFunction(target,priority,hook)}function conDebug(msg){let result;result="string"==typeof msg?{name:"XiaoSuActivity_Debug",type:MSGType.DebugLog,content:msg,time:(new Date).toLocaleString(),ModVersion:ModVersion}:{name:msg.name,type:msg.type,content:msg.content,time:(new Date).toLocaleString(),ModVersion:ModVersion},console.debug(result)}function GetModule(moduleName){return modules[moduleName]}function copyAndDownloadHtmlElement(element,fileName,time_limit=null){const newDoc=document.implementation.createHTMLDocument();if(null===element)return void conDebug("element is null");const copiedElement=element.cloneNode(!0);null!==time_limit&&function(element,time_limit){element.querySelectorAll("[data-time]").forEach((element=>{const dataTimeValue=element.getAttribute("data-time");if(dataTimeValue){const currentTime=new Date(`2000-01-01 ${dataTimeValue}`),minTimeDate=new Date(`2000-01-01 ${time_limit.minTime}`),maxTimeDate=new Date(`2000-01-01 ${time_limit.maxTime}`);(currentTime<minTimeDate||currentTime>maxTimeDate)&&element.remove()}}))}(copiedElement,time_limit),function(element){const style=element.style;for(;style.length>0;)style.removeProperty(style[0])}(copiedElement),copiedElement.style.fontSize="14.784px",copiedElement.style.fontFamily="Arial, sans-serif",copiedElement.style.display="flex",copiedElement.style.flexDirection="column",copiedElement.style.width="70vw",newDoc.body.style.display="flex",newDoc.body.style.alignItems="center",newDoc.body.style.justifyContent="center",newDoc.body.style.backgroundColor="#f2f2f2",newDoc.body.appendChild(copiedElement);const htmlString=newDoc.documentElement.outerHTML,blob=new Blob([htmlString],{type:"text/html"}),link=document.createElement("a");link.href=URL.createObjectURL(blob),link.download=fileName,link.click()}!function(ModuleCategory){ModuleCategory[ModuleCategory.Core=-1]="Core",ModuleCategory[ModuleCategory.Global=0]="Global",ModuleCategory[ModuleCategory.Test=1]="Test"}(ModuleCategory||(ModuleCategory={})),function(MSGType){MSGType[MSGType.DebugLog=0]="DebugLog",MSGType[MSGType.Workflow_Log=1]="Workflow_Log"}(MSGType||(MSGType={}));class BaseModule{constructor(){this.moduleName="",this.priority=0,this.init()}init(){}Load(){}}class ChatroomModule extends BaseModule{constructor(){super(...arguments),this.moduleName="Chatroom",this.priority=30}Load(){hookFunction("ChatRoomLoad",30,((args,next)=>{const result=next(args);return conDebug({name:"ChatRoomLoadTest",type:MSGType.DebugLog,content:args}),result}))}ExportChat(time_limit=null){const exportName=`${null===ChatRoomData||void 0===ChatRoomData?void 0:ChatRoomData.Name}_${(new Date).toLocaleString()}`;copyAndDownloadHtmlElement(document.getElementById("TextAreaChatLog"),exportName,time_limit)}}const timeRangeRegex=/^(((0|1)\d|2[0-3]):[0-5]\d)-(((0|1)\d|2[0-3]):[0-5]\d)$/;class CommandsModule extends BaseModule{constructor(){super(...arguments),this.moduleName="Commands",this.priority=20,this.commandsDict={help:{Tag:"help",Description:"显示 [小酥的活动模组] 的相关命令.",Action:(args,msg,parsed)=>{this.DisplayHelp()}},export:{Tag:"export",Description:"导出当前聊天室的聊天记录. 输入: ‘/xsa export -h’ 显示导出命令的使用方法.",Action:(args,msg,parsed)=>{const params=this.getCommandParameters(parsed);if("h"==params)ChatRoomSendLocal("输入: ‘/xsa export -[时间]’导出指定时间范围内的聊天记录.\n例如: ‘/xsa export -05:34-20:40’\n默认导出当前聊天室的全部聊天记录.\n注意! \n如果时间段过长例如第一天的05:34到第二天的06:00则可能出现导出错误.");else if(""===params)conDebug("导出当前聊天室的全部聊天记录"),GetModule("Chatroom").ExportChat();else if(timeRangeRegex.test(params)){conDebug(`导出指定的 ${params} 时间段的聊天记录`);const separatorIndex=params.indexOf("-");-1!==separatorIndex&&(params.slice(0,separatorIndex).trim(),params.slice(separatorIndex+1).trim(),GetModule("Chatroom").ExportChat())}}}}}getCommandParameters(parsed){const lastParam=parsed[parsed.length-1];return lastParam.startsWith("-")?lastParam.slice(1):""}Load(){CommandCombine({Tag:"xsa",Description:"显示 [小酥的活动模组] 的相关命令.",Action:(args,msg,parsed)=>{parsed.length>0?this.CommandHandler(parsed):this.DisplayHelp()}})}DisplayHelp(msg=void 0){if(void 0===msg){let content="";for(const c in this.commandsDict)content+=`/xsa ${c} ${this.commandsDict[c].Description}\n`;ChatRoomSendLocal(content,5e3)}else ChatRoomSendLocal(msg,5e3)}CommandHandler(parsed){var _a,_b,_c,_d;const parsedCount=parsed.length;if(0==parsedCount&&this.DisplayHelp(),parsedCount>=1){const last=parsed[parsedCount-1];if(last.startsWith("-")){const cmd=parsed[parsedCount-2];cmd in this.commandsDict&&(null===(_b=null===(_a=this.commandsDict[cmd])||void 0===_a?void 0:_a.Action)||void 0===_b||_b.call(_a,"","",parsed))}else last in this.commandsDict&&(null===(_d=null===(_c=this.commandsDict[last])||void 0===_c?void 0:_c.Action)||void 0===_d||_d.call(_c,"","",parsed))}}}class ActivityModule extends BaseModule{constructor(){super(...arguments),this.moduleName="Activity",this.priority=50,this.activityToAddDict={squint:{Name:"眯眼",Target:[""],TargetSelf:["ItemHead"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[],ActivityExpression:[]},eyeFlutter:{Name:"眼神飘忽",Target:[""],TargetSelf:["ItemHead"],MaxProgress:20,MaxProgressSelf:20,Prerequisite:[]}}}init(){}Load(){this.LoadActivity()}LoadActivity(){for(const a in this.activityToAddDict)this.pushToActivity(this.activityToAddDict[a])}createActivity(name,maxProgress,maxProgressSelf,prerequisite,target,targetSelf,reverse,makeSound,stimulationAction,activityExpression){return{Name:name,Target:[target],TargetSelf:[targetSelf],MaxProgress:maxProgress,MaxProgressSelf:maxProgressSelf,Prerequisite:prerequisite,ActivityExpression:activityExpression}}pushToActivity(activity){ActivityFemale3DCG.push(activity),ActivityFemale3DCGOrdering.push(activity.Name)}}class ModuleLoader{static LoadModules(){this.generateModule(),void 0!==this.mList&&this.mList.sort(((a,b)=>a.priority-b.priority)).forEach((m=>{m.Load()}))}static pushToModules(module){this.modules[module.moduleName]=module,void 0!==this.mList?this.mList.push(module):this.mList=[module]}static generateModule(){this.pushToModules(new ChatroomModule),this.pushToModules(new CommandsModule),this.pushToModules(new ActivityModule)}}function init(){ModuleLoader.LoadModules(),conDebug("XSActivity Loaded!")}return ModuleLoader.modules=modules,conDebug({name:"Start Init",type:MSGType.Workflow_Log,content:"Init wait"}),null==CurrentScreen||"Login"===CurrentScreen?hookFunction("LoginResponse",0,((args,next)=>{conDebug({name:"Init! LoginResponse caught",content:args,type:MSGType.Workflow_Log}),next(args);const response=args[0];response&&"string"==typeof response.Name&&"string"==typeof response.AccountName&&init()})):(conDebug({name:"logged",type:MSGType.Workflow_Log,content:"Already logged in, init"}),init()),exports.init=init,exports}({});
//# sourceMappingURL=XSActivity_dev.js.map
