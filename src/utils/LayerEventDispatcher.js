/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-27 09:50:55
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-27 16:17:44
 * @FilePath: \cesium-app-vue\src\utils\LayerEventDispatcher.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from 'cesium';

export class LayerEventDispatcher {
  constructor(viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('需要传 Cesium.Viewer');
    }
    this.viewer = viewer;

    this._handlerMap = {};
    this._listenerMap = {};

    this.multiSelect = false; // 是否启用 Shift 多选
    this._selectedEntities = new Set(); // 已选中的 Entity 集合

    this._initHandlers();
    this._bindKeyboard(); // 监听 Shift 按键
  }

  _initHandlers() {
    const clickHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );

    clickHandler.setInputAction((movement) => {
      const picked = this.viewer.scene.pick(movement.position);
      if (!Cesium.defined(picked)) return;
      const entity = picked.id;
      if (!entity?.layerId) return;

      const layerId = entity.layerId;

      const eventCallbacks = this._listenerMap['click'];
      if (!eventCallbacks) return;

      const callback = eventCallbacks.get(layerId);
      if (callback) {
        callback(entity, movement, this.multiSelect);
        this._handleSelection(entity);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this._handlerMap['click'] = clickHandler;
    this._listenerMap['click'] = new Map();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') {
        this.multiSelect = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.multiSelect = false;
      }
    });
  }

  _handleSelection(entity) {
    if (this.multiSelect) {
      this._selectedEntities.add(entity);
    } else {
      this._selectedEntities.clear();
      this._selectedEntities.add(entity);
    }
  }

  getSelectedEntities() {
    return [...this._selectedEntities];
  }

  clearSelection() {
    this._selectedEntities.clear();
  }

  on(eventType, layerId, callback) {
    if (!this._listenerMap[eventType]) {
      this._listenerMap[eventType] = new Map();
    }
    this._listenerMap[eventType].set(layerId, callback);
  }

  off(eventType, layerId) {
    this._listenerMap[eventType]?.delete(layerId);
  }

  destroy() {
    Object.values(this._handlerMap).forEach((handler) => handler?.destroy());
    this._handlerMap = {};
    this._listenerMap = {};
    this._selectedEntities.clear();
  }
}
