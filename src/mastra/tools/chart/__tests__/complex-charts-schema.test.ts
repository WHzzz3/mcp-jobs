import { describe, it, expect, beforeAll } from 'vitest';
import { SchemaMerger } from '../utils/schema-merger';
import path from 'path';
import fs from 'fs/promises';

describe('Complex Charts Schema Tests', () => {
  let schemaMerger: SchemaMerger;
  let voronoiSchema: any;
  let sankeySchema: any;
  let treemapSchema: any;
  let voronoiSample: any;
  let sankeySample: any;
  let treemapSample: any;

  beforeAll(async () => {
    schemaMerger = new SchemaMerger();
    
    // 加载合并后的schemas
    voronoiSchema = await schemaMerger.getMergedSchema('voronoi');
    sankeySchema = await schemaMerger.getMergedSchema('sankey');
    treemapSchema = await schemaMerger.getMergedSchema('single-layer-treemap');
    
    // 加载sample配置文件
    const configsDir = path.join(__dirname, '../configs');
    const voronoiSamplePath = path.join(configsDir, 'voronoi.sample.json');
    const sankeySamplePath = path.join(configsDir, 'sankey.sample.json');
    const treemapSamplePath = path.join(configsDir, 'single-layer-treemap.sample.json');
    
    voronoiSample = JSON.parse(await fs.readFile(voronoiSamplePath, 'utf-8'));
    sankeySample = JSON.parse(await fs.readFile(sankeySamplePath, 'utf-8'));
    treemapSample = JSON.parse(await fs.readFile(treemapSamplePath, 'utf-8'));
  });

  describe('Schema Loading', () => {
    it('应该成功加载所有复杂图表的schema', () => {
      expect(voronoiSchema).toBeDefined();
      expect(sankeySchema).toBeDefined();
      expect(treemapSchema).toBeDefined();
    });

    it('所有schema应该有正确的基本结构', () => {
      [voronoiSchema, sankeySchema, treemapSchema].forEach(schema => {
        expect(schema.properties).toBeDefined();
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.pipe).toBeDefined();
        expect(schema.properties.props).toBeDefined();
      });
    });
  });

  describe('Voronoi Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(voronoiSchema.properties.props.properties.type.const).toBe('voronoi');
    });

    it('应该有正确的管道配置', () => {
      expect(voronoiSchema.properties.pipe.default).toBe('key_value');
    });

    it('应该包含必要的配置项', () => {
      const props = voronoiSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
    });

    it('应该有维诺图特定的map配置', () => {
      const mapItems = voronoiSchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('voronoi');
      expect(mapItems.properties.function.enum).toContain('typeCol');
      expect(mapItems.properties.function.enum).toContain('objCol');
      expect(mapItems.properties.function.enum).toContain('vCol');
    });

    it('应该有维诺图特定的显示配置', () => {
      const display = voronoiSchema.properties.props.properties.display.properties;
      expect(display.voronoi).toBeDefined();
      expect(display.voronoi.properties.drawShape).toBeDefined();
      expect(display.voronoi.properties.drawStyle).toBeDefined();
      expect(display.voronoi.properties.cornerRadius).toBeDefined();
      expect(display.voronoi.properties.fillOpacity).toBeDefined();
    });

    it('应该支持多种绘制形状', () => {
      const drawShape = voronoiSchema.properties.props.properties.display.properties.voronoi.properties.drawShape;
      expect(drawShape.enum).toContain('circle');
      expect(drawShape.enum).toContain('hexagon');
      expect(drawShape.enum).toContain('rectangle');
      expect(drawShape.default).toBe('hexagon');
    });

    it('sample配置应该符合schema要求', () => {
      expect(voronoiSample.props.type).toBe('voronoi');
      expect(voronoiSample.pipe).toBe('key_value');
      expect(Array.isArray(voronoiSample.data)).toBe(true);
      expect(Array.isArray(voronoiSample.props.map)).toBe(true);
    });
  });

  describe('Sankey Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(sankeySchema.properties.props.properties.type.const).toBe('sankey');
    });

    it('应该有正确的管道配置', () => {
      expect(sankeySchema.properties.pipe.default).toBe('key_value');
    });

    it('应该包含必要的配置项', () => {
      const props = sankeySchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
    });

    it('应该有桑基图特定的map配置', () => {
      const mapItems = sankeySchema.properties.props.properties.map.items;
      expect(mapItems.properties.type.enum).toContain('sankey');
      expect(mapItems.properties.function.enum).toContain('sourceCol');
      expect(mapItems.properties.function.enum).toContain('targetCol');
      expect(mapItems.properties.function.enum).toContain('vCol');
    });

    it('应该有桑基图特定的显示配置', () => {
      const display = sankeySchema.properties.props.properties.display.properties;
      expect(display.sankey).toBeDefined();
      expect(display.sankey.properties.gapDistance).toBeDefined();
      expect(display.sankey.properties.fillOpacity).toBeDefined();
      expect(display.sankey.properties.nodeWidth).toBeDefined();
    });

    it('应该支持多种连线颜色配置', () => {
      const color = sankeySchema.properties.props.properties.display.properties.sankey.properties.color;
      expect(color.oneOf).toBeDefined();
      expect(color.oneOf.length).toBeGreaterThan(1);
    });

    it('sample配置应该符合schema要求', () => {
      expect(sankeySample.props.type).toBe('sankey');
      expect(sankeySample.pipe).toBe('key_value');
      expect(Array.isArray(sankeySample.data)).toBe(true);
      expect(Array.isArray(sankeySample.props.map)).toBe(true);
    });
  });

  describe('Single-Layer Treemap Schema', () => {
    it('应该有正确的图表类型定义', () => {
      expect(treemapSchema.properties.props.properties.type.const).toBe('single-layer-treemap');
    });

    it('应该有正确的管道配置', () => {
      expect(treemapSchema.properties.pipe.default).toBe('key_value');
    });

    it('应该包含必要的配置项', () => {
      const props = treemapSchema.properties.props.properties;
      expect(props.title).toBeDefined();
      expect(props.background).toBeDefined();
      expect(props.map).toBeDefined();
      expect(props.fill).toBeDefined();
      expect(props.display).toBeDefined();
    });

    it('应该有矩形树图特定的map配置', () => {
      const mapConfig = treemapSchema.properties.props.properties.map;
      expect(mapConfig.items.properties.type.enum).toContain('bar');
      expect(mapConfig.minItems).toBe(2);
      expect(mapConfig.maxItems).toBe(2);
    });

    it('应该有矩形树图特定的显示配置', () => {
      const display = treemapSchema.properties.props.properties.display.properties;
      expect(display.bar).toBeDefined();
      expect(display.bar.properties.gapDistance).toBeDefined();
      expect(display.bar.properties.fillOpacity).toBeDefined();
    });

    it('应该有边框配置', () => {
      const border = treemapSchema.properties.props.properties.fill.properties.props.items.properties.border;
      expect(border).toBeDefined();
      expect(border.properties.type).toBeDefined();
      expect(border.properties.width).toBeDefined();
      expect(border.properties.color).toBeDefined();
    });

    it('sample配置应该符合schema要求', () => {
      expect(treemapSample.props.type).toBe('single-layer-treemap');
      expect(treemapSample.pipe).toBe('key_value');
      expect(Array.isArray(treemapSample.data)).toBe(true);
      expect(Array.isArray(treemapSample.props.map)).toBe(true);
    });
  });

  describe('Cross-Chart Consistency', () => {
    it('所有复杂图表应该使用key_value管道类型', () => {
      expect(voronoiSchema.properties.pipe.default).toBe('key_value');
      expect(sankeySchema.properties.pipe.default).toBe('key_value');
      expect(treemapSchema.properties.pipe.default).toBe('key_value');
    });

    it('所有复杂图表应该引用相同的common schema定义', () => {
      [voronoiSchema, sankeySchema, treemapSchema].forEach(schema => {
        const props = schema.properties.props.properties;
        expect(props.title).toBeDefined();
        expect(props.background).toBeDefined();
      });
    });

    it('所有复杂图表都应该有正确的数据格式', () => {
      [voronoiSample, sankeySample, treemapSample].forEach(sample => {
        expect(Array.isArray(sample.data)).toBe(true);
        expect(sample.data.length).toBeGreaterThan(0);
        // 检查数据是否被包装在数组中
        const actualData = sample.data[0] || sample.data;
        expect(Array.isArray(actualData)).toBe(true);
      });
    });
  });

  describe('Data Format Validation', () => {
    it('维诺图应该有分层数据格式', () => {
      const voronoiData = voronoiSample.data;
      expect(voronoiData.length).toBeGreaterThan(0);
      const actualData = voronoiData[0] || voronoiData;
      expect(Array.isArray(actualData)).toBe(true);
      expect(actualData.length).toBeGreaterThan(1);
      
      // 验证map配置与数据结构匹配
      expect(voronoiSample.props.map.length).toBe(3); // 分类、对象、数值
    });

    it('桑基图应该有源-目标-值数据格式', () => {
      const sankeyData = sankeySample.data;
      expect(sankeyData.length).toBeGreaterThan(0);
      const actualData = sankeyData[0] || sankeyData;
      expect(Array.isArray(actualData)).toBe(true);
      expect(actualData.length).toBeGreaterThan(1);
      
      // 验证map配置
      expect(sankeySample.props.map.length).toBe(3); // 源、目标、值
      const functions = sankeySample.props.map.map((item: any) => item.function);
      expect(functions).toContain('sourceCol');
      expect(functions).toContain('targetCol');
      expect(functions).toContain('vCol');
    });

    it('矩形树图应该有名称-值数据格式', () => {
      const treemapData = treemapSample.data;
      expect(treemapData.length).toBeGreaterThan(0);
      const actualData = treemapData[0] || treemapData;
      expect(Array.isArray(actualData)).toBe(true);
      expect(actualData.length).toBeGreaterThan(1);
      
      // 验证map配置
      expect(treemapSample.props.map.length).toBe(2); // 名称、值
      const functions = treemapSample.props.map.map((item: any) => item.function);
      expect(functions).toContain('objCol');
      expect(functions).toContain('vCol');
    });
  });

  describe('Schema Integration', () => {
    it('应该能通过SchemaMerger正确加载和合并schema', async () => {
      const merger = new SchemaMerger();
      
      const voronoi = await merger.getMergedSchema('voronoi');
      const sankey = await merger.getMergedSchema('sankey');
      const treemap = await merger.getMergedSchema('single-layer-treemap');
      
      expect(voronoi).toBeDefined();
      expect(sankey).toBeDefined();
      expect(treemap).toBeDefined();
    });

    it('合并后的schema应该有完整的定义', () => {
      [voronoiSchema, sankeySchema, treemapSchema].forEach(schema => {
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.props.properties.title).toBeDefined();
        expect(schema.properties.props.properties.background).toBeDefined();
        expect(schema.properties.props.properties.fill).toBeDefined();
        expect(schema.properties.props.properties.display).toBeDefined();
      });
    });
  });

  describe('Advanced Features', () => {
    it('维诺图应该支持多种绘制模式', () => {
      const voronoiDisplay = voronoiSchema.properties.props.properties.display.properties.voronoi.properties;
      expect(voronoiDisplay.drawStyle.enum).toContain('auto');
      expect(voronoiDisplay.drawStyle.enum).toContain('fixed');
      expect(voronoiDisplay.cornerRadius).toBeDefined();
    });

    it('桑基图应该支持渐变连线', () => {
      const sankeyColor = sankeySchema.properties.props.properties.display.properties.sankey.properties.color;
      const gradientOption = sankeyColor.oneOf.find((option: any) => option.const === 'gradient');
      expect(gradientOption).toBeDefined();
      expect(gradientOption.description).toContain('渐变');
    });

    it('矩形树图应该支持边框圆角', () => {
      const borderRadius = treemapSchema.properties.props.properties.display.properties.bar.properties.border.properties.radius;
      expect(borderRadius).toBeDefined();
      expect(borderRadius.oneOf).toBeDefined(); // 支持单个数值或数组
    });
  });

  describe('Validation Constraints', () => {
    it('应该有适当的数值约束', () => {
      // 维诺图透明度约束
      const voronoiFillOpacity = voronoiSchema.properties.props.properties.display.properties.voronoi.properties.fillOpacity;
      expect(voronoiFillOpacity.minimum).toBe(0);
      expect(voronoiFillOpacity.maximum).toBe(1);
      
      // 桑基图节点宽度约束
      const sankeyNodeWidth = sankeySchema.properties.props.properties.display.properties.sankey.properties.nodeWidth;
      expect(sankeyNodeWidth.minimum).toBe(1);
      
      // 矩形树图间隙约束
      const treemapGap = treemapSchema.properties.props.properties.display.properties.bar.properties.gapDistance;
      expect(treemapGap.minimum).toBe(0);
    });

    it('应该有合理的默认值', () => {
      expect(voronoiSchema.properties.props.properties.display.properties.voronoi.properties.drawShape.default).toBe('hexagon');
      expect(sankeySchema.properties.props.properties.display.properties.sankey.properties.fillOpacity.default).toBe(0.3);
      expect(treemapSchema.properties.props.properties.display.properties.bar.properties.gapDistance.default).toBe(2);
    });
  });
}); 