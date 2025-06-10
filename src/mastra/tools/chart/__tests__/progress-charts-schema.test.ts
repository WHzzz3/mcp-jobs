import { describe, it, expect, beforeAll } from 'vitest';
import { SchemaMerger } from '../utils/schema-merger';
import path from 'path';
import fs from 'fs/promises';

describe('Progress Charts Schema Tests', () => {
  let schemaMerger: SchemaMerger;
  let barProgressSchema: any;
  let donutProgressSchema: any;
  let barProgressSample: any;
  let donutProgressSample: any;

  beforeAll(async () => {
    schemaMerger = new SchemaMerger();
    
    // 加载合并后的schemas
    barProgressSchema = await schemaMerger.getMergedSchema('bar-progress');
    donutProgressSchema = await schemaMerger.getMergedSchema('donut-progress');
    
    // 加载sample配置文件
    const configsDir = path.join(__dirname, '../configs');
    const barProgressSamplePath = path.join(configsDir, 'bar-progress.sample.json');
    const donutProgressSamplePath = path.join(configsDir, 'donut-progress.sample.json');
    
    barProgressSample = JSON.parse(await fs.readFile(barProgressSamplePath, 'utf-8'));
    donutProgressSample = JSON.parse(await fs.readFile(donutProgressSamplePath, 'utf-8'));
  });

  describe('Schema Loading', () => {
    it('应该能够成功加载 bar-progress schema', () => {
      expect(barProgressSchema).toBeDefined();
      expect(barProgressSchema.type).toBe('object');
      expect(barProgressSchema.properties).toBeDefined();
    });

    it('应该能够成功加载 donut-progress schema', () => {
      expect(donutProgressSchema).toBeDefined();
      expect(donutProgressSchema.type).toBe('object');
      expect(donutProgressSchema.properties).toBeDefined();
    });
  });

  describe('Bar Progress Schema Structure', () => {
    it('应该包含必需的顶层属性', () => {
      const requiredTopLevelProps = ['data', 'pipe', 'props'];
      requiredTopLevelProps.forEach(prop => {
        expect(barProgressSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该正确定义 pipe 属性', () => {
      const pipeSchema = barProgressSchema.properties.pipe;
      expect(pipeSchema.type).toBe('string');
      expect(pipeSchema.default).toBe('key_value');
    });

    it('应该正确定义 props.type 为 bar-progress', () => {
      const typeSchema = barProgressSchema.properties.props.properties.type;
      expect(typeSchema.type).toBe('string');
      expect(typeSchema.const).toBe('bar-progress');
    });

    it('应该包含所有必需的 props 子属性', () => {
      const propsSchema = barProgressSchema.properties.props;
      const requiredProps = [
        'type', 'title', 'background', 'map', 'fill', 'display', 
        'legend', 'label', 'numberFormat', 'animation', 'tooltip', 'padding'
      ];
      
      requiredProps.forEach(prop => {
        expect(propsSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该正确配置 map 数组结构', () => {
      const mapSchema = barProgressSchema.properties.props.properties.map;
      expect(mapSchema.type).toBe('array');
      expect(mapSchema.minItems).toBe(2);
      expect(mapSchema.maxItems).toBe(2);
      
      const mapItemSchema = mapSchema.items;
      const requiredMapProps = ['name', 'index', 'isLegend', 'function', 'configurable', 'type'];
      requiredMapProps.forEach(prop => {
        expect(mapItemSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该正确配置 fill 属性', () => {
      const fillSchema = barProgressSchema.properties.props.properties.fill;
      expect(fillSchema.properties.controlType.const).toBe('single');
      expect(fillSchema.properties.props.type).toBe('array');
      expect(fillSchema.properties.props.minItems).toBe(1);
      expect(fillSchema.properties.props.maxItems).toBe(1);
    });

    it('应该正确配置 display.bar 特定属性', () => {
      const displaySchema = barProgressSchema.properties.props.properties.display;
      const barDisplaySchema = displaySchema.properties.pie; // 注意：schema中使用pie但实际是bar
      expect(barDisplaySchema).toBeDefined();
      expect(barDisplaySchema.properties.widthPercent).toBeDefined();
      expect(barDisplaySchema.properties.backgroundColor).toBeDefined();
    });
  });

  describe('Donut Progress Schema Structure', () => {
    it('应该包含必需的顶层属性', () => {
      const requiredTopLevelProps = ['data', 'pipe', 'props'];
      requiredTopLevelProps.forEach(prop => {
        expect(donutProgressSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该正确定义 pipe 属性', () => {
      const pipeSchema = donutProgressSchema.properties.pipe;
      expect(pipeSchema.type).toBe('string');
      expect(pipeSchema.default).toBe('key_value');
    });

    it('应该正确定义 props.type 为 donut-progress', () => {
      const typeSchema = donutProgressSchema.properties.props.properties.type;
      expect(typeSchema.type).toBe('string');
      expect(typeSchema.const).toBe('donut-progress');
    });

    it('应该包含所有必需的 props 子属性', () => {
      const propsSchema = donutProgressSchema.properties.props;
      const requiredProps = [
        'type', 'title', 'background', 'map', 'fill', 'display', 
        'legend', 'label', 'numberFormat', 'animation', 'tooltip', 'padding'
      ];
      
      requiredProps.forEach(prop => {
        expect(propsSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该正确配置 display.pie 特定属性', () => {
      const displaySchema = donutProgressSchema.properties.props.properties.display;
      const pieDisplaySchema = displaySchema.properties.pie;
      expect(pieDisplaySchema).toBeDefined();
      expect(pieDisplaySchema.properties.innerRadiusRatio).toBeDefined();
      expect(pieDisplaySchema.properties.gapPercentage).toBeDefined();
      expect(pieDisplaySchema.properties.startAngle).toBeDefined();
    });

    it('应该正确配置内径比例范围', () => {
      const displaySchema = donutProgressSchema.properties.props.properties.display;
      const innerRadiusSchema = displaySchema.properties.pie.properties.innerRadiusRatio;
      expect(innerRadiusSchema.type).toBe('number');
      expect(innerRadiusSchema.minimum).toBe(0);
      expect(innerRadiusSchema.maximum).toBe(0.99);
      expect(innerRadiusSchema.default).toBe(0.7);
    });
  });

  describe('Sample Configuration Validation', () => {
    it('bar-progress sample 应该符合 schema 定义', () => {
      // 验证基本结构
      expect(barProgressSample.data).toBeDefined();
      expect(barProgressSample.pipe).toBe('key_value');
      expect(barProgressSample.props.type).toBe('bar-progress');
      
      // 验证数据格式
      expect(Array.isArray(barProgressSample.data)).toBe(true);
      expect(barProgressSample.data.length).toBe(1);
      expect(Array.isArray(barProgressSample.data[0])).toBe(true);
      expect(barProgressSample.data[0].length).toBe(2); // header + data row
      
      // 验证map配置
      expect(barProgressSample.props.map).toBeDefined();
      expect(barProgressSample.props.map.length).toBe(2);
      expect(barProgressSample.props.map[1].type).toBe('bar');
    });

    it('donut-progress sample 应该符合 schema 定义', () => {
      // 验证基本结构
      expect(donutProgressSample.data).toBeDefined();
      expect(donutProgressSample.pipe).toBe('key_value');
      expect(donutProgressSample.props.type).toBe('donut-progress');
      
      // 验证数据格式
      expect(Array.isArray(donutProgressSample.data)).toBeDefined();
      expect(donutProgressSample.data.length).toBe(1);
      expect(Array.isArray(donutProgressSample.data[0])).toBe(true);
      expect(donutProgressSample.data[0].length).toBe(2); // header + data row
      
      // 验证map配置
      expect(donutProgressSample.props.map).toBeDefined();
      expect(donutProgressSample.props.map.length).toBe(2);
      expect(donutProgressSample.props.map[1].type).toBe('pie');
      
      // 验证display配置
      expect(donutProgressSample.props.display.pie).toBeDefined();
      expect(donutProgressSample.props.display.pie.innerRadiusRatio).toBe(0.65);
    });
  });

  describe('Data Format Validation', () => {
    it('应该验证 progress charts 的数据格式要求', () => {
      // Progress charts 都使用 key_value 管道和 [名称, 数值] 格式
      expect(barProgressSample.pipe).toBe('key_value');
      expect(donutProgressSample.pipe).toBe('key_value');
      
      // 验证数据结构：[[header], [data]]
      const barData = barProgressSample.data[0];
      const donutData = donutProgressSample.data[0];
      
      // Header
      expect(barData[0]).toEqual(['名称', '进度']);
      expect(donutData[0]).toEqual(['名称', '进度']);
      
      // Data row
      expect(barData[1]).toEqual(['开发进度', 70]);
      expect(donutData[1]).toEqual(['开发进度', 70]);
    });

    it('应该验证 fill 配置的单色限制', () => {
      // Progress charts 只支持单色填充
      expect(barProgressSample.props.fill.controlType).toBe('single');
      expect(donutProgressSample.props.fill.controlType).toBe('single');
      
      expect(barProgressSample.props.fill.props.length).toBe(1);
      expect(donutProgressSample.props.fill.props.length).toBe(1);
    });
  });

  describe('Common Schema Integration', () => {
    it('应该正确集成 common schema 的定义', () => {
      // 验证标题配置结构
      const barTitleSchema = barProgressSchema.properties.props.properties.title;
      const donutTitleSchema = donutProgressSchema.properties.props.properties.title;
      
      expect(barTitleSchema).toBeDefined();
      expect(donutTitleSchema).toBeDefined();
      
      // 验证背景配置结构
      const barBgSchema = barProgressSchema.properties.props.properties.background;
      const donutBgSchema = donutProgressSchema.properties.props.properties.background;
      
      expect(barBgSchema).toBeDefined();
      expect(donutBgSchema).toBeDefined();
    });

    it('应该包含标准的图表配置项', () => {
      const standardProps = ['legend', 'label', 'numberFormat', 'animation', 'tooltip', 'padding'];
      
      standardProps.forEach(prop => {
        expect(barProgressSchema.properties.props.properties[prop]).toBeDefined();
        expect(donutProgressSchema.properties.props.properties[prop]).toBeDefined();
      });
    });
  });

  describe('Schema Consistency', () => {
    it('两个 progress schema 应该有一致的基础结构', () => {
      const barPropsKeys = Object.keys(barProgressSchema.properties.props.properties);
      const donutPropsKeys = Object.keys(donutProgressSchema.properties.props.properties);
      
      // 除了display配置可能不同，其他属性应该基本一致
      const commonProps = barPropsKeys.filter(key => key !== 'display');
      commonProps.forEach(prop => {
        expect(donutPropsKeys).toContain(prop);
      });
    });

    it('应该都支持相同的数据管道类型', () => {
      expect(barProgressSchema.properties.pipe.default).toBe('key_value');
      expect(donutProgressSchema.properties.pipe.default).toBe('key_value');
    });
  });
}); 