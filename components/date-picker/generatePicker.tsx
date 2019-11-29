import * as React from 'react';
import classNames from 'classnames';
import RCPicker, { RangePicker as RCRangePicker } from 'rc-picker';
import { GenerateConfig } from 'rc-picker/lib/generate/index';
import {
  PickerBaseProps as RCPickerBaseProps,
  PickerDateProps as RCPickerDateProps,
  PickerTimeProps as RCPickerTimeProps,
} from 'rc-picker/lib/Picker';
import { SharedTimeProps } from 'rc-picker/lib/panels/TimePanel';
import {
  RangePickerBaseProps as RCRangePickerBaseProps,
  RangePickerDateProps as RCRangePickerDateProps,
  RangePickerTimeProps as RCRangePickerTimeProps,
} from 'rc-picker/lib/RangePicker';
import { PickerMode } from 'rc-picker/lib/interface';
import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  CloseCircleFilled,
} from '@ant-design/icons';
import { ConfigContext, ConfigConsumerProps } from '../config-provider';
import defaultLocale from './locale/en_US';

function toArray<T>(list: T | T[]): T[] {
  if (!list) {
    return [];
  }
  return Array.isArray(list) ? list : [list];
}

function getTimeProps<DateType>(
  props: { format?: string; picker?: PickerMode } & SharedTimeProps<DateType>,
) {
  const { format, picker, showHour, showMinute, showSecond, use12Hours } = props;

  const firstFormat = toArray(format)[0];
  const showTimeObj: SharedTimeProps<DateType> = { ...props };

  if (firstFormat) {
    if (!firstFormat.includes('s') && showSecond === undefined) {
      showTimeObj.showSecond = false;
    }
    if (!firstFormat.includes('m') && showMinute === undefined) {
      showTimeObj.showMinute = false;
    }
    if (!firstFormat.includes('H') && !firstFormat.includes('h') && showHour === undefined) {
      showTimeObj.showHour = false;
    }

    if ((firstFormat.includes('a') || firstFormat.includes('A')) && use12Hours === undefined) {
      showTimeObj.use12Hours = true;
    }
  }

  if (picker === 'time') {
    return showTimeObj;
  }

  return {
    showTime: showTimeObj,
  };
}

type InjectDefaultProps<Props> = Omit<
  Props,
  'locale' | 'generateConfig' | 'prevIcon' | 'nextIcon' | 'superPrevIcon' | 'superNextIcon'
> & {
  locale?: typeof defaultLocale;
  size?: 'large' | 'default' | 'small';
};

// Picker Props
export type PickerBaseProps<DateType> = InjectDefaultProps<RCPickerBaseProps<DateType>>;
export type PickerDateProps<DateType> = InjectDefaultProps<RCPickerDateProps<DateType>>;
export type PickerTimeProps<DateType> = InjectDefaultProps<RCPickerTimeProps<DateType>>;

export type PickerProps<DateType> =
  | PickerBaseProps<DateType>
  | PickerDateProps<DateType>
  | PickerTimeProps<DateType>;

// Range Picker Props
export type RangePickerBaseProps<DateType> = InjectDefaultProps<RCRangePickerBaseProps<DateType>>;
export type RangePickerDateProps<DateType> = InjectDefaultProps<RCRangePickerDateProps<DateType>>;
export type RangePickerTimeProps<DateType> = InjectDefaultProps<RCRangePickerTimeProps<DateType>>;

export type RangePickerProps<DateType> =
  | RangePickerBaseProps<DateType>
  | RangePickerDateProps<DateType>
  | RangePickerTimeProps<DateType>;

function generatePicker<DateType>(generateConfig: GenerateConfig<DateType>) {
  // =========================== Picker ===========================
  type DatePickerProps = PickerProps<DateType>;

  function getPicker<InnerPickerProps extends DatePickerProps>(
    picker?: PickerMode,
    displayName?: string,
  ) {
    class Picker extends React.Component<InnerPickerProps> {
      static contextType = ConfigContext;

      static displayName: string;

      context: ConfigConsumerProps;

      pickerRef = React.createRef<RCPicker<DateType>>();

      focus = () => {
        if (this.pickerRef.current) {
          this.pickerRef.current.focus();
        }
      };

      blur = () => {
        if (this.pickerRef.current) {
          this.pickerRef.current.blur();
        }
      };

      render() {
        const { getPrefixCls } = this.context;
        const { prefixCls: customizePrefixCls, className, size, locale, ...restProps } = this.props;
        const { format, showTime } = this.props as any;
        const prefixCls = getPrefixCls('picker', customizePrefixCls);

        const mergedLocale = locale || defaultLocale;

        const additionalProps = {
          showToday: true,
        };

        let additionalOverrideProps: any = {};
        if (picker) {
          additionalOverrideProps.picker = picker;
        }
        const mergedPicker = picker || this.props.picker;

        additionalOverrideProps = {
          ...additionalOverrideProps,
          ...(showTime ? getTimeProps({ format, picker: mergedPicker, ...showTime }) : {}),
          ...(mergedPicker === 'time'
            ? getTimeProps({ format, ...this.props, picker: mergedPicker })
            : {}),
        };

        return (
          <RCPicker<DateType>
            ref={this.pickerRef}
            locale={mergedLocale!.lang}
            placeholder={mergedLocale!.lang.placeholder}
            suffixIcon={<CalendarOutlined />}
            clearIcon={<CloseCircleFilled />}
            allowClear
            transitionName="slide-up"
            {...additionalProps}
            {...restProps}
            {...additionalOverrideProps}
            className={classNames(className, {
              [`${prefixCls}-${size}`]: size,
            })}
            prefixCls={prefixCls}
            generateConfig={generateConfig}
            prevIcon={<LeftOutlined />}
            nextIcon={<RightOutlined />}
            superPrevIcon={<DoubleLeftOutlined />}
            superNextIcon={<DoubleRightOutlined />}
          />
        );
      }
    }

    if (displayName) {
      Picker.displayName = displayName;
    }

    return Picker;
  }

  const DatePicker = getPicker<DatePickerProps>();
  const WeekPicker = getPicker<Omit<PickerDateProps<DateType>, 'picker'>>('week', 'WeekPicker');
  const MonthPicker = getPicker<Omit<PickerDateProps<DateType>, 'picker'>>('month', 'MonthPicker');
  const YearPicker = getPicker<Omit<PickerDateProps<DateType>, 'picker'>>('year', 'YearPicker');

  // ======================== Range Picker ========================
  class RangePicker extends React.Component<RangePickerProps<DateType>> {
    static contextType = ConfigContext;

    context: ConfigConsumerProps;

    pickerRef = React.createRef<RCRangePicker<DateType>>();

    focus = () => {
      if (this.pickerRef.current) {
        this.pickerRef.current.focus();
      }
    };

    blur = () => {
      if (this.pickerRef.current) {
        this.pickerRef.current.blur();
      }
    };

    render() {
      const { getPrefixCls } = this.context;
      const { prefixCls: customizePrefixCls, locale, className, size, ...restProps } = this.props;
      const { format, showTime, picker } = this.props as any;
      const prefixCls = getPrefixCls('picker', customizePrefixCls);

      const mergedLocale = locale || defaultLocale;

      let additionalOverrideProps: any = {};

      additionalOverrideProps = {
        ...additionalOverrideProps,
        ...(showTime ? getTimeProps({ format, picker, ...showTime }) : {}),
        ...(picker === 'time' ? getTimeProps({ format, ...this.props, picker }) : {}),
      };

      return (
        <RCRangePicker<DateType>
          separator={<span className={`${prefixCls}-separator`}>~</span>}
          ref={this.pickerRef}
          locale={mergedLocale!.lang}
          placeholder={mergedLocale!.lang.rangePlaceholder as [string, string]}
          suffixIcon={<CalendarOutlined />}
          clearIcon={<CloseCircleFilled />}
          allowClear
          transitionName="slide-up"
          {...restProps}
          className={classNames(className, {
            [`${prefixCls}-${size}`]: size,
          })}
          {...additionalOverrideProps}
          prefixCls={prefixCls}
          generateConfig={generateConfig}
          prevIcon={<LeftOutlined />}
          nextIcon={<RightOutlined />}
          superPrevIcon={<DoubleLeftOutlined />}
          superNextIcon={<DoubleRightOutlined />}
        />
      );
    }
  }

  // =========================== Export ===========================
  type MergedDatePicker = typeof DatePicker & {
    WeekPicker: typeof WeekPicker;
    MonthPicker: typeof MonthPicker;
    YearPicker: typeof YearPicker;
    RangePicker: typeof RangePicker;
  };

  const MergedDatePicker = DatePicker as MergedDatePicker;
  MergedDatePicker.WeekPicker = WeekPicker;
  MergedDatePicker.MonthPicker = MonthPicker;
  MergedDatePicker.YearPicker = YearPicker;
  MergedDatePicker.RangePicker = RangePicker;

  return MergedDatePicker;
}

export default generatePicker;
