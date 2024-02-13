// import { BaseModule } from "./BaseModule";
// import { conDebug, hookFunction } from "utils";

// interface IProcessInjectionSequence {
//     [key: string]: IInjectionCode
// }
// interface IInjectionCode {
//     name: string,
//     priority: number,
//     code: () => void
// }

// export class TimerProcessInjector extends BaseModule {
//     public Load(): void {
//         this.ProcessInjection();
//         this.Loaded = true;
//     }
//     public init(): void {
//         this.moduleName = "TimerProcessInjector"
//         this.priority = 100;
//     }


//     private ProcessInjection(): void {  
//         const processInjectionList = Object.values(this.processInjectionSequence)
//         .sort((a, b) => a.priority - b.priority);
//         for (const c of processInjectionList) {
//             conDebug(`[TimerProcessInjector] ${c.name} is injected`);
//             hookFunction("TimerProcess", c.priority, (args, next) => {
//                 c.code();
//                 return next(args);
//             });
//         }
//     }

//     private processInjectionSequence: IProcessInjectionSequence = {}

//     set setProcessInjectionSequence(sequence: IInjectionCode[]) {
//         for (const c of sequence) {
//             this.processInjectionSequence[c.name] = c;
//         }
//     }
// }