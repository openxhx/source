
namespace scene.map {
    /**
     * 场景基础
     */
    export class SceneBase {

        /** 场景容器 理论上所有的场景对象都应该被添加在这里*/
        protected _sceneContainer: Laya.Sprite;
        /** 场景地图*/
        protected _map: Laya.Image;

        constructor() {
            this._sceneContainer = new Laya.Sprite();
            clientCore.LayerManager.battleLayer.addChildAt(this._sceneContainer, 0);
            this._map = new Laya.Image();
            this._sceneContainer.addChild(this._map);
        }
    }
}