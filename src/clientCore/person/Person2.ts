namespace clientCore {
    const SIZE = 8;
    const ATLAS_NUM = 1;
    /**
     *  目前很多资源Laya会自己管理
     *  可以用下面这个释放内存
     *  Laya.ResourceManager.currentResourceManager.garbageCollection() 
     */
    export class Person2 extends Laya.Sprite {
        /**占用图集数 */
        private _bone: Laya.Skeleton;
        private _wear: util.HashMap<number>;//type-id的键值对
        private _alphaTex: Laya.Texture;
        private _atlas: atlas.AtlasTexture;
        private _clothArr: number[];
        private _boneCount: number;
        private _clothCreateCount: number;
        private _createdFlg: boolean = false;
        private _sex: number;
        private _defaultAni: string;
        private static boneOffsetMap: util.HashMap<{ x: number, y: number }> = new util.HashMap();

        /**1女 2男 */
        constructor(srvData: pb.IUserBase, defaultAni: string = 'huxi') {
            super();
            this._defaultAni = defaultAni;
            this._clothArr = srvData.curClothes;
            this._sex = srvData.sex;
            this._boneCount = 0;
            this._clothCreateCount = 0;
            this._wear = new util.HashMap();
            this.initAtlas();
            let tmp = new Laya.Templet();
            if (this._sex == 1)
                tmp.parseData(res.get('res/dragonBone/woman.png'), res.get('res/dragonBone/woman.sk'));
            else
                tmp.parseData(res.get('res/dragonBone/man.png'), res.get('res/dragonBone/man.sk'));
            this._bone = tmp.buildArmature(1);
            this.addChild(this._bone);
            this.stopAnimate();
            this.initBone();
            this.visible = false;
            for (const slotName of BONE_NAME_ARR) {
                let slot: Laya.BoneSlot = this._bone.getSlotByName(slotName);
                if (slot?.currTexture) {
                    let tex = slot.currTexture;
                    Person2.boneOffsetMap.add(slotName, { x: slot.currTexture.offsetX - tex.sourceWidth / 2, y: slot.currTexture.offsetY - tex.sourceHeight / 2 });
                }
                else {
                    console.warn('bone error');
                    Person2.boneOffsetMap.add(slotName, { x: 0, y: 0 });
                }
            }
        }

        private clearAllSlot() {
            if (this.destroyed)
                return;
            let allBoneName = _.map(this._bone['_boneSlotArray'], (slot) => { return slot['name'] });
            for (const slotName of allBoneName) {
                let slot = this._bone.getSlotByName(slotName);
                if (slot.currTexture) {
                    slot.currTexture.offAll();
                }
            }
        }

        replaceClothArr(arr: number[]) {
            this._boneCount = 0;
            this._clothArr = arr;
            this.initAtlas();
            this.clearAllSlot();
            this.initBone();
        }

        public get initOver(): boolean {
            return this._createdFlg;
        }

        private initAtlas() {
            if (this._atlas)
                this._atlas.destroy();
            this._atlas = new atlas.AtlasTexture(1024, 1024);
        }

        private async initBone() {
            if (this._alphaTex) {
                this._alphaTex.offAll();
            }
            this._alphaTex = new Laya.Texture();
            this._alphaTex.on(Laya.Event.READY, this, () => {
                this.pushToAtlas(this._alphaTex, 0, new Laya.Handler(this, this.replaceBone));
            })
            this._alphaTex.load('res/dragonBone/src/library/1.png');
        }

        private pushToAtlas(tex: Laya.Texture, idx: number, handler: Laya.Handler) {
            if (!this._atlas)
                return false;
            let obj = this._atlas.addTex(Math.ceil((tex.width + 2) / SIZE), Math.ceil((tex.height + 2) / SIZE));
            tex.url && console.log("合图: ", tex.url);
            if (obj.ret) {
                let ox = obj.x * SIZE + 1;
                let oy = obj.y * SIZE + 1;
                // this._atlas.pushToAtlas(tex, ox, oy);
                this._atlas.merge(tex, ox, oy, handler);
            } else {
                handler.runWith([tex, false]);
            }

            // return obj.ret;
        }

        private replaceBone() {
            if (!this._bone) return;
            let allSlotName = _.map(this._bone['_boneSlotArray'], (slot) => { return slot['name'] });
            for (let slotName of allSlotName) {
                let slot: Laya.BoneSlot = this._bone.getSlotByName(slotName);
                if (slot.currTexture) {
                    slot.currTexture.offAll();
                }
                let tex = new Laya.Texture();
                let skinId = _.find(this._clothArr, (id) => {
                    return ClothData.getCloth(id) ? ClothData.getCloth(id).clothType == CLOTH_TYPE.Skin : false;
                });
                tex.on(Laya.Event.READY, this, this.onLoaded, [tex, slot, true, skinId])
                if (BONE_NAME_ARR.indexOf(slotName) != -1) {
                    if (skinId) {
                        tex.load(`res/cloth/bone/${skinId}/${slotName}.png`);
                    }
                    else {
                        //默认肤色
                        tex.load(`res/dragonBone/src/library/${this._sex == 1 ? 'women' : 'man'}/${slotName}.png`);
                    }
                }
                else
                    tex.load('res/dragonBone/src/library/1.png');
            }
        }

        public playAnimate(ani: string, loop: boolean = true) {
            this._bone.play(ani, loop, true, 0, 0, false);
        }

        public stopAnimate() {
            this.playAnimate('static');
        }

        public flyAcceleration() {
            this._bone.offAll();
            this._bone.play('fly', false, true, 0, SPEED_UP_FRAME_TIME, false);
            this._bone.once(Laya.Event.LABEL, this, (e) => {
                if (e.name == 'ev1')
                    this._bone.play('fly', true, true, SPEED_UP_FRAME_TIME, SLOW_DOWN_FRAME_TIME, false);
            })
        }

        public flySlowDown() {
            let currFrameTime = this._bone.player['_currentFrameTime'];
            if (currFrameTime < SPEED_UP_FRAME_TIME) {
                //如果加速到一半就开始减速，需要根据人物已经倾斜比例 播放减速动画
                let per = (SPEED_UP_FRAME_TIME - currFrameTime) / SPEED_UP_FRAME_TIME;
                currFrameTime = SLOW_DOWN_FRAME_TIME + (TOTAL_FRAME_TIME - SLOW_DOWN_FRAME_TIME) * per;
            }
            else {
                currFrameTime = SLOW_DOWN_FRAME_TIME;
            }
            this._bone.play('fly', false, true, Math.min(currFrameTime, TOTAL_FRAME_TIME), TOTAL_FRAME_TIME, false);
            this._bone.once(Laya.Event.STOPPED, this, (e) => {
                this.playAnimate('huxi', true);
            })
        }

        private upByIdArr(ids: number[]) {
            this._clothCreateCount = 0;
            for (const id of ids) {
                let info: ClothInfo = ClothData.getCloth(id);
                if (!info)
                    console.warn('clothItemInfo.json中没有' + id + '的信息');
                else
                    this._clothCreateCount += info.partArr.length;
            }
            for (const id of ids)
                this.upById(id);
        }

        private upById(id: number): void {
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

        /**所有衣服 */
        public get allWearingIds() {
            return this._wear.getValues();
        }

        private upBySlotInfo(info: ClothPartInfo): void {
            let slot: Laya.BoneSlot = this._bone.getSlotByName(info.slotName);
            if (slot.currTexture)
                slot.currTexture.offAll();
            let tex = new Laya.Texture();
            tex.offsetX = info.px / 2;
            tex.offsetY = info.py / 2;
            tex.on(Laya.Event.READY, this, this.onLoaded, [tex, slot, false]);
            tex.on(Laya.Event.ERROR, this, this.handleLoadCount);
            tex.load('res/cloth_small/' + info.path);
        }

        private async onLoaded(tex: Laya.Texture, slot: Laya.BoneSlot, isBone: boolean, skinId?: number) {
            if (this.destroyed)
                return;
            if (tex.bitmap) {
                slot.currTexture.offAll();
                this.pushToAtlas(tex, 0, new Laya.Handler(this, (data: Laya.Texture, atlasOk: boolean) => {
                    if (!data) {
                        this.handleLoadCount();
                        return;
                    }
                    slot.currTexture = data;
                    if (isBone && BONE_NAME_ARR.indexOf(slot.name) > -1) {
                        //骨架的默认偏移
                        slot.currTexture.offsetX = Person2.boneOffsetMap.get(slot.name).x;
                        slot.currTexture.offsetY = Person2.boneOffsetMap.get(slot.name).y;
                        if (skinId == 4300011 || skinId == 4300012 || skinId == 4300013 || skinId == 4300014) {
                            if (slot.name == "head") {
                                slot.currTexture.offsetX -= this._sex == 1 ? 12 : 20;
                                slot.currTexture.offsetY += this._sex == 1 ? 4 : 0;
                            } else if (slot.name == "belly") {
                                slot.currTexture.offsetX -= 125;
                            }
                        }
                    }
                    if (atlasOk) {
                        // ???
                        slot.currTexture.offsetX += 512;
                        slot.currTexture.offsetY += 512;
                        // ?? 反正和1024有关（图集尺寸）
                        slot.currDisplayData.transform.scX = 1024 / tex.width * (isBone ? 1 : 2);
                        slot.currDisplayData.transform.scY = 1024 / tex.height * (isBone ? 1 : 2);
                    }
                    else {
                        slot.currTexture.offsetX += tex.width / 2;
                        slot.currTexture.offsetY += tex.height / 2;
                        slot.currDisplayData.transform.scX = 2;
                        slot.currDisplayData.transform.scY = 2;
                    }
                    slot.currDisplayData.width = tex.width;
                    slot.currDisplayData.height = tex.height;
                    this.handleLoadCount();
                }));

            } else
                this.handleLoadCount();
        }

        private handleLoadCount() {
            if (!this._bone) return;
            atlas.AtlasTexture.count--;
            let totalBoneNum = this._bone['_boneSlotArray'].length;
            this._boneCount++;
            if (this._boneCount == totalBoneNum) {
                //骨头皮肤加载完毕 开始加载衣服
                if (this._clothArr.length > 0)
                    this.upByIdArr(this._clothArr);
                else {
                    // console.log("----------------- allNeedLoad run  1 --------");
                    this.allNeedLoaded();
                }
            }
            else if (this._boneCount > totalBoneNum) {
                this._clothCreateCount--;
                if (this._clothCreateCount == 0) {
                    // console.log("----------------- allNeedLoad run  2 --------");
                    this.allNeedLoaded();
                }
            }
        }

        private allNeedLoaded() {
            this._bone['_clearCache']();
            this.playAnimate(this._defaultAni, true);
            this._createdFlg = true;
            this.visible = true;
            this.event(Laya.Event.CHANGED);
        }

        private downBySlotName(slotName: string): void {
            let slot: Laya.BoneSlot = this._bone.getSlotByName(slotName);
            let tex: Laya.Texture = slot.currTexture;
            tex && tex != this._alphaTex && tex.destroy(true);
            slot.currTexture = this._alphaTex;
            this._bone['_clearCache']();
        }

        public destory() {
            // console.log("------------------- person2 destroy run  !!!!!!");
            this.removeSelf();
            this.clearAllSlot();
            this._bone && this._bone.stop();
            this._bone && this._bone.destroy();
            this._wear?.clear();
            this._bone = null;
            this._wear = null;
            //合图集需要释放，不然一个人会产出4M内存泄露
            this._alphaTex && this._alphaTex.destroy();
            this._alphaTex = null;
            this._atlas && this._atlas.destroy();
            this._atlas = null;
            super.destroy();

        }
    }
}