//Consulta usada para verificar vacinação do utente na inserçao de primeira dose e segunda
let sqlFirstSecondDoses = ''
sqlFirstSecondDoses = 'Select Top(1) [Id_regVacinacao]'
sqlFirstSecondDoses += ',[Id_Dose]'
sqlFirstSecondDoses += ',[NumDias]'
sqlFirstSecondDoses += ',[PrxDose]'
sqlFirstSecondDoses += ',[Id_Vacina]'
sqlFirstSecondDoses += ',CONVERT(VARCHAR, DATEADD(day, [NumDias], [DataCad]), 23) AS [DtProxDose]'
sqlFirstSecondDoses += ',CONVERT(VARCHAR, [DataCad], 23) As [DataCad]'
sqlFirstSecondDoses +=
  ',DATEDIFF(day, DATEADD(day, [NumDias], [DataCad]),  getdate()) AS [NumDiasRestante]'
sqlFirstSecondDoses += ',DATEDIFF(day, getdate(), DATEADD(day, [NumDias], [DataCad])) AS [NumDias2]'
sqlFirstSecondDoses += ',CONVERT(VARCHAR, GETDATE(), 23) AS [dtHoje] '
sqlFirstSecondDoses += 'From ('
sqlFirstSecondDoses +=
  'SELECT ROW_NUMBER() OVER(PARTITION BY rv.[Id_Dose] ORDER BY rv.[DataCad] DESC) AS [NumLinha]'
sqlFirstSecondDoses += ',rv.[Id_regVacinacao]'
sqlFirstSecondDoses += ',rv.[Id_Vacina]'
sqlFirstSecondDoses += ',rv.[Id_Dose]'
sqlFirstSecondDoses +=
  ",[NumDias] = (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0))"
sqlFirstSecondDoses +=
  ",[PrxDose] = (Isnull((Select [Id_DoseVacina] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0))"
sqlFirstSecondDoses += ',rv.[DataCad] '
sqlFirstSecondDoses += 'FROM [dbo].[vac_regVacinacao] rv '
sqlFirstSecondDoses += 'Inner Join [vac_DoseVacina] dv On dv.[Id_DoseVacina] = rv.[Id_Dose] '
sqlFirstSecondDoses += "Where rv.[Status] <> 'R' And rv.[Id_regIndividual] = ?"
sqlFirstSecondDoses += ') As Tbl '
sqlFirstSecondDoses += 'Order By [DataCad] Desc'

const getFirstDose =
  "SELECT TOP(1) [Nome] , [Id_DoseVacina] , [Id_Vacina] FROM [dbo].[vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] =  ?  Order By [NumOrdem] "

const getVaccineSecondDose =
  "SELECT TOP(1) [Nome] , [Id_DoseVacina] , [Id_Vacina] FROM [dbo].[vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] =  ?  Order By [NumOrdem] Desc "

const getLoteVaccine =
  "SELECT Top(1) [Id_LoteVacina],[Id_Vacina], [NumLote] FROM [SIGIS].[dbo].[vac_LoteVacina] Where [Visualizar] = 'S' And [Id_Vacina] = ? "

const getNumDoses =
  " SELECT TOP(1) [NumDoseVac] = (SELECT COUNT([Id_DoseVacina]) FROM [dbo].[vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina]),[NumVac] = (SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao] Where [Status] NOT IN ('R', 'V') And [Id_regIndividual] = rv.[Id_regIndividual]) FROM [dbo].[vac_regVacinacao] rv Where rv.[Status] NOT IN ('R', 'V') And rv.[Id_regIndividual] = ?"

//Consulta usada para verificar próxima vacina em dose de reforço
let sqlBooster = 'Select Top(1) [Id_regVacinacao]'
sqlBooster += ',[Id_Dose]'
sqlBooster += ',[NumDias]'
sqlBooster += ',[PrxDose]'
sqlBooster += ',[Id_Vacina]'
sqlBooster += ',CONVERT(VARCHAR, DATEADD(day, [NumDias], [DataCad]), 23) AS [DtProxDose]'
sqlBooster += ',CONVERT(VARCHAR, [DataCad], 23) As [DataCad]'
sqlBooster += ',DATEDIFF(day, DATEADD(day, [NumDias], [DataCad]), getdate()) AS [NumDiasRestante]'
sqlBooster += ',DATEDIFF(day, getdate(), DATEADD(day, [NumDias], [DataCad])) AS [NumDias2]'
sqlBooster += ',CONVERT(VARCHAR, GETDATE(), 23) AS [dtHoje] '
sqlBooster += 'From ('
sqlBooster +=
  'SELECT ROW_NUMBER() OVER(PARTITION BY rv.[Id_Dose] ORDER BY rv.[DataCad] DESC) AS [NumLinha]'
sqlBooster += ',rv.[Id_regVacinacao]'
sqlBooster += ',rv.[Id_Vacina]'
sqlBooster += ',rv.[Id_Dose]'
sqlBooster +=
  ",CASE WHEN dv.[NumOrdem] = 2 THEN (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (1)), 0)) ELSE (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0)) END AS [NumDias]"
sqlBooster +=
  ",CASE WHEN dv.[NumOrdem] = 2 THEN (Isnull((Select [Id_DoseVacina] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (1)), 0)) ELSE (Isnull((Select [Id_DoseVacina] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0)) END AS [PrxDose]"
sqlBooster += ',rv.[DataCad] '
sqlBooster += 'FROM [dbo].[vac_regVacinacao] rv '
sqlBooster += 'Inner Join [vac_DoseVacina] dv On dv.[Id_DoseVacina] = rv.[Id_Dose] '
sqlBooster += "Where rv.[Status] = 'R' And rv.[Id_regIndividual] = ? "
sqlBooster += ') As Tbl '
sqlBooster += 'Order By [DataCad] Desc'

const getNumDiasBooster =
  "Select Top(1) DATEDIFF(day, DATEADD(day, [NumDias], [DataCad]), getdate()) AS [Dado] From (SELECT CASE WHEN dv.[NumOrdem] = 2 THEN (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (1)), 0)) ELSE (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0)) END AS [NumDias],rv.[DataCad] FROM [dbo].[vac_regVacinacao] rv Inner Join [vac_DoseVacina] dv On dv.[Id_DoseVacina] = rv.[Id_Dose] Where rv.[Status] <> 'R' And rv.[Id_regIndividual] = ? ) As Tbl Order By [DataCad] Desc"

const getPeopleQuery =
  'SELECT TOP (1000) [Id_regIndividual] ,[Nome] ,[Codigo],[Documento],[Telefone],[docNum],[dtNascimento],[DataCad],[Id_Municipio],[recVac],[TotVac] FROM [SIGIS].[dbo].[vw_ListaVacinados_MB]'

const loginFields = [
  '[Id_userPostoVacinacao] as id',
  '[Posto] as post_name',
  '[Id_postoVacinacao] as vaccination_post_id',
  '[ProvPosto] as post_province',
  '[MunicPosto] as post_municipality',
  '[Id_provPosto] as post_province_id ',
  '[Id_MunicPosto] as post_municipality_id',
  '[Nome] as name',
  '[BI] as doc_number',
  '[Telefone] as phone',
  '[Email] as email',
  '[Endereco] as address',
  '[Id_tipoFuncPostoVac] as user_type_id',
  '[Funcao] as user_role',
  '[Status]  as status',
  '[Flag] as flag',
  '[Utilizador] as username',
  '[Id_regInstituicaoPUS] as reg_institution_pus_id',
]

const searchPeopleFields = [
  '[Id_regIndividual]',
  '[Nome]',
  '[Codigo]',
  '[Documento]',
  '[Telefone]',
  '[docNum]',
  '[dtNascimento]',
  '[DataCad]',
  '[Id_Municipio]',
  '[recVac]',
  '[TotVac]',
  '[CodigoNum]',
  '[Id_Vacina]',
]

//LOGGED USER QUERY

//Logged users fields

let loggedUserFields = [
  '[id] as access_id',
  '[Id_userPostoVacinacao] as user_id',
  '[Nome] as personal_name',
  '[Utilizador] as username',
  '[BI] as national_id',
  '[Telefone] as phone',
  '[Funcao] as role',
  '[SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao] as vaccination_post_id',
  '[Posto] as vaccination_post',
  '[ProvPosto] as province',
  '[MunicPosto] as municipality',
  '[NomeResp] as post_manager_name',
  '[BIResp] as post_manager_national_id',
  '[TelResp] as post_manager_phone',
  '[expires_at] as access_expiration',
  '[created_at] as accessed_at',
  '[mac_address]',
  '[api_version]',
  '[app_version]',
]

//Users query

let mainSource = ' [SIGIS].[dbo].[vw_AcsPostoVac_MB] '

let sources = ' inner join [SIGIS].[dbo].[api_tokens] as access'
sources += ' on ([Id_userPostoVacinacao] = [user_id])'
sources += ' inner join [SIGIS].[dbo].[vac_postoVacinacao]'
sources +=
  ' on([SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao]=[SIGIS].[dbo].[vw_AcsPostoVac_MB].[Id_postoVacinacao])'

//Query for login and logout from activity logs

const userFields = [
  '[ID_Login] as userId',
  '[SIGIS].[dbo].[vac_userPostoVacinacao].[Nome] as personalName',
  '[SIGIS].[dbo].[vac_userPostoVacinacao].[Utilizador] as  username',
  '[BI] as nationalID',
  '[Telefone] as phone',
  '[SIGIS].[dbo].[vac_tipoFuncPostoVac].[Nome] as role',
  '[NomeEM] AS postName',
  '[TipoPosto] as postType',
  '[NomeResp] as postManagerName',
  '[BIResp] as postManagerNationalId',
  '[TelResp] as postManagerPhone',
  '[SIGIS].[dbo].[Provincia].[Nome]  as province',
  '[SIGIS].[dbo].[Municipio].[Nome] as municipality',
  '[Data] as date',
]

const mainTable = '[SIGIS].[dbo].[LogVAC]'
let userJoinQuery =
  ' join   [SIGIS].[dbo].[vac_userPostoVacinacao]  on ([SIGIS].[dbo].[LogVAC].[ID_Tabela] =  [SIGIS].[dbo].[vac_userPostoVacinacao].[Id_userPostoVacinacao]) '
userJoinQuery +=
  'join   [SIGIS].[dbo].[vac_postoVacinacao]  on ([SIGIS].[dbo].[vac_userPostoVacinacao].[Id_postoVacinacao] = [SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao]) '
userJoinQuery +=
  ' join  [SIGIS].[dbo].[vac_tipoFuncPostoVac]  on ([SIGIS].[dbo].[vac_tipoFuncPostoVac].[Id_tipoFuncPostoVac] = [SIGIS].[dbo].[vac_userPostoVacinacao].[Id_tipoFuncPostoVac]) '
userJoinQuery +=
  'join [SIGIS].[dbo].[Provincia]  on ( [SIGIS].[dbo].[Provincia].[Id_provincia]=[SIGIS].[dbo].[vac_postoVacinacao].[Id_provinciaEM]  )'
userJoinQuery +=
  ' join [SIGIS].[dbo].[Municipio] on ([SIGIS].[dbo].[Municipio].[Id_Municipio]=[SIGIS].[dbo].[vac_postoVacinacao].[Id_MunicipioEM] )'

//Ranking query

const rankingQueryNational =
  ' SELECT TOP(?)  tbl.[Id_userPostoVacinacao],tbl.[NOME] as name, tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio], [total] = ( SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao] where [Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]    ORDER BY total DESC'

const rankingQueryProvince =
  ' SELECT TOP(?)  tbl.[Id_userPostoVacinacao],tbl.[NOME] as name, tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio], [total] = ( SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao] where [Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]  where [Id_provincia] = ?   ORDER BY total DESC'

const rankingQueryMunicipality =
  ' SELECT TOP(?)  tbl.[Id_userPostoVacinacao],tbl.[NOME] as name, tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio], [total] = ( SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao] where [Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]  where [Id_Municipio] = ?   ORDER BY total DESC'

let provinceRank =
  ' SELECT tbl.[Id_provincia] as province_id, tbl.[Nome] as province, tbl.total FROM ( SELECT  [Id_Provincia],[Nome],[Sigla],[total] = ( SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao] vac where vac.Id_Provincia  = prov.Id_Provincia )'
provinceRank += ' FROM [SIGIS].[dbo].[Provincia] prov) AS [tbl] ORDER BY total DESC'

let municipalityRank =
  ' SELECT    [prov].[Nome] as province,[tbl].[municipality_id], [tbl].[municipality], [tbl].total FROM (  SELECT  [mun].[Id_Provincia] as province_id,[mun].[Id_municipio] as municipality_id , [mun].[Nome] as municipality, [total] = ( SELECT COUNT([Id_regVacinacao]) FROM [dbo].[vac_regVacinacao]  vac  Join vac_userPostoVacinacao up on   vac.[Id_userPostoVacinacao] = up.[Id_userPostoVacinacao]   where   up.[Id_Municipio] =  mun.Id_Municipio )'
municipalityRank +=
  ' FROM [SIGIS].[dbo].[Municipio] mun ) AS [tbl]  join [Provincia] prov ON (tbl.province_id = prov.Id_Provincia)  ORDER BY total DESC'

//Treatment Ranks

let treatmentNationalRank =
  'SELECT TOP(?) tbl.[Id_userPostoVacinacao],tbl.[NOME] as name,tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio],  [total] = ( SELECT COUNT( [Id_vacTratamento]) FROM [SIGIS].[dbo].[vac_vacTratamento] t where t.[Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) '
treatmentNationalRank += 'FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]   ORDER BY total DESC'

let treatmentProvinceRank =
  'SELECT TOP(?) tbl.[Id_userPostoVacinacao],tbl.[NOME] as name,tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio],  [total] = ( SELECT COUNT( [Id_vacTratamento]) FROM [SIGIS].[dbo].[vac_vacTratamento] t where t.[Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) '
treatmentProvinceRank +=
  'FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]  where [Id_provincia] = ?   ORDER BY total DESC'

let treatmentMunicipalityRank =
  'SELECT TOP(?) tbl.[Id_userPostoVacinacao],tbl.[NOME] as name,tbl.[Id_provincia] as province_id, tbl.[Id_Municipio] as municipality_id, total  FROM ( SELECT up.[Id_userPostoVacinacao], up.[Nome], up.[Id_provincia], [Id_Municipio],  [total] = ( SELECT COUNT( [Id_vacTratamento]) FROM [SIGIS].[dbo].[vac_vacTratamento] t where t.[Id_userPostoVacinacao] = up.[Id_userPostoVacinacao] ) '
treatmentMunicipalityRank +=
  'FROM [dbo].[vac_userPostoVacinacao] up ) AS [tbl]  where [Id_Municipio] = ?    ORDER BY total DESC'

const constants = {
  sqlFirstSecondDose: sqlFirstSecondDoses,
  getFirstDose,
  getVaccineSecondDose,
  getLoteVaccine,
  getNumDoses,
  sqlBooster,
  getNumDiasBooster,
  getPeopleQuery,
  loginFields,
  searchPeopleFields,
  loggedUserFields,
  sources,
  mainSource,
  rankingQueryNational,
  rankingQueryProvince,
  rankingQueryMunicipality,
  userFields,
  userJoinQuery,
  mainTable,
  //Locations Rank
  provinceRank,
  municipalityRank,
  //Ranking  for treatment
  treatmentNationalRank,
  treatmentProvinceRank,
  treatmentMunicipalityRank,
}
export default constants
