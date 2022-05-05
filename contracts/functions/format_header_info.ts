const formatHeaderInfo = (headers: any) => {
  const data = {
    imei: `mac:${headers['x-application-latitude']}`,
    latitude: `${headers['x-application-latitude']}`,
    longitude: `${headers['x-application-longitude']}`,
    version: `${headers['x-application-version']}`,
    appName: `${headers['x-application-name']}`,
  }
  return data
}

export default formatHeaderInfo
