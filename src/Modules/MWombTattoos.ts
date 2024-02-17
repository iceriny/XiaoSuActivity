import { BaseModule } from "./BaseModule";
import { CharacterAppearanceIsLayerIsHave } from "utils";
// import { TimerProcessInjector } from "./MTimerProcessInjector";

export class WombTattoosModule extends BaseModule {
    public Init(): void {
        this.moduleName = "WombTattoosModule";
        this.priority = 100;

        // TimerProcessInjector.setProcessInjectionSequence = [
        //     {
        //         name: "EdgeTimerLastCycleCall",
        //         priority: 0,
        //         preconditions: () => window.EdgeCount !== undefined && Player.ArousalSettings?.Progress !== undefined,
        //         timeInterval: 45000,
        //         code: () => {
        //         }
        //     }
        // ];
    }

    public Load(): void {
        window.EdgeCount = 0;
        //
        this.getWombTattoosLayers()

        this.Loaded = true;
    }


    //  VVVV========淫纹大修=========VVVV  //
    /**
    function getWombTattoosLayers() {
        const a = AssetFemale3DCG.find(group => group.Group === 'BodyMarkings')?.Asset
        return a.find(item => item.Name === "WombTattoos")?.Layer;
    }
    const wombTattoosLayers = getWombTattoosLayers();
    console.log(wombTattoosLayers?.map(item => item.Name))
     */

    wombTattoosLayers: AssetLayerDefinition[] | undefined;
    static wombTattoosLayersName = [
        "Zoom",
        "Big",
        "Bloom",
        "BottomSpike",
        "Flash",
        "Fly",
        "Grass",
        "Grow",
        "GrowHollow",
        "HeartSmallOutline",
        "Heartline",
        "HeartSmall",
        "HeartSolid",
        "HeartWings",
        "In",
        "Leaves",
        "MidSpike",
        "Ribow",
        "Sense",
        "Shake",
        "SideHearts",
        "Swim",
        "Thorn",
        "ThornOut",
        "TopSpike",
        "Venom",
        "Viper",
        "Waves",
        "WingSmall"
    ]


    private getWombTattoosLayers() {
        const a = AssetFemale3DCG.find(group => group.Group === 'BodyMarkings')?.Asset as AssetDefinition.Item[]
        return a.find(item => item.Name === "WombTattoos")?.Layer;
    }


    /**
     * 判断目标角色是否有淫纹
     */
    public static haveWombTattoos(C: Character | PlayerCharacter): boolean {
        //查找WombTattoos
        for (const item of C.Appearance) {
            if (item.Asset.Name === "WombTattoos") return true;
        }
        return false;
    }

    /**
     * 返回目标角色应用的淫纹图层
     * @param C 要检测的角色
     * @returns 已经应用的图层
     */
    public static getAppliedLayerNames(C: Character | PlayerCharacter): string[] {
        const appliedLayersNames = [];
        const wombTattoos = C.DrawAppearance?.find(item => item.Asset.Name === "WombTattoos");
        if (wombTattoos) {
            const asset = wombTattoos.Asset;
            if (InventoryChatRoomAllow(asset.Category as readonly ServerChatRoomBlockCategory[])){
                const typeRecord = wombTattoos.Property && wombTattoos.Property.TypeRecord;
                const appliedLayers = asset.Layer.filter(layer => CharacterAppearanceIsLayerIsHave(C, layer, typeRecord)); // 这里有问题 如果当前姿势不可见的时候也会把那个图层过滤掉 // 尝试用新的函数
                const results =  appliedLayers.map(item => item.Name);
                for (const name of results) {
                    if (name !== null) appliedLayersNames.push(name);
                }
            }
        }
        return appliedLayersNames;
    }


    //  ^^^^========淫纹大修=========^^^^  //
}

