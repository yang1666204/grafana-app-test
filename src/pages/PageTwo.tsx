import React, { useEffect } from 'react';
import { testIds } from '../components/testIds';
import { getBackendSrv } from '@grafana/runtime';
import { PluginPage,getDataSourceSrv } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

async function getMyCustomEndpoint() {
  // const response = getBackendSrv().fetch({
  //   url: '/api/plugins/apache-doris-app/resources/ping',
  // });
  // const res = await lastValueFrom(response);
  // return res;
  const datasources = getDataSourceSrv().getList().filter((item) => item.name === 'Doris');
  const ds = await getDataSourceSrv().get(datasources[0].name); // 名称来自 data source 配置页面
  console.log('ds',ds);
  
  const res = getBackendSrv().fetch({
    url: `/api/plugins/apache-doris-app/resources/query`,
    method: 'GET',
    params: {
      sql: 'SELECT * FROM users LIMIT 10',
      dsUid: ds.uid,
    },
  });
  console.log('res', res)
  res.subscribe({
    next:(data)=>{
      console.log('查询结果',data);
      
    },
    error:(err)=>{
      console.log('查询错误',err);
      
    }
  })
}


function PageTwo() {

  useEffect(() => {
    getMyCustomEndpoint()
  }, [])

  return (
    <PluginPage>
      <div data-testid={testIds.pageTwo.container}>
        <p>This is page two.</p>
      </div>
    </PluginPage>
  );
}

export default PageTwo;
