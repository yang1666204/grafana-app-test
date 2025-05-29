import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { LinkButton, useStyles2 } from '@grafana/ui';
import { prefixRoute } from '../utils/utils.routing';
import { ROUTES } from '../constants';
import { testIds } from '../components/testIds';
import { PluginPage } from '@grafana/runtime';
import { PanelRenderer, PanelRendererProps } from '@grafana/runtime';
import type { TimeRange } from '@grafana/data';
import {
  PanelData,
  LoadingState,
  DataFrame,
  toDataFrame,
  FieldType,
  TraceSpanRow,
  TraceLog
} from '@grafana/data';
import { PanelBuilders } from '@grafana/scenes';
import { SceneQueryRunner } from '@grafana/scenes';
import { SceneTimeRange,EmbeddedScene,SceneFlexLayout ,SceneFlexItem} from '@grafana/scenes';
import { TooltipDisplayMode,LineInterpolation } from '@grafana/ui';

const myTimeSeriesPanel = PanelBuilders.timeseries().setTitle('My first panel');
myTimeSeriesPanel.setDecimals(2).setUnit('ms');
myTimeSeriesPanel.setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth);

const data = new SceneQueryRunner({
  datasource: {
    type: 'prometheus',
    uid: '<PROVIDE_GRAFANA_DS_UID>',
  },
  queries: [
    {
      refId: 'A',
      expr: 'rate(prometheus_http_requests_total{}[5m])',
    },
  ],
  $timeRange: new SceneTimeRange({ from: 'now-5m', to: 'now' }),
});

myTimeSeriesPanel.setData(data);

myTimeSeriesPanel.setOption('legend', { asTable: true }).setOption('tooltip', { mode: TooltipDisplayMode.Single });
myTimeSeriesPanel.setOverrides((b) =>
  b.matchFieldsWithNameByRegex('/metrics/').overrideDecimals(4).overrideCustomFieldConfig('lineWidth', 5)
);
const myPanel = myTimeSeriesPanel.build();
const scene = new EmbeddedScene({
  body: new SceneFlexLayout({
    children: [
      new SceneFlexItem({
        body: myPanel,
      }),
    ],
  }),
});



interface Props {
  width: number;
  height: number;
  panelData?: PanelRendererProps['data'];
  pluginId: string; // 使用内置的日志或追踪面板
  options?: Record<string, any>; // 面板配置
}

const mockSeries: DataFrame[] = [
  toDataFrame({
    name: 'Series A',
    fields: [
      { name: 'time', type: FieldType.time, values: [1716952800000, 1716956400000] },
      { name: 'value', type: FieldType.number, values: [10, 20] },
       { name: 'test', type: FieldType.string, values: ['aaa','bbb'] },
    ],
  }),
];

const mockTimeRange: TimeRange = {
  from: new Date(1716952800000), // 2024-05-29T00:00:00Z
  to: new Date(1716956400000),   // 2024-05-29T01:00:00Z
  raw: {
    from: 'now-1h',
    to: 'now',
  },
};

const mockPanelData: PanelData = {
  state: LoadingState.Done,
  series: mockSeries,
  timeRange: mockTimeRange,
  structureRev: 1,
};


const EmbeddedPanel: React.FC<Props> = ({ width, height, panelData, pluginId, options }) => {
  return (
    <div style={{ width, height }}>
      <PanelRenderer
        title='test'
        pluginId={pluginId}
        options={options || {}}
        data={mockPanelData}
        width={width}
        height={height}
      />
    </div>
  );
};
function PageOne() {
  const s = useStyles2(getStyles);

  return (
    <PluginPage>
      <div data-testid={testIds.pageOne.container}>
        This is page one.
        <scene.Component model={scene} />
        <EmbeddedPanel width={500} height={500} pluginId='logs' />
        <EmbeddedPanel width={500} height={500} pluginId='timeseries' />
      </div>
    </PluginPage>
  );
}

export default PageOne;

const getStyles = (theme: GrafanaTheme2) => ({
  marginTop: css`
    margin-top: ${theme.spacing(2)};
  `,
});
