import { Button, Popover } from 'antd';
import { defaultTheme, ensureLightBackground, themePresets, type ThemeSettings } from '../theme';

interface ThemePickerProps {
  value: ThemeSettings;
  onChange: (theme: ThemeSettings) => void;
}

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  const content = (
    <div className="theme-panel">
      <div className="theme-panel-heading">
        <strong>页面主题</strong>
        <Button type="link" size="small" onClick={() => onChange(defaultTheme)}>恢复默认</Button>
      </div>
      <div className="theme-presets" role="list" aria-label="主题预设">
        {themePresets.map((preset) => (
          <button
            className={value.preset === preset.preset ? 'active' : ''}
            type="button"
            aria-pressed={value.preset === preset.preset}
            onClick={() => onChange(preset)}
            key={preset.preset}
          >
            <span className="theme-preset-swatches" aria-hidden="true">
              <i style={{ background: preset.background }} />
              <i style={{ background: preset.accent }} />
            </span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
      <div className="theme-custom-colors">
        <label>
          <span>浅色背景</span>
          <input
            type="color"
            value={value.background}
            onChange={(event) => onChange({ ...value, preset: 'custom', background: ensureLightBackground(event.target.value) })}
          />
        </label>
        <label>
          <span>强调色</span>
          <input
            type="color"
            value={value.accent}
            onChange={(event) => onChange({ ...value, preset: 'custom', accent: event.target.value })}
          />
        </label>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button className="theme-trigger" aria-label="调整页面主题">
        <span className="theme-trigger-swatch" style={{ background: value.background }} aria-hidden="true">
          <i style={{ background: value.accent }} />
        </span>
        <span className="theme-trigger-label">主题</span>
      </Button>
    </Popover>
  );
}
