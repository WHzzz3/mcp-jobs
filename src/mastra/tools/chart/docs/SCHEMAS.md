# Schema 定义参考

本文档详细说明了图表配置系统中使用的JSON Schema定义。

## 目录

- [公共Schema](#公共schema)
- [基础图表Schema](#基础图表schema)
- [进度图表Schema](#进度图表schema)
- [堆叠图表Schema](#堆叠图表schema)
- [复杂图表Schema](#复杂图表schema)
- [混合图表Schema](#混合图表schema)
- [数据格式定义](#数据格式定义)
- [Schema扩展指南](#schema扩展指南)

## 公共Schema

所有图表类型都继承的基础Schema定义。

### 文件位置
`schemas/common.schema.json`

### 主要结构

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "definitions": {
    "chartDataArray": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "type": "array"
        }
      }
    },
    "colorArray": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^#[0-9a-fA-F]{6}$"
      }
    },
    "themeType": {
      "type": "string",
      "enum": ["light", "dark"]
    }
  }
}
```

### 关键定义说明

#### chartDataArray
三维数组结构，用于存储图表数据：
- 第一维：数据集
- 第二维：数据行
- 第三维：数据列

#### colorArray
颜色数组，支持十六进制颜色值，格式为`#RRGGBB`。

## 基础图表Schema

### basic-column.schema.json

基础柱状图Schema定义，使用`key_value`管道，支持柱状图特定配置如边框圆角、间隙等。

### basic-bar.schema.json

基础条形图Schema，与柱状图类似，但轴配置相反。

### basic-pie.schema.json

基础饼图Schema定义，支持半径、起始角度、玫瑰图等配置。

### basic-line.schema.json

基础折线图Schema定义，支持平滑曲线、符号、面积填充等配置。

## 进度图表Schema

### bar-progress.schema.json

条形进度图Schema定义，支持百分比显示、阈值颜色、方向设置等。

### donut-progress.schema.json

环形进度图Schema定义，类似饼图但专门用于进度显示。

## 堆叠图表Schema

### stacked-column.schema.json

堆叠柱状图Schema定义，使用`cross`管道，支持堆叠配置、系列管理等。

### stacked-bar.schema.json

堆叠条形图Schema，与堆叠柱状图类似但方向相反。

### stacked-area.schema.json

堆叠面积图Schema，支持面积填充、透明度等配置。

## 复杂图表Schema

### voronoi.schema.json

泰森多边形图Schema定义，支持7种绘制形状、自动/固定模式等配置。

### sankey.schema.json

桑基图Schema定义，支持节点宽度、连线透明度、颜色模式等配置。

### single-layer-treemap.schema.json

单层树图Schema定义，支持矩形间隙、填充透明度等配置。

## 混合图表Schema

### mixed-line-stacked-column.schema.json

线条-堆叠柱状混合图Schema定义，使用`cross`管道，支持双Y轴配置。

### mixed-line-grouped-column.schema.json

线条-分组柱状混合图Schema定义，支持线条和柱状图的混合显示。

## 数据格式定义

### key_value管道格式

用于基础图表和复杂图表的数据格式：

```typescript
// 二维数据 (基础图表)
data: [[
  ['类别名称', 数值],
  ['A类', 100],
  ['B类', 200],
  ['C类', 150]
]]

// 三维数据 (复杂图表如Voronoi)
data: [[
  ['一级分类', '二级对象', '数值'],
  ['分类1', '对象X', 100],
  ['分类1', '对象Y', 150],
  ['分类2', '对象Z', 200]
]]
```

### cross管道格式

用于堆叠图表和混合图表的数据格式：

```typescript
// 多系列数据
data: [[
  ['类别', '系列1', '系列2', '系列3'],
  ['1月', 100, 150, 80],
  ['2月', 120, 180, 90],
  ['3月', 140, 160, 110]
]]
```

## Schema扩展指南

### 创建新图表Schema

1. **继承公共Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "allOf": [
    {"$ref": "./common.schema.json"},
    {
      // 特定图表配置
    }
  ]
}
```

2. **定义图表类型**
```json
{
  "properties": {
    "props": {
      "properties": {
        "type": {"const": "your-chart-type"}
      }
    }
  }
}
```

3. **指定数据管道**
```json
{
  "properties": {
    "pipe": {"const": "key_value"} // 或 "cross"
  }
}
```

### Schema最佳实践

1. **使用有意义的属性名**
   - 使用驼峰命名法
   - 名称应该描述配置的用途
   - 避免缩写和模糊名称

2. **设置合理的约束**
   - 为数值设置最小值和最大值
   - 为字符串使用枚举或模式验证
   - 为数组设置最小和最大项目数

3. **提供清晰的文档**
   - 使用`description`字段说明属性用途
   - 提供`examples`展示使用方法
   - 在`title`中提供简短描述

---

*Schema定义会随着系统功能扩展而持续更新。* 