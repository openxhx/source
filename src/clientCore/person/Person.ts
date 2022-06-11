namespace clientCore {
    export const SPEED_UP_FRAME_TIME = 1250;//加速结束的时间点
    export const SLOW_DOWN_FRAME_TIME = 2500;//减速开始的时间点
    export const TOTAL_FRAME_TIME = 3040; //飞行动画总时间
    export const BONE_NAME_ARR = ['belly', 'leftarm', 'leftfoot', 'lefthand', 'leftleg', 'rightarm', 'rightfoot', 'righthand', 'rightleg', 'body', 'head'];

    export class Person extends Laya.Sprite {
        private factory: Laya.Templet;
        private _bone: Laya.Skeleton;
        private _wear: util.HashMap<number>;//type-id的键值对
        private _defaultMap: util.HashMap<number>;//type-id的键值对
        private _alphaTex: Laya.Texture;
        private _sex: number;
        private readonly boneOffsetMap: util.HashMap<{ x: number, y: number }>;

        /**1女 2男 */
        constructor(sex: number, defaultCloth?: number[]) {
            super();
            this._wear = new util.HashMap();
            this._sex = sex;
            this.factory = new Laya.Templet();
            if (this._sex == 1)
                this.factory.parseData(res.get('res/dragonBone/woman.png'), res.get('res/dragonBone/woman.sk'));
            else
                this.factory.parseData(res.get('res/dragonBone/man.png'), res.get('res/dragonBone/man.sk'));
            this._bone = this.factory.buildArmature(1);
            this._defaultMap = new util.HashMap();
            this.addChild(this._bone);
            this.stopAnimate();
            //透明占位图片
            this._alphaTex = new Laya.Texture();
            this._alphaTex.load('res/dragonBone/src/library/1.png');
            //皮肤偏移
            this.boneOffsetMap = new util.HashMap();
            for (const slotName of BONE_NAME_ARR) {
                let slot: Laya.BoneSlot = this._bone.getSlotByName(slotName);
                if (slot?.currTexture) {
                    let tex = slot.currTexture;
                    this.boneOffsetMap.add(slotName, { x: slot.currTexture.offsetX - tex.sourceWidth / 2, y: slot.currTexture.offsetY - tex.sourceHeight / 2 });
                }
                else {
                    console.warn('bone error');
                    this.boneOffsetMap.add(slotName, { x: 0, y: 0 });
                }
            }
            if (defaultCloth) {
                this.resetDefaultCloth(defaultCloth);
                this.upByIdArr(defaultCloth);
            };
        }

        public resetDefaultCloth(defaultCloth: number[]) {
            defaultCloth = _.uniq(defaultCloth);
            for (let id of defaultCloth) {
                let info = ClothData.getCloth(id);
                if (info)
                    this._defaultMap.add(info.clothType, info.id);
            }
        }

        public resetDefaultCloth2(cloths: number[]): void {
            if (cloths && cloths.length > 0) {
                _.forEach(cloths, (element: number) => {
                    let info = ClothData.getCloth(element);
                    info && this._defaultMap.get(info.clothType) && this._defaultMap.add(info.clothType, info.id);
                })
            }
        }

        public getWearginIds(): number[] {
            return this._wear.getValues();
        }

        public playAnimate(ani: string, loop: boolean = true) {
            this._bone.once(Laya.Event.STOPPED, this, () => {
                this.stopAnimate();
            })
            this._bone.play(ani, loop, true, 0, 0, false);
        }

        public flyAcceleration() {
            this._bone.offAll();
            this._bone.play('fly', false, true, 0, SPEED_UP_FRAME_TIME, false);
            this._bone.once(Laya.Event.LABEL, this, (e) => {
                if (e.name == 'ev1')
                    this._bone.paused();
                this._bone.play('fly', true, true, SPEED_UP_FRAME_TIME, SLOW_DOWN_FRAME_TIME, false);
            })
        }

        public flySlowDown() {
            this._bone.offAll();
            let currFrameTime = this._bone.player['_currentFrameTime'];
            if (currFrameTime < 0) {
                currFrameTime = 0;
            }
            // console.log(`currFrameTime: ${currFrameTime}`);
            if (currFrameTime < SPEED_UP_FRAME_TIME) {
                //如果加速到一半就开始减速，需要根据人物已经倾斜比例 播放减速动画
                let per = (SPEED_UP_FRAME_TIME - currFrameTime) / SPEED_UP_FRAME_TIME;
                currFrameTime = SLOW_DOWN_FRAME_TIME + (TOTAL_FRAME_TIME - SLOW_DOWN_FRAME_TIME) * per;
            }
            else {
                currFrameTime = SLOW_DOWN_FRAME_TIME;
            }
            // console.log(`currFrameTime: ${currFrameTime}  TOTAL_FRAME_TIME: ${TOTAL_FRAME_TIME}  SLOW_DOWN_FRAME_TIME:${SLOW_DOWN_FRAME_TIME}`);
            if (currFrameTime == TOTAL_FRAME_TIME) {
                this.playAnimate('huxi', true);
            }
            else {
                this._bone.play('fly', false, true, Math.min(currFrameTime, TOTAL_FRAME_TIME), TOTAL_FRAME_TIME, false);
                this._bone.once(Laya.Event.STOPPED, this, (e) => {
                    this.playAnimate('huxi', true);
                })
            }
        }

        public stopAnimate() {
            this.playAnimate('static');
        }

        public downAllCloth() {
            let arr = this.getWearginIds();
            for (const id of arr) {
                this.downById(id);
            }
        }

        /**穿上一批衣服 */
        public upByIdArr(ids: number[]) {
            for (const id of ids) {
                this.upById(id);
            }
        }

        public upById(id: number): void {
            if (ClothData.checkIsSkin(id)) {
                this.replaceSkin(id);
            }
            else {
                if (this.isIdWearing(id)) {
                    console.log(id + "已经穿在身上了");
                }
                else {
                    let info: ClothInfo = ClothData.getCloth(id);
                    if (info) {
                        let downInfo: ClothInfo = ClothData.getCloth(this.wearingId(info.clothType));
                        //先卸下需要卸下的部件
                        if (downInfo) {
                            //如果这个部件要换上新的,那就先不脱
                            let downPart = _.filter(downInfo.partArr, (part) => {
                                let needRemove = true;
                                for (const o of info.partArr) {
                                    if (part.slotName == o.slotName)
                                        needRemove = false;
                                }
                                return needRemove;
                            });
                            for (let down of downPart) {
                                this.downBySlotName(down.slotName);
                            }
                        }
                        this._wear.add(info.clothType, info.id);
                        for (let up of info.partArr) {
                            this.upBySlotInfo(up);
                        }
                    }
                }
            }
        }

        private replaceSkin(id: number) {
            this._wear.add(CLOTH_TYPE.Skin, id);
            for (const slotName of BONE_NAME_ARR) {
                // this.downBySlotName(slotName);
                let offset = this.boneOffsetMap.get(slotName);
                let sex = clientCore.LocalInfo.sex;
                let offsetX = offset.x;
                let offsetY = offset.y;
                if (id == 4300011 || id == 4300012 || id == 4300013 || id == 4300014) {
                    if (slotName == "head") {
                        offsetX -= sex == 1 ? 12 : 20;
                        offsetY += sex == 1 ? 4 : 0;
                    } else if (slotName == "belly") {
                        offsetX -= 125;
                    }
                }
                let partInfo = new ClothPartInfo(slotName, `bone/${id}/${slotName}.png`, offsetX, offsetY);
                this.upBySlotInfo(partInfo);
            }
        }

        public downById(id: number): void {
            let info: ClothInfo = ClothData.getCloth(id);
            if (info) {
                //如果要脱的部位有默认服装 换成默认服装
                if (this._defaultMap.has(info.clothType)) {
                    let defaultId: number = this._defaultMap.get(info.clothType);
                    if (!this.isIdWearing(defaultId)) {
                        this.upById(defaultId);
                    }
                    return;
                }
                //正常脱下
                if (this.isIdWearing(id)) {
                    this._wear.remove(info.clothType);
                    for (let down of info.partArr) {
                        this.downBySlotName(down.slotName);
                    }
                }
                else {
                    console.log("没穿着这件衣服！ 欲 脱下ID:" + info.id + "-部位:" + CLOTH_TYPE[info.clothType] + "-该部位当前穿着ID:" + this.wearingId(info.clothType));
                }
            }
        }
        /**判断是否穿着ID */
        public isIdWearing(id: number): boolean {
            let info: ClothInfo = ClothData.getCloth(id);
            if (info && this._wear.has(info.clothType)) {
                return this._wear.get(info.clothType) == id;
            }
            else {
                return false;
            }
        }
        /**查询这个部位穿着的ID */
        public wearingId(type: CLOTH_TYPE): number {
            if (this._wear.has(type)) {
                return this._wear.get(type);
            }
            else {
                return -1;
            }
        }

        private upBySlotInfo(info: ClothPartInfo): void {
            let slot: Laya.BoneSlot = this._bone.getSlotByName(info.slotName);
            slot['allowLoad'] = true;
            slot['targetId'] = info.path
            if (slot.currTexture)
                slot.currTexture.offAll();
            let tex = new Laya.Texture();
            let path: string = 'res/cloth/' + info.path;
            tex.offsetX = info.px;
            tex.offsetY = info.py;
            tex.on(Laya.Event.READY, this, this.onLoaded, [tex, slot]);
            tex.load(path);
        }

        private onLoaded(tex: Laya.Texture, slot: Laya.BoneSlot) {
            if (tex.bitmap && slot['allowLoad'] && tex.bitmap.url.indexOf(slot['targetId']) > -1) {
                slot.currTexture = tex;
                slot.currTexture.offsetX += tex.width / 2;
                slot.currTexture.offsetY += tex.height / 2;
                slot.currDisplayData.width = tex.width;
                slot.currDisplayData.height = tex.height;
                this._bone && this._bone['_clearCache']();
                slot.currTexture.offAll();
            }
        }

        private downBySlotName(slotName: string): void {
            let slot: Laya.BoneSlot = this._bone.getSlotByName(slotName);
            slot['allowLoad'] = false;
            let tex: Laya.Texture = slot.currTexture;
            tex && tex != this._alphaTex && tex.destroy(true);
            slot.currTexture = this._alphaTex;
            this._bone['_clearCache']();
        }

        /**替换成新的一套衣服，会根据当前所穿识别哪些该穿 哪些该脱 */
        public replaceByIdArr(ids: number[]) {
            let before = this.getWearginIds();
            let now = ids;
            let same = _.intersection(before, now);
            let needDown = _.difference(before, same); //需要换下的
            let needUp = _.difference(now, same); //需要新增的
            needDown = _.filter(needDown, (id) => { return ClothData.getCloth(id) != null })
            needUp = _.filter(needUp, (id) => { return ClothData.getCloth(id) != null })
            //先穿
            for (const id of needUp) {
                this.upById(id);
            }
            let downTypeArr = needDown.map((id) => { return ClothData.getCloth(id).clothType });
            let upTypeArr = needUp.map((id) => { return ClothData.getCloth(id).clothType });
            for (let i = 0; i < downTypeArr.length; i++) {
                //同类型没有的 才需要脱
                if (upTypeArr.indexOf(downTypeArr[i]) == -1) {
                    this.downById(needDown[i]);
                }
            }
        }

        public destroy() {
            this._bone?.destroy();
            this._wear?.clear();
            this._bone = null;
            this._wear = null;
            super.destroy();
        }

        public get sex(): number {
            return this._sex;
        }
    }
}