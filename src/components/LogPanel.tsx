
import { SceneTimeRange } from '@grafana/scenes';
import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';
import { TooltipDisplayMode, LineInterpolation } from '@grafana/ui';
const myTimeSeriesPanel = PanelBuilders.table().setTitle('my log panel');
myTimeSeriesPanel.setDecimals(2).setUnit('ms');
// myTimeSeriesPanel.setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth);

const data = new SceneQueryRunner({
    datasource: {
        type: 'mysql',
        uid: 'doris',
    },
    queries: [
        {
            refId: 'A',
    //         rawSql: `
    //     SELECT *
    //     FROM otel.otel_traces
    //     WHERE timestamp >= $__timeFrom() AND timestamp <= $__timeTo()
    //     ORDER BY timestamp DESC 
    //     LIMIT 100
    //   `,
            rawSql:'SELECT * FROM otel.otel_logs LIMIT 100',
            format: 'table',
        },
    ],
    $timeRange: new SceneTimeRange({ from: 'now-55m', to: 'now' }),
});

myTimeSeriesPanel.setData(data);
// traceField.config.links!.push({
//       title: 'View traceaa',
//       targetBlank: true,
//       url: '',
//       internal: {
//         query: traceIdQuery,
//         datasourceUid: traceIdQuery.datasource?.uid!,
//         datasourceName: traceIdQuery.datasource?.type!,
//         panelsState: {
//           trace: {
//             spanId: '${__value.raw}'
//           }
//         }
//       }
//     });
// myTimeSeriesPanel.setOption('legend', { asTable: true }).setOption('tooltip', { mode: TooltipDisplayMode.Single });
// myTimeSeriesPanel.setOverrides((builder) =>
//     builder
//         .matchFieldsWithName('trace_id')
//         .overrideLinks([
//             {
//                 title: 'View Trace',
//                 url: '/a/apache-doris-app/one?trace_id=9bc80e8c0d3765891d629ffb25948a6c',
//                 // 设置internal会跳转到 explore
//                 // internal:{
//                 //     datasourceName:'mysql',
//                 //     datasourceUid:'doris',
//                 //     query:'9bc80e8c0d3765891d629ffb25948a6c'
//                 // },
//                 targetBlank: false,
//             },
//         ])

// )
const logPanel = myTimeSeriesPanel.build();

export { logPanel };