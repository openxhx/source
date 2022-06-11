namespace clientCore {
    export class KeyboardManager {
        public static setUp() {
            if (!GlobalConfig.isInnerNet && !GlobalConfig.isH5)
                return;
            Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyPressDown);
        }
        private static onKeyPressDown(e: Laya.Event) {
            if (e.shiftKey) {
                switch (e.keyCode) {
                    case Laya.Keyboard.NUMBER_1:
                        Laya.Stat.show();
                        break;
                    case Laya.Keyboard.NUMBER_2:
                        ServerManager.showTxt();
                        break;
                    case Laya.Keyboard.Q:
                        clientCore.ToolTip.gotoMod(110)
                        // clientCore.MapManager.enterParty(LocalInfo.uid);
                        // clientCore.MapManager.enterFamily(clientCore.FamilyMgr.ins.familyId, 20);
                        break;
                    case Laya.Keyboard.A:
                        EventManager.event("force_close_animate_movie");
                        EventManager.event("force_end_fight_movie");
                        break;
                    case Laya.Keyboard.S:
                        ModuleManager.open('mapDrawLine.MapDrawLineModule');
                        break;
                    case Laya.Keyboard.D:
                        ModuleManager.open('mapItemsEdit.MapItemsEditModule');
                        break;
                    case Laya.Keyboard.P:
                        clientCore.GuideMainManager.instance.isGuideAction = false;
                        clientCore.GuideMainManager.instance.setPartGuideCompleteState();
                        break;
                    case Laya.Keyboard.W:
                        // ModuleManager.open("familyQA.FamilyQAModule");
                        clientCore.RestaurantManager.openFlag = true;
                        clientCore.RestaurantManager.openGuideFlag = true;
                        clientCore.GuideMainManager.instance.checkGuideByStageComplete(99997); 
                        break;
                    case Laya.Keyboard.Z:
                        console.log("show friend module!!1");
                        ModuleManager.open("friend.FriendModule");
                        break;
                    case Laya.Keyboard.X:
                        ModuleManager.open("commonShop.CommonShopModule", 5);
                        break;
                    case Laya.Keyboard.C:
                        ModuleManager.open("beachSecret.BeachSecretModule");
                        break;
                    case Laya.Keyboard.E:
                        console.log("key e pressed!!!");
                        AnimateMovieManager.showAnimateMovie("1000001", this, function () { });
                        break;
                    case Laya.Keyboard.BACKSPACE:
                        ModuleManager.open('test.TestModule');
                        break;
                    case Laya.Keyboard.V:
                        UIManager.showUIFlag = !UIManager.showUIFlag;
                        break;
                    case Laya.Keyboard.F:
                        let curLv = LocalInfo.userLv;
                        net.send(new pb.cs_adjust_user_level({ level: curLv + 1 }));
                        break;
                    case Laya.Keyboard.G:
                        net.send(new pb.cs_adjust_user_level({ level: LocalInfo.userLv - 1 }));
                        break;
                    case Laya.Keyboard.M:
                        ModuleManager.open('hitStar.HitStarGameModule');
                        // AnswerMgr.debug = true;
                        // MapManager.enterActivityMap(23);
                        // ModuleManager.open('mouseGame.MouseGameModule', 3799999);
                        // ModuleManager.open("moneyShop.MoneyShopModule");
                        // let _idResourcesMap: any = Laya.Resource["_idResourcesMap"];
                        // for (let key in _idResourcesMap) { console.log(_idResourcesMap[key]); };
                        // console.log("cpumemery: " + Math.round(Laya.Resource.cpuMemory / 1024 / 1024) + "m");
                        // console.log("gpumemory: " + Math.round(Laya.Resource.gpuMemory / 1024 / 1024) + "m");
                        // ModuleManager.open('market.MarketModule');
                        // ModuleManager.open('secretTrainingGame.SecretTrainingGameModule', { stageId: 60113, type: 0, version: 2 });
                        break;
                    case Laya.Keyboard.L:
                        GlobalConfig.guideAutoPlay = !GlobalConfig.guideAutoPlay;
                        break;
                    case Laya.Keyboard.B:
                        GM.show();
                        break;
                    case Laya.Keyboard.I:
                        break;
                    case Laya.Keyboard.T:

                        let msg: pb.sc_notify_map_game_finished = new pb.sc_notify_map_game_finished();
                        msg.players = [];
                        msg.items = [];
                        msg.score = 0;
                        ModuleManager.open("answer.AnswerResultModule", msg);
                        break;
                    case Laya.Keyboard.R:
                        // MapManager.enterBossMap(19);
                        MapManager.enterActivityMap(25);
                        break;
                }
            }
        }

        private static async goActivityBoss(): Promise<void> {
            await SceneManager.ins.register();
            SceneManager.ins.battleLayout(6, 60101);
        }
    }
}