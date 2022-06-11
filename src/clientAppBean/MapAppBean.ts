namespace clientAppBean {
    export class MapAppBean implements core.IAppBean {
        async start(data: any) {
            util.SystemTimerUtil.setUp();
            await Promise.all([
                xls.load(xls.manageBuildingId),
                xls.load(xls.manageBuildingUpdate),
                xls.load(xls.manageBuildingFormula),
                xls.load(xls.flowerPlant),
                xls.load(xls.flowerGrow),
                //地图扩展相关表,素材
                xls.load(xls.map),
                xls.load(xls.extensionBase),
                xls.load(xls.extensionConsume),
                xls.load(xls.mapObject),
                res.load(`atlas/expandUI.atlas`),
                //加载地图编辑素材
                res.load("atlas/mapEditor.atlas"),
                res.load(clientCore.UnpackJsonManager.getUnpackUrls("mapEditor")),
                res.load(pathConfig.getJsonPath("mapGrid")),
                res.load(pathConfig.getJsonPath("rule")).catch(()=>{
                    alert.showFWords("帮助说明配置出错");
                })
            ]);
            //-----------------这些都不依赖后台数据,----------------------------
            await clientCore.JumpManager.setUp();
            clientCore.MapInfo.setUp();
            clientCore.BuildingUpgradeConf.initBuildUpgradeInfo();
            clientCore.SeedFlowerRelateConf.setUp();
            clientCore.FlowerGrowConf.setUp();
            clientCore.MapEditorManager.getInstance().setUp();//地图编辑初始化
            clientCore.MapManager.setUp();
            clientCore.MapTouchManager.getInstance().setUp();//地图点击管理初始化
        }
    }
}