import React, { useEffect } from 'react';
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
} from '@grafana/data';
import { config, createQueryRunner, getDataSourceSrv } from '@grafana/runtime';


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
      { name: 'time', type: FieldType.time, values: [1716952800000, 1716956400000], spanId: '333', config: {} },
      { name: 'value', type: FieldType.number, values: [10, 20], spanId: '222', config: {} },
      { name: 'test', type: FieldType.string, values: ['aaa', 'bbb'], spanId: '111', config: {} },
      { name: 'trace_id', type: FieldType.string, values: ['cfad56cab4ca79863696842162bb1cac', 'bbb'], spanId: '444', config: {} },
      // { traceID: 'cfad56cab4ca79863696842162bb1cac' }
    ],
    spanId: '333',
    length: 3
  }),
];

const queryRunner = createQueryRunner();

const mockTimeRange: TimeRange = {
  from: new Date(1716952800000), // 2024-05-29T00:00:00Z
  to: new Date(1716956400000),   // 2024-05-29T01:00:00Z
  raw: {
    from: 'now-1h',
    to: 'now',
  },
};

const subscription = queryRunner.get().subscribe({
  next: (data: PanelData) => {
    console.log('🚀 查询结果: ', data);
  },
  error: (err) => {
    console.error('❌ 查询错误: ', err);
  },
});

const mockPanelData: PanelData = {
  state: LoadingState.Done,
  series: mockSeries,
  timeRange: mockTimeRange,
  structureRev: 1,
  // traceIds: ['cfad56cab4ca79863696842162bb1cac'],
};

const traceDataFrame: DataFrame = {
  name: "Trace ID",
  refId: "Trace ID",
  fields: [
    {
      name: 'traceID',
      type: FieldType.string,
      values: ['177fa211fd63c795890538ddb59f2499', '177fa211fd63c795890538ddb59f2499', '177fa211fd63c795890538ddb59f2499', '177fa211fd63c795890538ddb59f2499'],
      config: {}
    },
    {
      name: 'spanID',
      type: FieldType.string,
      values: ['a64394d05c73cbe6', '71e714eaed8b2f36', '241589f5b59a77cd', '4a9660138ff79f5b'],
      config: {}
    },
    {
      name: 'parentSpanID',
      type: FieldType.string,
      values: ['', 'a64394d05c73cbe6', '71e714eaed8b2f36', '241589f5b59a77cd'],
      config: {}
    },
    {
      name: 'operationName',
      type: FieldType.string,
      values: ['HTTP GET', 'ingress', 'router image-provider egress', 'image-provider'],
      config: {}
    },
    {
      name: 'serviceName',
      type: FieldType.string,
      values: ['frontend-web', 'frontend-proxy', 'frontend-proxy', 'image-provider'],
      config: {}
    },
    {
      name: 'serviceTags',
      type: FieldType.other,
      values: [
        [
          { key: "process.runtime.description", value: "Web Browser" },
          { key: "process.runtime.name", value: "browser" },
          { key: "process.runtime.version", value: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/133.0.0.0 Safari/537.36" },
          { key: "service.name", value: "frontend-web" },
          { key: "telemetry.sdk.language", value: "webjs" },
          { key: "telemetry.sdk.name", value: "opentelemetry" },
          { key: "telemetry.sdk.version", value: "1.30.1" }
        ],
        [
          { key: "docker.cli.cobra.command_path", value: "docker compose" },
          { key: "service.name", value: "frontend-proxy" }
        ],
        [
          { key: "docker.cli.cobra.command_path", value: "docker compose" },
          { key: "service.name", value: "frontend-proxy" }
        ],
        [
          { key: "service.name", value: "image-provider" }
        ]
      ],
      config: {}
    },
    {
      name: 'startTime',
      type: FieldType.number,
      values: [1748767774018, 1748767774030.335, 1748767774030.437, 1748767774030],
      config: {}
    },
    {
      name: 'duration',
      type: FieldType.number,
      values: [22, 0.634, 0.519, 0],
      config: {}
    },
    {
      name: 'tags',
      type: FieldType.other,
      values: [
        [
          { key: "app.synthetic_request", value: "true" },
          { key: "component", value: "fetch" },
          { key: "http.host", value: "frontend-proxy:8080" },
          { key: "http.method", value: "GET" },
          { key: "http.response_content_length", value: "22201" },
          { key: "http.scheme", value: "http" },
          { key: "http.status_code", value: "200" },
          { key: "http.status_text", value: "OK" },
          { key: "http.url", value: "http://frontend-proxy:8080/images/products/OpticalTubeAssembly.jpg" },
          { key: "http.user_agent", value: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/133.0.0.0 Safari/537.36" },
          { key: "session.id", value: "4108a782-de7e-4b69-a051-ff93295dbfe0" }
        ],
        [
          { key: "component", value: "proxy" },
          { key: "downstream_cluster", value: "-" },
          { key: "guid:x-request-id", value: "1d2c6dfa-fe50-9cf1-af59-c7efb28f3c66" },
          { key: "http.method", value: "GET" },
          { key: "http.protocol", value: "HTTP/1.1" },
          { key: "http.status_code", value: "200" },
          { key: "http.url", value: "http://frontend-proxy:8080/images/products/OpticalTubeAssembly.jpg" },
          { key: "node_id", value: "" },
          { key: "peer.address", value: "172.18.0.25" },
          { key: "request_size", value: "0" },
          { key: "response_flags", value: "-" },
          { key: "response_size", value: "22201" },
          { key: "upstream_cluster", value: "image-provider" },
          { key: "upstream_cluster.name", value: "image-provider" },
          { key: "user_agent", value: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/133.0.0.0 Safari/537.36" },
          { key: "zone", value: "" }
        ],
        [
          { key: "component", value: "proxy" },
          { key: "http.protocol", value: "HTTP/1.1" },
          { key: "http.status_code", value: "200" },
          { key: "peer.address", value: "172.18.0.15:8081" },
          { key: "response_flags", value: "-" },
          { key: "upstream_address", value: "172.18.0.15:8081" },
          { key: "upstream_cluster", value: "image-provider" },
          { key: "upstream_cluster.name", value: "image-provider" }
        ],
        [
          { key: "http.flavor", value: "1.1" },
          { key: "http.method", value: "GET" },
          { key: "http.request_content_length", value: "0" },
          { key: "http.response_content_length", value: "22201" },
          { key: "http.scheme", value: "http" },
          { key: "http.status_code", value: "200" },
          { key: "http.target", value: "/products/OpticalTubeAssembly.jpg" },
          { key: "http.user_agent", value: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/133.0.0.0 Safari/537.36" },
          { key: "net.host.name", value: "_" },
          { key: "net.host.port", value: "8081" },
          { key: "net.sock.peer.addr", value: "172.18.0.26" },
          { key: "net.sock.peer.port", value: "33878" }
        ]
      ]
      ,
      config: {}
    },
    {
      name: 'kind',
      type: FieldType.string,
      values: ['SPAN_KIND_CLIENT', 'SPAN_KIND_SERVER', 'SPAN_KIND_CLIENT', 'SPAN_KIND_SERVER'],
      config: {}
    },
    {
      name: 'statusCode',
      type: FieldType.number,
      values: [0, 0, 0, 0],
      config: {}
    },
    {
      name: 'statusMessage',
      type: FieldType.string,
      values: ["", "", "", "", ""],
      config: {}
    },
    {
      name: 'instrumentationLibraryName',
      type: FieldType.string,
      values: ['@opentelemetry/instrumentation-fetch', '', '', 'nginx'],
      config: {}
    },
    {
      name: 'instrumentationLibraryVersion',
      type: FieldType.string,
      values: ['0.57.1', '', '', '1.27.0'],
      config: {}
    },
    {
      name: 'traceState',
      type: FieldType.string,
      values: ["", "", "", ""],
      config: {}
    },
    // {
    //   name: 'rootServiceName',
    //   type: FieldType.string,
    //   values: ['checkout-service'],
    //   config: {}
    // },
    // {
    //   name: 'duration',
    //   type: FieldType.number,
    //   values: [130000], // microseconds
    //   config: {}
    // },
    // {
    //   name: 'startTime',
    //   type: FieldType.time,
    //   values: [Date.now() - 130000],
    //   config: {}
    // },
    // {
    //   name: 'serviceName',
    //   type: FieldType.string,
    //   values: ['checkout-service'],
    //   config: {}
    // },
    // {
    //   name: 'spanName',
    //   type: FieldType.string,
    //   values: ['HTTP GET /api/checkout'],
    //   config: {}
    // },
    // {
    //   name: 'tags',
    //   type: FieldType.other,
    //   config: {},
    //   values: [
    //     {
    //       httpStatusCode: 200,
    //       method: 'GET',
    //     },
    //   ],
    // },
  ],
  length: 1
};


const data: PanelData = {
  state: LoadingState.Done, // 数据加载完毕
  series: [traceDataFrame],
  timeRange: {
    from: new Date(Date.now() - 15 * 60 * 1000), // 15 分钟前
    to: new Date(),
    raw: {
      from: 'now-15m',
      to: 'now',
    },
  },
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
        fieldConfig={{
          defaults: {},
          overrides: [
            {
              matcher: { id: 'byName', options: 'trace_id' },
              properties: [
                {
                  id: 'links',
                  value: [
                    {
                      title: 'trace详情',
                      url: '/a/apache-doris-app/one/${__value.raw}',
                      targetBlank: false
                    }
                  ]
                }
              ]
            }
          ]
        }}
      />
    </div>
  );
};
function PageOne() {
  const s = useStyles2(getStyles);

  useEffect(() => {
    console.log('config', config.panels);
    runQuery()
  }, [])
  const runQuery = async () => {
    const datasources = getDataSourceSrv().getList().filter((item) => item.name === 'Doris');
    const ds = await getDataSourceSrv().get(datasources[0].name); // 名称来自 data source 配置页面
    queryRunner.run({
      datasource: ds,
      queries: [
        {
          queryType: 'table',
          refId: 'A',
          rawSql: 'SELECT * FROM otel.otel_logs LIMIT 10',
          format: "table",
        }
      ],
      timezone: datasources[0].jsonData.timezone,
      timeRange: {
        from: new Date(Date.now() - 60 * 60 * 1000), // 过去一小时
        to: new Date(),
        raw: {
          from: 'now-1h',
          to: 'now',
        },
      },
      maxDataPoints: 50,
      minInterval: '200',
    })
    const res = queryRunner.get()
    // const res = await ds.query()
    // const res = await ds.query(query).toPromise();
    // console.log('Query Result:', res);
  };
  return (
    <PluginPage>
      <div data-testid={testIds.pageOne.container}>
        This is page one.
        <div className='w-[200px] h-[200px] bg-red'>aa</div>
        {/* <EmbeddedPanel width={500} height={500} pluginId='traces' /> */}
        <EmbeddedPanel width={500} height={500} pluginId='table' />
        {/* <EmbeddedPanel width={500} height={500} pluginId='timeseries' /> */}
        {/* <TraceViewContainer  dataFrames={mockSeries} exploreId='left' timeRange={mockTimeRange} /> */}
        bbb
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
