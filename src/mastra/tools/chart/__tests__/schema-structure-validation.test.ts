import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

describe('Schema Structure Validation', () => {
  let barProgressRawSchema: any;
  let donutProgressRawSchema: any;
  let commonSchema: any;

  beforeAll(async () => {
    const schemasDir = path.join(__dirname, '../schemas');
    
    // 加载原始schema文件
    const barProgressPath = path.join(schemasDir, 'bar-progress.schema.json');
    const donutProgressPath = path.join(schemasDir, 'donut-progress.schema.json');
    const commonPath = path.join(schemasDir, 'common.schema.json');
    
    barProgressRawSchema = JSON.parse(await fs.readFile(barProgressPath, 'utf-8'));
    donutProgressRawSchema = JSON.parse(await fs.readFile(donutProgressPath, 'utf-8'));
    commonSchema = JSON.parse(await fs.readFile(commonPath, 'utf-8'));
  });

  describe('Schema File Format Validation', () => {
    it('bar-progress.schema.json 应该有正确的 JSON Schema 元数据', () => {
      expect(barProgressRawSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(barProgressRawSchema.$id).toBe('https://example.com/schemas/barProgressChartSchema.json');
      expect(barProgressRawSchema.title).toBe('Bar Progress Chart Configuration');
      expect(barProgressRawSchema.description).toBe('Schema for configuring a bar progress chart.');
      expect(barProgressRawSchema.type).toBe('object');
    });

    it('donut-progress.schema.json 应该有正确的 JSON Schema 元数据', () => {
      expect(donutProgressRawSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(donutProgressRawSchema.$id).toBe('https://example.com/schemas/donutProgressChartSchema.json');
      expect(donutProgressRawSchema.title).toBe('Donut Progress Chart Configuration');
      expect(donutProgressRawSchema.description).toBe('Schema for configuring a donut progress chart.');
      expect(donutProgressRawSchema.type).toBe('object');
    });
  });

  describe('Common Schema References', () => {
    it('应该正确引用 common schema 定义', () => {
      // 检查是否使用了 commonChartDefinitions.json 引用
      const schemaString = JSON.stringify(barProgressRawSchema);
      expect(schemaString).toContain('commonChartDefinitions.json#/definitions/');
      
      const donutSchemaString = JSON.stringify(donutProgressRawSchema);
      expect(donutSchemaString).toContain('commonChartDefinitions.json#/definitions/');
    });

    it('应该包含标准的图表配置引用', () => {
      const expectedRefs = [
        'chartDataArray',
        'titleConfig',
        'backgroundConfig',
        'colorOption',
        'simpleColor'
      ];
      
      const barSchemaString = JSON.stringify(barProgressRawSchema);
      const donutSchemaString = JSON.stringify(donutProgressRawSchema);
      
      expectedRefs.forEach(ref => {
        expect(barSchemaString).toContain(ref);
        expect(donutSchemaString).toContain(ref);
      });
    });
  });

  describe('Data Schema Validation', () => {
    it('应该正确定义数据引用', () => {
      expect(barProgressRawSchema.properties.data.$ref).toBe('commonChartDefinitions.json#/definitions/chartDataArray');
      expect(donutProgressRawSchema.properties.data.$ref).toBe('commonChartDefinitions.json#/definitions/chartDataArray');
    });

    it('应该正确配置 pipe 属性', () => {
      expect(barProgressRawSchema.properties.pipe.type).toBe('string');
      expect(barProgressRawSchema.properties.pipe.default).toBe('key_value');
      expect(donutProgressRawSchema.properties.pipe.type).toBe('string');
      expect(donutProgressRawSchema.properties.pipe.default).toBe('key_value');
    });
  });

  describe('Chart Type Validation', () => {
    it('应该正确定义图表类型常量', () => {
      const barType = barProgressRawSchema.properties.props.properties.type;
      expect(barType.type).toBe('string');
      expect(barType.const).toBe('bar-progress');
      
      const donutType = donutProgressRawSchema.properties.props.properties.type;
      expect(donutType.type).toBe('string');
      expect(donutType.const).toBe('donut-progress');
    });
  });

  describe('Map Configuration Validation', () => {
    it('应该正确配置 map 数组约束', () => {
      const barMapSchema = barProgressRawSchema.properties.props.properties.map;
      expect(barMapSchema.type).toBe('array');
      expect(barMapSchema.description).toContain('数据映射配置');
      expect(barMapSchema.minItems).toBe(2);
      expect(barMapSchema.maxItems).toBe(2);
      
      const donutMapSchema = donutProgressRawSchema.properties.props.properties.map;
      expect(donutMapSchema.type).toBe('array');
      expect(donutMapSchema.description).toContain('数据映射配置');
      expect(donutMapSchema.minItems).toBe(2);
      expect(donutMapSchema.maxItems).toBe(2);
    });

    it('应该正确定义 map 项的必需属性', () => {
      const barMapItems = barProgressRawSchema.properties.props.properties.map.items;
      const requiredProps = ['name', 'index', 'isLegend', 'function', 'configurable', 'type'];
      
      expect(barMapItems.required).toEqual(requiredProps);
      
      // 验证type枚举
      expect(barMapItems.properties.type.enum).toEqual(['bar']);
    });
  });

  describe('Fill Configuration Validation', () => {
    it('应该限制为单色填充', () => {
      const barFillSchema = barProgressRawSchema.properties.props.properties.fill;
      expect(barFillSchema.properties.controlType.const).toBe('single');
      expect(barFillSchema.properties.props.minItems).toBe(1);
      expect(barFillSchema.properties.props.maxItems).toBe(1);
      
      const donutFillSchema = donutProgressRawSchema.properties.props.properties.fill;
      expect(donutFillSchema.properties.controlType.const).toBe('single');
      expect(donutFillSchema.properties.props.minItems).toBe(1);
      expect(donutFillSchema.properties.props.maxItems).toBe(1);
    });

    it('应该包含正确的颜色和阴影配置', () => {
      const barFillProps = barProgressRawSchema.properties.props.properties.fill.properties.props.items;
      expect(barFillProps.properties.color.$ref).toBe('commonChartDefinitions.json#/definitions/colorOption');
      expect(barFillProps.properties.shadow).toBeDefined();
      expect(barFillProps.properties.border).toBeDefined();
      
      const donutFillProps = donutProgressRawSchema.properties.props.properties.fill.properties.props.items;
      expect(donutFillProps.properties.color.$ref).toBe('commonChartDefinitions.json#/definitions/colorOption');
      expect(donutFillProps.properties.shadow).toBeDefined();
      expect(donutFillProps.properties.border).toBeDefined();
    });
  });

  describe('Display Configuration Validation', () => {
    it('bar-progress 应该有正确的显示配置', () => {
      const displaySchema = barProgressRawSchema.properties.props.properties.display;
      const pieSchema = displaySchema.properties.pie;
      
      expect(pieSchema.properties.widthPercent).toBeDefined();
      expect(pieSchema.properties.widthPercent.type).toBe('number');
      expect(pieSchema.properties.widthPercent.minimum).toBe(0.01);
      expect(pieSchema.properties.widthPercent.maximum).toBe(1);
      expect(pieSchema.properties.backgroundColor).toBeDefined();
    });

    it('donut-progress 应该有正确的显示配置', () => {
      const displaySchema = donutProgressRawSchema.properties.props.properties.display;
      const pieSchema = displaySchema.properties.pie;
      
      expect(pieSchema.properties.innerRadiusRatio).toBeDefined();
      expect(pieSchema.properties.innerRadiusRatio.type).toBe('number');
      expect(pieSchema.properties.innerRadiusRatio.minimum).toBe(0);
      expect(pieSchema.properties.innerRadiusRatio.maximum).toBe(0.99);
      expect(pieSchema.properties.gapPercentage).toBeDefined();
      expect(pieSchema.properties.startAngle).toBeDefined();
    });
  });

  describe('Shadow Configuration Validation', () => {
    it('应该有适合 progress charts 的阴影默认值', () => {
      const barShadow = barProgressRawSchema.properties.props.properties.fill.properties.props.items.properties.shadow;
      expect(barShadow.properties.blur.default).toBe(2);
      expect(barShadow.properties.color.default.opacity).toBe(0.1);
      expect(barShadow.properties.radius.default).toBe(1);
      
      const donutShadow = donutProgressRawSchema.properties.props.properties.fill.properties.props.items.properties.shadow;
      expect(donutShadow.properties.blur.default).toBe(3);
      expect(donutShadow.properties.color.default.opacity).toBe(0.2);
      expect(donutShadow.properties.radius.default).toBe(2);
    });
  });

  describe('Schema Documentation Quality', () => {
    it('应该有充分的中文描述', () => {
      // 检查重要字段是否有中文描述
      const barMapDescription = barProgressRawSchema.properties.props.properties.map.description;
      expect(barMapDescription).toContain('数据映射配置');
      
      const donutDisplayDescription = donutProgressRawSchema.properties.props.properties.display.description;
      expect(donutDisplayDescription).toContain('显示配置');
    });

    it('应该有适当的示例和默认值', () => {
      const barWidthPercent = barProgressRawSchema.properties.props.properties.display.properties.pie.properties.widthPercent;
      expect(barWidthPercent.default).toBe(1);
      
      const donutInnerRadius = donutProgressRawSchema.properties.props.properties.display.properties.pie.properties.innerRadiusRatio;
      expect(donutInnerRadius.default).toBe(0.7);
    });
  });

  describe('Schema Completeness', () => {
    it('应该包含所有必需的顶层属性', () => {
      const barRequiredProps = ['data', 'pipe', 'props'];
      barRequiredProps.forEach(prop => {
        expect(barProgressRawSchema.properties[prop]).toBeDefined();
      });
      
      const donutRequiredProps = ['data', 'pipe', 'props'];
      donutRequiredProps.forEach(prop => {
        expect(donutProgressRawSchema.properties[prop]).toBeDefined();
      });
    });

    it('应该包含所有标准图表配置', () => {
      const standardProps = ['title', 'background', 'map', 'fill', 'display', 'legend', 'label'];
      
      standardProps.forEach(prop => {
        expect(barProgressRawSchema.properties.props.properties[prop]).toBeDefined();
        expect(donutProgressRawSchema.properties.props.properties[prop]).toBeDefined();
      });
    });
  });
}); 