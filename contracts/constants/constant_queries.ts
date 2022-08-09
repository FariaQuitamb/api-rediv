//Query for login and logout from activity logs

const vaccinationFields = [
  '[SIGIS].[dbo].[vac_regIndividual].[Nome] as name',
  '[Telefone] as phone',
  '[docNum] as docId',
  '[Codigo] as code',
  '[CodigoNum] as codeNum',
  '[NCartao] as cardNumber',
  '[SIGIS].[dbo].[vac_Vacina].[Nome] as vaccine',
  '[SIGIS].[dbo].[vac_regVacinacao].[DataCad] as createdAt',
  '[SIGIS].[dbo].[vac_regVacinacao].[Status] as vaccinationType',
  '[numLote] as batch',
  '[Fabricante] as manufacturer',

  '[SIGIS].[dbo].[vac_DoseVacina].[Nome] as dose',

  '[SIGIS].[dbo].[Provincia].[Nome] as province',
]

const vaccinationMainTable = ' [SIGIS].[dbo].[vac_regIndividual] '

let vaccinationSources =
  ' join [SIGIS].[dbo].[vac_regVacinacao] on ([SIGIS].[dbo].[vac_regIndividual] .Id_regIndividual = [SIGIS].[dbo].[vac_regVacinacao].[Id_regIndividual] )'
vaccinationSources +=
  ' join   [SIGIS].[dbo].[vac_Vacina]  on ([SIGIS].[dbo].[vac_Vacina].[Id_Vacina] = [dbo].[vac_regVacinacao].Id_Vacina )'
vaccinationSources +=
  ' join   [SIGIS].[dbo].[vac_DoseVacina] on ([SIGIS].[dbo].[vac_DoseVacina].Id_DoseVacina = [dbo].[vac_regVacinacao].Id_Dose )'
vaccinationSources +=
  ' join [SIGIS].[dbo].[Provincia]  on ( [SIGIS].[dbo].[Provincia].[Id_Provincia] = [SIGIS].[dbo].[vac_regVacinacao].[Id_Provincia] )'
vaccinationSources +=
  ' join   [SIGIS].[dbo].[vac_postoVacinacao] on ( [SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao] = [SIGIS].[dbo].[vac_regVacinacao].[Id_postoVacinacao])'

const constantQueries = {
  vaccinationMainTable,
  vaccinationFields,
  vaccinationSources,
}
export default constantQueries
