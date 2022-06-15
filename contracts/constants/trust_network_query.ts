let queryTop10Today =
  'SELECT TOP (10) [Nome] as name, num_registos as registers FROM ( SELECT [Nome], num_registos = ( SELECT COUNT(*) FROM [SIGIS].[dbo].[vac_regIndividual]'
queryTop10Today +=
  'WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )  AND CONVERT(date, DataCad) = CONVERT(date, GETDATE()) )'
queryTop10Today +=
  " FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R') parceiros where num_registos > 0 order by num_registos desc"

let todayTotal =
  "SELECT COUNT(*) as total FROM [SIGIS].[dbo].[vac_regInstituicao] INNER JOIN [SIGIS].[dbo].[vac_regIndividual] ON ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]) where TipoInst = 'R' AND CONVERT(date, [SIGIS].[dbo].[vac_regIndividual].DataCad) = CONVERT(date, GETDATE())"

const trustNetworkQueries = { queryTop10Today, todayTotal }

export default trustNetworkQueries
