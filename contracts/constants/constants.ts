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
]

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
}
export default constants
