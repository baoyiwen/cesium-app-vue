import * as Cesium from 'cesium';
/**
 * EllipsoidFadeEntity 类，用于封装带有渐隐材质效果的椭圆体实体，并支持动态更新材质属性。
 */
export class EllipsoidFadeEntity {
  /**
   * 构造函数，初始化 EllipsoidFadeEntity 实例
   * @param {Object} centroid - 中心点坐标数据，必须包含 geometry.coordinates。
   * @param {Cesium.Color} color - 椭圆体的颜色，默认为 Cesium.Color.RED。
   * @param {number} duration - 动画持续时间（毫秒），默认为 3000 毫秒。
   */
  constructor(id, centroid, height, color, duration) {
    if (!centroid || !centroid.geometry || !centroid.geometry.coordinates) {
      throw new Error('无效的中心点数据 (centroid)。');
    }

    this._centroid = centroid;
    this._color = color || Cesium.Color.RED;
    this._duration = duration || 3000;
    this._height = height;
    this._id = id;
    // 如果自定义材质未注册，则注册材质
    if (!this._isMaterialRegistered(Cesium.Material.EllipsoidFadeType)) {
      this._registerMaterial();
    }

    // Object.defineProperties(EllipsoidFadeMaterialProperty.prototype, {
    //   color: Cesium.createPropertyDescriptor('color'),
    // });

    // 创建 EllipsoidFadeMaterialProperty 属性
    this._materialProperty = new EllipsoidFadeMaterialProperty(
      this._color,
      this._duration
    );

    // 创建实体
    this._entity = this._createEntity();
  }

  /**
   * 检查自定义材质是否已注册。
   * @param {string} materialType - 材质类型名称。
   * @returns {boolean} - 如果材质已注册，则返回 true；否则返回 false。
   */
  _isMaterialRegistered(materialType) {
    return !!Cesium.Material._materialCache.getMaterial(materialType);
  }

  /**
   * 注册自定义材质（仅在首次调用时注册）。
   */
  _registerMaterial() {
    Cesium.Material.EllipsoidFadeType = 'EllipsoidFade';
    Cesium.Material.EllipsoidFadeSource =
      'czm_material czm_getMaterial(czm_materialInput materialInput)\n' +
      '{\n' +
      'czm_material material = czm_getDefaultMaterial(materialInput);\n' +
      'material.diffuse = 1.5 * color.rgb;\n' +
      'vec2 st = materialInput.st;\n' +
      'float dis = distance(st, vec2(0.5, 0.5));\n' +
      'float per = fract(time);\n' +
      'if(dis > per * 0.5){\n' +
      'material.alpha = 0.0;\n' +
      'discard;\n' +
      '}else {\n' +
      'material.alpha = color.a  * dis / per / 1.0;\n' +
      '}\n' +
      'return material;\n' +
      '}';

    Cesium.Material._materialCache.addMaterial(
      Cesium.Material.EllipsoidFadeType,
      {
        fabric: {
          type: Cesium.Material.EllipsoidFadeType,
          uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1), // 默认颜色为红色
            time: 1, // 时间参数，用于动画
          },
          source: Cesium.Material.EllipsoidFadeSource, // 材质 GLSL 着色代码
        },
        translucent: function (material) {
          // 定义材质是否透明
          return true;
        },
      }
    );
  }

  /**
   * 创建带有渐隐材质效果的实体。
   * @returns {Cesium.Entity} - 创建的 Cesium 实体。
   */
  _createEntity() {
    return new Cesium.Entity({
      id: this._id,
      position: Cesium.Cartesian3.fromDegrees(
        this._centroid.geometry.coordinates[0],
        this._centroid.geometry.coordinates[1],
        this._height // 椭圆体的高度（米）
      ),
      ellipse: {
        height: 100, // 椭圆体的高度
        semiMinorAxis: 3000.0, // 椭圆体短轴半径
        semiMajorAxis: 3000.0, // 椭圆体长轴半径
        material: this._materialProperty, // 应用自定义的渐隐材质
      },
    });
  }

  /**
   * 获取创建的实体对象。
   * @returns {Cesium.Entity} - 创建的实体。
   */
  get entity() {
    return this._entity;
  }

  /**
   * 动态更新颜色。
   * @param {Cesium.Color} newColor - 新的颜色值。
   */
  updateColor(newColor) {
    if (!Cesium.defined(newColor)) {
      throw new Error('新的颜色值不能为空。');
    }
    this._color = newColor;
    this._materialProperty.color = newColor; // 更新材质的颜色
  }

  /**
   * 动态更新动画持续时间。
   * @param {number} newDuration - 新的动画持续时间（毫秒）。
   */
  updateDuration(newDuration) {
    if (!Number.isFinite(newDuration) || newDuration <= 0) {
      throw new Error('新的持续时间必须为有效的正数。');
    }
    this._duration = newDuration;
    this._materialProperty.duration = newDuration; // 更新材质的持续时间
  }

  /**
   * 获取当前颜色。
   * @returns {Cesium.Color} - 当前椭圆体的颜色。
   */
  getColor() {
    return this._color;
  }

  /**
   * 获取当前动画持续时间。
   * @returns {number} - 当前动画持续时间（毫秒）。
   */
  getDuration() {
    return this._duration;
  }
}

// 定义 EllipsoidFadeMaterialProperty 类
export class EllipsoidFadeMaterialProperty {
  /**
   * 构造函数，初始化材质属性
   * @param {Cesium.Color} color - 材质的颜色
   * @param {number} duration - 动画持续时间（毫秒）
   */
  constructor(color, duration) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined; // 内部颜色属性
    this._colorSubscription = undefined;
    this.color = color; // 设置材质颜色
    this.duration = duration; // 设置动画持续时间
    this._time = new Date().getTime(); // 动画的起始时间
  }

  /**
   * 获取定义更改事件（用于监听属性变化）。
   */
  get definitionChanged() {
    return this._definitionChanged;
  }

  /**
   * 获取材质的类型（这里为 'EllipsoidFade'）。
   * @returns {string} - 材质类型
   */
  getType(time) {
    return 'EllipsoidFade';
  }

  /**
   * 获取材质的属性值（在特定时间点的值）。
   * @param {Cesium.JulianDate} time - 时间
   * @param {Object} result - 用于存储结果的对象
   * @returns {Object} - 包含材质属性的对象
   */
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(
      this._color,
      time,
      Cesium.Color.WHITE,
      result.color
    );

    result.time =
      ((new Date().getTime() - this._time) % this.duration) / this.duration;
    return result;
  }

  /**
   * 判断两个材质属性是否相等。
   * @param {EllipsoidFadeMaterialProperty} other - 另一个材质属性
   * @returns {boolean} - 是否相等
   */
  equals(other) {
    return (
      this === other ||
      (other instanceof EllipsoidFadeMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    );
  }
}

// 定义材质的属性描述符
Object.defineProperties(EllipsoidFadeMaterialProperty.prototype, {
  color: Cesium.createPropertyDescriptor('color'),
});
