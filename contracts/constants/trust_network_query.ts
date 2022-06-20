let queryTop10Today =
  'SELECT TOP (10) [Nome] as name, num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT COUNT(*) FROM [SIGIS].[dbo].[vac_regIndividual]'
queryTop10Today +=
  'WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )  AND CONVERT(date, DataCad) = CONVERT(date, GETDATE()) )'
queryTop10Today +=
  " FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R') parceiros where num_registos > 0 order by num_registos desc"

let todayTotal =
  "SELECT COUNT(*) as total FROM [SIGIS].[dbo].[vac_regInstituicao] INNER JOIN [SIGIS].[dbo].[vac_regIndividual] ON ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]) where TipoInst = 'R' AND CONVERT(date, [SIGIS].[dbo].[vac_regIndividual].DataCad) = CONVERT(date, GETDATE())"

let queryTop10General =
  ' SELECT  TOP(10) [Nome] as name, num_registos as records FROM ( SELECT [Nome], num_registos = (  SELECT COUNT(*) FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao])) '
queryTop10General +=
  "FROM [SIGIS].[dbo].[vac_regInstituicao]  where  TipoInst = 'R'  )  parceiros where num_registos > 0 order by num_registos desc"

let generalTotal =
  "SELECT COUNT(*) as total FROM [SIGIS].[dbo].[vac_regInstituicao] INNER JOIN [SIGIS].[dbo].[vac_regIndividual] ON ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]) where TipoInst = 'R'"

let weekQuery =
  'SELECT [Nome] as name , num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT  COUNT(*) FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )'
weekQuery +=
  "AND datepart(ww, CONVERT(date, DataCad)) = datepart(ww, getdate()) AND datepart(yy, CONVERT(date, DataCad)) = datepart(yy, getdate()) ) FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R' ) parceiros where num_registos > 0 order by num_registos desc"

let month =
  'SELECT [Nome] as name, num_registos as records FROM (  SELECT [Nome],num_registos = ( SELECT COUNT(*)  FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )'
month +=
  "AND datepart(mm, CONVERT(date, DataCad)) = datepart(mm, getdate())  AND datepart(yy, CONVERT(date, DataCad)) = datepart(yy, getdate()) )  FROM  [SIGIS].[dbo].[vac_regInstituicao]  where  TipoInst = 'R' ) parceiros where num_registos > 0 order by num_registos desc"

let overtimeGeneral =
  'SELECT [Nome] as name,num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT COUNT(*) FROM [SIGIS].[dbo].[vac_regIndividual]'
overtimeGeneral +=
  "  WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]  )  )  FROM  [SIGIS].[dbo].[vac_regInstituicao] where      TipoInst = 'R' ) parceiros where  num_registos > 0 order by  num_registos desc"

let isTrustPartner =
  "SELECT TOP (1) [Id_regInstituicao], [Nome], [Morada], [Telefone]  [Email], [NomeR], [docNum] , [TelefoneR], [EmailR],[Codigo], [Status], [DataCad], [TipoInst] FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R' and Codigo = ?"

const trustNetworkQueries = {
  queryTop10Today,
  queryTop10General,
  todayTotal,
  generalTotal,
  weekQuery,
  month,
  overtimeGeneral,
  isTrustPartner,
}

export default trustNetworkQueries
