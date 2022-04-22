let sql = ''
sql = 'Select Top(1) [Id_regVacinacao]'
sql += ',[Id_Dose]'
sql += ',[NumDias]'
sql += ',[PrxDose]'
sql += ',[Id_Vacina]'
sql += ',CONVERT(VARCHAR, DATEADD(day, [NumDias], [DataCad]), 23) AS [DtProxDose]'
sql += ',CONVERT(VARCHAR, [DataCad], 23) As [DataCad]'
sql += ',DATEDIFF(day, DATEADD(day, [NumDias], [DataCad]),  getdate()) AS [NumDiasRestante]'
sql += ',DATEDIFF(day, getdate(), DATEADD(day, [NumDias], [DataCad])) AS [NumDias2]'
sql += ',CONVERT(VARCHAR, GETDATE(), 23) AS [dtHoje] '
sql += 'From ('
sql +=
  'SELECT ROW_NUMBER() OVER(PARTITION BY rv.[Id_Dose] ORDER BY rv.[DataCad] DESC) AS [NumLinha]'
sql += ',rv.[Id_regVacinacao]'
sql += ',rv.[Id_Vacina]'
sql += ',rv.[Id_Dose]'
sql +=
  ",[NumDias] = (Isnull((Select [NumDias] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0))"
sql +=
  ",[PrxDose] = (Isnull((Select [Id_DoseVacina] From [vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] = rv.[Id_Vacina] And [NumOrdem] = (dv.[NumOrdem] + 1)), 0))"
sql += ',rv.[DataCad] '
sql += 'FROM [dbo].[vac_regVacinacao] rv '
sql += 'Inner Join [vac_DoseVacina] dv On dv.[Id_DoseVacina] = rv.[Id_Dose] '
sql += "Where rv.[Status] <> 'R' And rv.[Id_regIndividual] = ?"
sql += ') As Tbl '
sql += 'Order By [DataCad] Desc'

const getFirstDose =
  "SELECT TOP(1) [Nome] , [Id_DoseVacina] , [Id_Vacina] FROM [dbo].[vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] =  ?  Order By [NumOrdem] "

const getVaccineSecondDose =
  "SELECT TOP(1) [Nome] , [Id_DoseVacina] , [Id_Vacina] FROM [dbo].[vac_DoseVacina] Where [Visualizar] = 'S' And [Id_Vacina] =  ?  Order By [NumOrdem] Desc "

const getLoteVaccine =
  "SELECT Top(1) [Id_LoteVacina],[Id_Vacina], [NumLote] FROM [SIGIS].[dbo].[vac_LoteVacina] Where [Visualizar] = 'S' And [Id_Vacina] = ? "

const constants = {
  sqlFirstSecondDose: sql,
  getFirstDose,
  getVaccineSecondDose,
  getLoteVaccine,
}
export default constants
