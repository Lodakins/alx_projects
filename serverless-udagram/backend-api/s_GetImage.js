
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'lodakins',
  applicationName: 'serverless-udagram',
  appUid: 'B2TGcd1Z1y6Dzz45x7',
  orgUid: '5bf01ca2-5642-4079-969a-b40c834dc93e',
  deploymentUid: 'd7519c97-f58f-4800-833a-480f582e063e',
  serviceName: 'serverless-udagram',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '6.2.2',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'serverless-udagram-dev-GetImage', timeout: 6 };

try {
  const userHandler = require('./src/functions/getImage/handler.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}