let queryTop10Today =
  'SELECT TOP (10) [Nome] as name, num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT COUNT([SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) FROM [SIGIS].[dbo].[vac_regIndividual]'
queryTop10Today +=
  'WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )  AND CONVERT(date, DataCad) = CONVERT(date, GETDATE()) )'
queryTop10Today +=
  " FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R') parceiros where num_registos > 0 order by num_registos desc"

let todayTotal =
  "SELECT COUNT([SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) as total FROM [SIGIS].[dbo].[vac_regInstituicao] INNER JOIN [SIGIS].[dbo].[vac_regIndividual] ON ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]) where TipoInst = 'R' AND CONVERT(date, [SIGIS].[dbo].[vac_regIndividual].DataCad) = CONVERT(date, GETDATE())"

let queryTop10General =
  ' SELECT  TOP(10) [Nome] as name, num_registos as records FROM ( SELECT [Nome], num_registos = (  SELECT COUNT( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao])) '
queryTop10General +=
  "FROM [SIGIS].[dbo].[vac_regInstituicao]  where  TipoInst = 'R'  )  parceiros where num_registos > 0 order by num_registos desc"

let generalTotal =
  "SELECT COUNT( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) as total FROM [SIGIS].[dbo].[vac_regInstituicao] INNER JOIN [SIGIS].[dbo].[vac_regIndividual] ON ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]) where TipoInst = 'R'"

let weekQuery =
  'SELECT [Nome] as name , num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT  COUNT([SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )'
weekQuery +=
  "AND datepart(ww, CONVERT(date, DataCad)) = datepart(ww, getdate()) AND datepart(yy, CONVERT(date, DataCad)) = datepart(yy, getdate()) ) FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R' ) parceiros where num_registos > 0 order by num_registos desc"

let month =
  'SELECT [Nome] as name, num_registos as records FROM (  SELECT [Nome],num_registos = ( SELECT COUNT([SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao])  FROM [SIGIS].[dbo].[vac_regIndividual] WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao] )'
month +=
  "AND datepart(mm, CONVERT(date, DataCad)) = datepart(mm, getdate())  AND datepart(yy, CONVERT(date, DataCad)) = datepart(yy, getdate()) )  FROM  [SIGIS].[dbo].[vac_regInstituicao]  where  TipoInst = 'R' ) parceiros where num_registos > 0 order by num_registos desc"

let overtimeGeneral =
  'SELECT [Nome] as name,num_registos as records FROM ( SELECT [Nome], num_registos = ( SELECT COUNT([SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao]) FROM [SIGIS].[dbo].[vac_regIndividual]'
overtimeGeneral +=
  "  WHERE ( [SIGIS].[dbo].[vac_regIndividual].[Id_regInstituicao] = [SIGIS].[dbo].[vac_regInstituicao].[Id_regInstituicao]  )  )  FROM  [SIGIS].[dbo].[vac_regInstituicao] where      TipoInst = 'R' ) parceiros where  num_registos > 0 order by  num_registos desc"

let isTrustPartner =
  "SELECT TOP (1) [Id_regInstituicao], [Nome], [Morada], [Telefone]  [Email], [NomeR], [docNum] , [TelefoneR], [EmailR],[Codigo], [Status], [DataCad], [TipoInst] FROM [SIGIS].[dbo].[vac_regInstituicao] where TipoInst = 'R' and Codigo = ?"

let vaccinationPostLocation =
  "SELECT TOP (1000) [Id_postoVacinacao], concat([NomePVAR], ' ', [NomeEA], ' ', [NomeEM]) as Posto, [TipoPosto], [Latitude], [Longitude], [Status] FROM [SIGIS].[dbo].[vac_postoVacinacao]"

let vaccinationPlaces =
  "SELECT [Id_regVacinacaoLog],  rv.[Id_regVacinacao], [Mac_address], rvl.[Latitude],  rvl.[Longitude],  [Tipo],  rv.Id_Vacina,  CASE  WHEN [Tipo] = 'P' AND d.Nome = 'Dose Única' THEN 'Dose Única' WHEN [Tipo] = 'P' THEN '1ª Dose' WHEN [Tipo] = 'S' THEN '2ª Dose'"
vaccinationPlaces +=
  "WHEN [Tipo] = 'R' THEN 'Reforço' ELSE d.Nome END AS Dose_Administrada, v.Nome as Vacina FROM [SIGIS].[dbo].[vac_regVacinacaoLog] rvl Join [SIGIS].[dbo].[vac_regVacinacao] rv on (rvl.[Id_regVacinacao] = rv.[Id_regVacinacao])  inner Join [SIGIS].[dbo].[vac_Vacina] v on(v.Id_Vacina = rv.Id_Vacina)  inner join vac_DoseVacina d on(rv.Id_Dose = d.Id_DoseVacina)"

const trustNetworkQueries = {
  queryTop10Today,
  queryTop10General,
  todayTotal,
  generalTotal,
  weekQuery,
  month,
  overtimeGeneral,
  isTrustPartner,
  vaccinationPostLocation,
  vaccinationPlaces,
}

export default trustNetworkQueries
