
namespace clientCore {

    export class BoneMgr {

        constructor() { }

        /**加载并播放一个动画，监听本函数返回对象的 Laya.Event.COMPLETE 时间可以判断是否播放完,加载完成后会派发Laya.Event.START */
        public play(path: string, nameOrIndex: number | string, isLoop: boolean, parent: Laya.Sprite, extraData?: { addChildAtIndex?: number, buildType?: number, defaultSkinName?: string }, isHit?: boolean, retain?: boolean): Bone {
            let templet: Laya.Templet;
            let bone: Bone = new Bone();
            bone.path = path;
            bone.isHit = isHit;
            bone.isLoop = isLoop;
            bone.parent = parent;
            bone.retain = retain;
            bone.nameOrIndex = nameOrIndex;
            bone.extraData = extraData;
            templet = BoneMemory.ins.getTemp(path);
            if (extraData) {
                bone.buildType = extraData.buildType;
                bone.defaultSkinName = extraData.defaultSkinName;
            }
            if (templet) {
                this.addBone(templet, bone);
            } else {
                templet = new Laya.Templet();
                templet.once(Laya.Event.COMPLETE, this, this.parseComplete, [templet, bone]);
                templet.loadAni(path);
            }
            return bone;
        }

        /**播放一个坐骑动画，默认加到parent的最低层级 */
        public playRiderBone(id: number, parent: Laya.Sprite) {
            let bone = this.play(pathConfig.getRiderSkUrl(id), 0, true, parent, { addChildAtIndex: 0 });
            bone.scaleX = bone.scaleY = clientCore.PeopleManager.RIDER_SCALE;
            let posInfo = xls.get(xls.bgshow).get(id)?.blockPosArr;
            if (posInfo?.length) {
                bone.x = posInfo[0].v1;
                bone.y = posInfo[0].v2;
            }
            return bone;
        }

        private parseComplete(templet: Laya.Templet, bone: Bone): void {
            templet.lock = true; //+锁 防止自动清理 交给BoneMemory统一管理
            this.addBone(templet, bone);
        }

        private addBone(templet: Laya.Templet, bone: Bone): void {
            if (!bone || bone.disposed) return;
            let skeleton: Laya.Skeleton = templet.buildArmature(bone.buildType);
            bone.templet = templet;
            bone.skeleton = skeleton;
            if (_.isNumber(bone.extraData?.addChildAtIndex))
                bone.parent.addChildAt(bone.skeleton, bone.extraData.addChildAtIndex);
            else
                bone.parent.addChild(bone.skeleton);
            bone.pos(bone.x, bone.y);
            bone.scaleX = bone.scaleX;
            bone.scaleY = bone.scaleY;
            bone.mask = bone.mask;
            bone.rate = bone.rate;
            bone.visible = bone.visible;
            bone.rotation = bone.rotation;
            skeleton.showSkinByName(bone.defaultSkinName);
            if (bone.isLoop == false) {
                bone.skeleton.once(Laya.Event.STOPPED, bone, () => {
                    bone.event(Laya.Event.COMPLETE);
                    if (!bone.retain)
                        bone.dispose();
                })
            }
            bone.play(bone.nameOrIndex, bone.isLoop);
            bone.event(Laya.Event.START);
            BoneMemory.ins.remove(bone.path, templet); //加入自动内存管理
        }

        private static _ins: BoneMgr;
        public static get ins(): BoneMgr {
            return this._ins || (this._ins = new BoneMgr());
        }
    }
}