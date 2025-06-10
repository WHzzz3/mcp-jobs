import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';

describe('Stacked Charts Structure Validation', () => {
  let stackedColumnRawSchema: any;
  let stackedBarRawSchema: any;
  let stackedAreaRawSchema: any;
  let commonSchema: any;

  beforeAll(async () => {
    const schemasDir = path.join(__dirname, '../schemas');
    
    // 加载原始schema文件
    const stackedColumnPath = path.join(schemasDir, 'stacked-column.schema.json');
    const stackedBarPath = path.join(schemasDir, 'stacked-bar.schema.json');
    const stackedAreaPath = path.join(schemasDir, 'stacked-area.schema.json');
    const commonPath = path.join(schemasDir, 'common.schema.json');
    
    stackedColumnRawSchema = JSON.parse(await fs.readFile(stackedColumnPath, 'utf-8'));
    stackedBarRawSchema = JSON.parse(await fs.readFile(stackedBarPath, 'utf-8'));
    stackedAreaRawSchema = JSON.parse(await fs.readFile(stackedAreaPath, 'utf-8'));
    commonSchema = JSON.parse(await fs.readFile(commonPath, 'utf-8'));
  });

  describe('JSON Schema Metadata', () => {
    it('所有堆叠图表schema应该有正确的JSON Schema元数据', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
        expect(schema.$id).toBeDefined();
        expect(schema.title).toBeDefined();
        expect(schema.description).toBeDefined();
        expect(schema.type).toBe('object');
      });
    });

    it('应该有唯一的schema ID', () => {
      const ids = [stackedColumnRawSchema.$id, stackedBarRawSchema.$id, stackedAreaRawSchema.$id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('schema标题应该反映图表类型', () => {
      expect(stackedColumnRawSchema.title).toContain('Stacked Column');
      expect(stackedBarRawSchema.title).toContain('Stacked Bar');
      expect(stackedAreaRawSchema.title).toContain('Stacked Area');
    });
  });

  describe('Common Schema References', () => {
    it('应该正确引用common schema定义', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const dataRef = schema.properties.data.$ref;
        expect(dataRef).toBe('commonChartDefinitions.json#/definitions/chartDataArray');
        
        const titleRef = schema.properties.props.properties.title.$ref;
        expect(titleRef).toBe('commonChartDefinitions.json#/definitions/titleConfig');
        
        const backgroundRef = schema.properties.props.properties.background.$ref;
        expect(backgroundRef).toBe('commonChartDefinitions.json#/definitions/backgroundConfig');
        
        const legendRef = schema.properties.props.properties.legend.$ref;
        expect(legendRef).toBe('commonChartDefinitions.json#/definitions/legendConfig');
      });
    });

    it('应该有一致的引用格式', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const refs = JSON.stringify(schema).match(/"\$ref":\s*"[^"]+"/g) || [];
        refs.forEach(ref => {
          expect(ref).toMatch(/"\$ref":\s*"commonChartDefinitions\.json#\/definitions\/\w+"/);
        });
      });
    });
  });

  describe('Chart Type Configuration', () => {
    it('应该有正确的图表类型常量', () => {
      expect(stackedColumnRawSchema.properties.props.properties.type.const).toBe('stacked-column');
      expect(stackedBarRawSchema.properties.props.properties.type.const).toBe('stacked-bar');
      expect(stackedAreaRawSchema.properties.props.properties.type.const).toBe('stacked-area');
    });

    it('应该有正确的管道配置', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        expect(schema.properties.pipe.type).toBe('string');
        expect(schema.properties.pipe.default).toBe('cross');
        expect(schema.properties.pipe.description).toContain('数据处理方式');
      });
    });
  });

  describe('Map Configuration', () => {
    it('应该有完整的数据映射配置', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const mapConfig = schema.properties.props.properties.map;
        expect(mapConfig.type).toBe('array');
        expect(mapConfig.description).toContain('数据映射配置');
        expect(mapConfig.items).toBeDefined();
        expect(mapConfig.items.properties).toBeDefined();
        
        const itemProps = mapConfig.items.properties;
        expect(itemProps.name).toBeDefined();
        expect(itemProps.index).toBeDefined();
        expect(itemProps.isLegend).toBeDefined();
        expect(itemProps.function).toBeDefined();
        expect(itemProps.configurable).toBeDefined();
        expect(itemProps.type).toBeDefined();
      });
    });

    it('应该有正确的元素类型枚举', () => {
      const columnMapType = stackedColumnRawSchema.properties.props.properties.map.items.properties.type;
      expect(columnMapType.enum).toContain('bar');
      
      const barMapType = stackedBarRawSchema.properties.props.properties.map.items.properties.type;
      expect(barMapType.enum).toContain('bar');
      
      const areaMapType = stackedAreaRawSchema.properties.props.properties.map.items.properties.type;
      expect(areaMapType.enum).toContain('area');
    });

    it('应该有必需的字段配置', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const required = schema.properties.props.properties.map.items.required;
        expect(required).toContain('name');
        expect(required).toContain('index');
        expect(required).toContain('isLegend');
        expect(required).toContain('function');
        expect(required).toContain('configurable');
        expect(required).toContain('type');
      });
    });
  });

  describe('Fill Configuration', () => {
    it('应该有多样化的填充控制选项', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const fillConfig = schema.properties.props.properties.fill;
        expect(fillConfig.properties.controlType.enum).toContain('single');
        expect(fillConfig.properties.controlType.enum).toContain('multiple');
        expect(fillConfig.properties.controlType.enum).toContain('gradient');
      });
    });

    it('应该有完整的填充属性配置', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const fillProps = schema.properties.props.properties.fill.properties.props.items.properties;
        expect(fillProps.color).toBeDefined();
        expect(fillProps.shadow).toBeDefined();
        
        // 检查阴影配置
        const shadowProps = fillProps.shadow.properties;
        expect(shadowProps.show).toBeDefined();
        expect(shadowProps.type).toBeDefined();
        expect(shadowProps.angle).toBeDefined();
        expect(shadowProps.blur).toBeDefined();
        expect(shadowProps.color).toBeDefined();
        expect(shadowProps.radius).toBeDefined();
      });
    });
  });

  describe('Display Configuration', () => {
    it('堆叠柱状图和条形图应该有bar显示配置', () => {
      [stackedColumnRawSchema, stackedBarRawSchema].forEach(schema => {
        const display = schema.properties.props.properties.display.properties;
        expect(display.bar).toBeDefined();
        expect(display.bar.properties.widthPercent).toBeDefined();
      });
    });

    it('堆叠面积图应该有area显示配置', () => {
      const display = stackedAreaRawSchema.properties.props.properties.display.properties;
      expect(display.area).toBeDefined();
      expect(display.area.properties.type).toBeDefined();
      expect(display.area.properties.width).toBeDefined();
      expect(display.area.properties.fillOpacity).toBeDefined();
      expect(display.area.properties.endPoint).toBeDefined();
    });

    it('面积图应该有特定的线条类型选项', () => {
      const areaType = stackedAreaRawSchema.properties.props.properties.display.properties.area.properties.type;
      expect(areaType.enum).toContain('straight');
      expect(areaType.enum).toContain('curve');
      expect(areaType.default).toBe('straight');
    });
  });

  describe('Documentation Quality', () => {
    it('应该有描述信息', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        expect(schema.description).toBeDefined();
        expect(schema.description.length).toBeGreaterThan(0);
        expect(schema.properties.pipe.description).toMatch(/[\u4e00-\u9fa5]/); // 管道描述应该有中文
        expect(schema.properties.props.description).toMatch(/[\u4e00-\u9fa5]/); // 属性描述应该有中文
      });
    });

    it('应该有合理的默认值', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        expect(schema.properties.pipe.default).toBeDefined();
        
        // 检查填充配置的默认值
        const shadowDefaults = schema.properties.props.properties.fill.properties.props.items.properties.shadow.properties;
        expect(shadowDefaults.show.default).toBe(false);
        expect(shadowDefaults.type.default).toBeDefined();
        expect(shadowDefaults.angle.default).toBeDefined();
        expect(shadowDefaults.blur.default).toBeDefined();
      });
    });
  });

  describe('Schema Constraints', () => {
    it('应该有适当的数值约束', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const shadowProps = schema.properties.props.properties.fill.properties.props.items.properties.shadow.properties;
        
        // 角度约束
        expect(shadowProps.angle.minimum).toBe(0);
        expect(shadowProps.angle.maximum).toBe(360);
        
        // 模糊约束
        expect(shadowProps.blur.minimum).toBe(0);
        expect(shadowProps.blur.maximum).toBe(100);
        
        // 半径约束
        expect(shadowProps.radius.minimum).toBe(0);
        expect(shadowProps.radius.maximum).toBe(100);
      });
    });

    it('面积图应该有正确的透明度约束', () => {
      const fillOpacity = stackedAreaRawSchema.properties.props.properties.display.properties.area.properties.fillOpacity;
      expect(fillOpacity.minimum).toBe(0);
      expect(fillOpacity.maximum).toBe(1);
      expect(fillOpacity.default).toBe(0.7);
    });
  });

  describe('Schema Completeness', () => {
    it('应该包含所有必要的根级属性', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        expect(schema.properties.data).toBeDefined();
        expect(schema.properties.pipe).toBeDefined();
        expect(schema.properties.props).toBeDefined();
      });
    });

    it('props配置应该包含所有核心组件', () => {
      [stackedColumnRawSchema, stackedBarRawSchema, stackedAreaRawSchema].forEach(schema => {
        const props = schema.properties.props.properties;
        expect(props.type).toBeDefined();
        expect(props.title).toBeDefined();
        expect(props.background).toBeDefined();
        expect(props.map).toBeDefined();
        expect(props.fill).toBeDefined();
        expect(props.display).toBeDefined();
        expect(props.legend).toBeDefined();
      });
    });
  });
}); 