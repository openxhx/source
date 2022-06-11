namespace clientAppBean {
    export class PersonAppBean implements core.IAppBean {
        public async start(data: any) {
            await res.load(pathConfig.getJsonPath('clothItemInfo'));
            await res.load(pathConfig.getJsonPath('newClothItemInfo'));
            await res.load('res/dragonBone/man.sk');
            await res.load('res/dragonBone/man.png');
            await res.load('res/dragonBone/woman.sk');
            await res.load('res/dragonBone/woman.png');

            let loadArr = [
                xls.load(xls.suits),
                xls.load(xls.itemCloth),
                xls.load(xls.userLevel),
                xls.load(xls.bgshow)
            ];
            await Promise.all(loadArr).then(() => {
                clientCore.SuitsInfo.setup();
            });

            clientCore.ClothData.initData(res.get(pathConfig.getJsonPath("clothItemInfo")));
            clientCore.ClothData.initDataNew(res.get(pathConfig.getJsonPath("newClothItemInfo")));
            clientCore.PeopleManager.getInstance().createPlayer();
            clientCore.KeyboardManager.setUp();
        }
    }
}