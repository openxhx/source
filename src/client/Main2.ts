class Main2 {
    constructor() {
        this.init();
    }
    private _people: clientCore.Person;

    async init() {
        Laya.init(1334, 750, laya.webgl.WebGL);
        Laya.stage.bgColor = '#323232'
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        Laya.stage.alignH = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.alignV = Laya.Stage.ALIGN_CENTER;
        Laya.stage.frameRate = "fast";
        Laya.Stat.show();
        // Laya['DebugPanel'].enable();
        clientCore.LocalInfo.sex = 1;
        let bean = new clientAppBean.PersonAppBean();
        await bean.start(0);

        this.setUI();
        this._people = new clientCore.Person(1);
        this._people.scale(0.7, 0.7);
        this._people.x = 660;
        this._people.y = 400;
        Laya.stage.addChild(this._people);
    }

    private setUI() {
        let UI = new ui.test.ClothTestUI();
        Laya.stage.addChild(UI);
        UI.list.dataSource = [];
        UI.list.vScrollBarSkin = null;
        Laya.stage.on(Laya.Event.KEY_DOWN, this, (e: Laya.Event) => {
            if (e.keyCode == Laya.Keyboard.SPACE) {
                this._people.downAllCloth();
                this._people.upByIdArr([126065, 126066, 126067, 126068, 126069, 126070, 126071, 126073, 126074, 126075, 126076, 126077, 126079, 601736, 601737, 601738])
            }
        })
        UI.btnDown.on(Laya.Event.CLICK, this, () => {
            this._people.downAllCloth();
            UI.list.dataSource = this.getNowClothList();
        });

        UI.btnCloth.on(Laya.Event.CLICK, this, () => {
            let clothId = parseInt(UI.txtCloth.text);
            if (clientCore.ClothData.getCloth(clothId)) {
                this._people.upById(clothId);
                UI.list.dataSource = this.getNowClothList();
                console.log(clientCore.ClothData.getCloth(clothId).partArr);
            }
            else {
                window.alert(clothId + '没有!');
            }
        });

        UI.btnSuit.on(Laya.Event.CLICK, this, () => {
            let suitId = parseInt(UI.txtSuit.text);
            if (clientCore.SuitsInfo.getSuitInfo(suitId).clothes) {
                this._people.downAllCloth();
                this._people.upByIdArr(clientCore.SuitsInfo.getSuitInfo(suitId).clothes);
                UI.list.dataSource = this.getNowClothList();
            }
            else {
                window.alert(suitId + '没有!');
            }
        })
    }

    private getNowClothList() {
        return _.map(this._people.getWearginIds(), (id) => {
            let str: string;
            let obj = clientCore.ClothData.getCloth(id);
            if (obj) {
                str = id + '  ' + obj.name;
            }
            else {
                str = id + '信息丢失了';
            }
            return { text: str };
        })
    }
}


class Main3 {
    constructor() {
        Laya.init(1334, 750, Laya.WebGL);
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        Laya.stage.alignH = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.alignV = Laya.Stage.ALIGN_CENTER;
        Laya.stage.frameRate = "fast";
        Laya.Stat.show();
        this.init();
    }

    async init() {
        await res.load('res/animate/linkGame/flowerBreak.png');
        await res.load('res/animate/linkGame/flowerBreak.sk');
        let tmp = new Laya.Templet();
        tmp.parseData(res.get('res/animate/linkGame/flowerBreak.png'), res.get('res/animate/linkGame/flowerBreak.sk'));
        let bone = new Laya.Skeleton();
        bone = tmp.buildArmature(1);
        bone.play(0, true)
        bone.showSkinByIndex(1);
        window['bone'] = bone;
        Laya.stage.addChild(bone);

        bone.x = Laya.stage.width / 2;
        bone.y = Laya.stage.height / 2;
    }
}


class Main4 {
    private _uid: number = 0;
    constructor() {
        Laya.init(1334, 750, Laya.WebGL);
        net.init();
        Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
        Laya.stage.screenMode = Laya.Stage.SCREEN_NONE;
        Laya.stage.alignH = Laya.Stage.ALIGN_MIDDLE;
        Laya.stage.alignV = Laya.Stage.ALIGN_CENTER;
        let bean = new clientAppBean.PersonAppBean();
        bean.start(0);
        window['cc'] = this.create.bind(this);
        window['change'] = this.change.bind(this);
        Laya.Stat.show(0, 300);
    }

    create() {
        for (let i = 2; i <= 2; i++) {
            let d = new pb.UserBase();
            d.sex = i;
            d.curClothes = clientCore.SuitsInfo.getSuitInfo(this._uid, d.sex).clothes;
            let people = new clientCore.Person2(d);
            people.scale(0.4, 0.4);
            Laya.stage.addChild(people);
            people.x = d.sex == 1 ? 300 : 900;
            people.y = 200;

            // let people1 = new clientCore.Person(d.sex, d.curClothes);
            // people1.scale(0.4, 0.4);
            // Laya.stage.addChild(people1);
            // people1.pos(people.x, people.y + 300);
            window[d.sex == 1 ? 'woman' : 'man'] = people;
            // window[d.sex == 1 ? 'woman1' : 'man1'] = people1;
        }
    }

    change(id: number) {
        this._uid += 1;
        if (window['woman'])
            window['woman'].replaceClothArr(clientCore.SuitsInfo.getSuitInfo(id, 1).clothes);
        if (window['man'])
            window['man'].replaceClothArr(clientCore.SuitsInfo.getSuitInfo(id, 2).clothes);
    }
}
// new Main3();