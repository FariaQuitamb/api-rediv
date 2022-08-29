//Query for login and logout from activity logs

const vaccinationFields = [
  '[SIGIS].[dbo].[vac_regIndividual] .[Id_regIndividual] as personId',
  '[SIGIS].[dbo].[vac_regIndividual].[Nome] as name',
  '[SIGIS].[dbo].[vac_regIndividual]. [DataCad] as registeredAt',
  '[Genero] as genre',
  '[Telefone] as phone',
  '[docNum] as docId',
  '[Codigo] as code',
  '[CodigoNum] as codeNum',
  '[NCartao] as cardNumber',
  '[SIGIS].[dbo].[vac_Vacina].[Nome] as vaccine',
  '[SIGIS].[dbo].[vac_regVacinacao].[DataCad] as createdAt',
  '[SIGIS].[dbo].[vac_regVacinacao]. [Id_regVacinacao] as vaccinationId',
  '[SIGIS].[dbo].[vac_regVacinacao].[Status] as vaccinationType',
  '[numLote] as batch',
  '[Fabricante] as manufacturer',
  '[SIGIS].[dbo].[vac_DoseVacina].[Nome] as dose',
  '[SIGIS].[dbo].[Provincia].[Nome] as province',
  '[NomePVAR] as namePVAR',
  '[NomeEA] as nameEA',
  '[NomeEM] as nameEM',
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

const treatmentsFields = [
  '[SIGIS].[dbo].[vac_regIndividual] .[Id_regIndividual] as personId',
  '[SIGIS].[dbo].[vac_vacTratamento].[Id_vacTratamento] as treatmentId',
  '[SIGIS].[dbo].[vac_regIndividual].[Nome] as name',
  '[SIGIS].[dbo].[vac_regIndividual]. [DataCad] as registeredAt',
  '[Genero] as genre',
  '[Telefone] as phone',
  '[docNum] as docId',
  '[Codigo] as code',
  '[CodigoNum] as codeNum',
  '[NCartao] as cardNumber',
  '[SIGIS].[dbo].[vac_vacTratamento].[DataCad]  as createdAt',
  '[SIGIS].[dbo].[vac_tratVacina].[Nome] as vaccine',
  '[SIGIS].[dbo].[vac_tratDose].Nome as dose',
  '[NomePVAR] as namePVAR',
  '[NomeEA] as nameEA',
  '[NomeEM] as nameEM',
  '[SIGIS].[dbo].[Provincia].Nome as province',
  '[Id_CampTratVac] as campaignId',
]

const treatmentMainTable = '  [SIGIS].[dbo].[vac_regIndividual] '

let treatmentSources =
  'join [SIGIS].[dbo].[vac_vacTratamento] on ( [SIGIS].[dbo].[vac_regIndividual].[Id_regIndividual] =  [SIGIS].[dbo].[vac_vacTratamento].[Id_regIndividual] )'
treatmentSources +=
  'join [SIGIS].[dbo].[vac_Tratamento] on ([SIGIS].[dbo].[vac_Tratamento].Id_Tratamento = [SIGIS].[dbo].[vac_vacTratamento].Id_Tratamento )'

treatmentSources +=
  ' join [SIGIS].[dbo].[vac_tratVacina] on ([SIGIS].[dbo].[vac_tratVacina].[Id_tratVacina] =  [SIGIS].[dbo].[vac_Tratamento].Id_tratVacina)'
treatmentSources +=
  ' join  [SIGIS].[dbo].[vac_tratDose] on ( [SIGIS].[dbo].[vac_tratDose].Id_tratDose=  [SIGIS].[dbo].[vac_vacTratamento].Id_tratDose)'
treatmentSources +=
  ' join   [SIGIS].[dbo].[vac_postoVacinacao] on ( [SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao] = [SIGIS].[dbo].[vac_vacTratamento].[Id_postoVacinacao]) '
treatmentSources += ' join [SIGIS].[dbo].[Provincia] '
treatmentSources +=
  " on ( [SIGIS].[dbo].[Provincia].[Id_Provincia] =    CASE WHEN   [TipoPosto] = 'PVAR' THEN  [Id_provinciaPVAR] WHEN  [TipoPosto] = 'EA'  THEN    [Id_provinciaEA]  ELSE [Id_provinciaEM] END   )"

let treatmentNotifications =
  ' SELECT  [SIGIS].[dbo].[vac_regVacNotificacao].[Id_vacTratamento] as  appliedTreatmentId ,[SIGIS].[dbo].[vac_regVacNotificacao].[Id_regIndividual] as personId, [Id_Sintomas] as symptoms,'
treatmentNotifications +=
  '[SIGIS].[dbo].[vac_regVacNotificacao].[Id_userPostoVacinacao] as userId ,[SIGIS].[dbo].[vac_regVacNotificacao].[DataCad] as createdAt,'
treatmentNotifications +=
  ' [SIGIS].[dbo].[vac_tratVacina].[Nome] as vaccine,[vac_tratDose].[Nome] as dose, [SIGIS].[dbo].[vac_userPostoVacinacao].[Nome] as createdBy '

treatmentNotifications +=
  'FROM  [SIGIS].[dbo].[vac_regVacNotificacao] JOIN  [SIGIS].[dbo].[vac_vacTratamento]  ON ([SIGIS].[dbo].[vac_regVacNotificacao].[Id_vacTratamento] = [SIGIS].[dbo].[vac_vacTratamento].[Id_vacTratamento]  ) '
treatmentNotifications +=
  'join  [SIGIS].[dbo].[vac_Tratamento]  on ( [SIGIS].[dbo].[vac_Tratamento] .[Id_Tratamento] = [SIGIS].[dbo].[vac_vacTratamento].[Id_Tratamento] ) '

treatmentNotifications +=
  'join  [SIGIS].[dbo].[vac_tratVacina] on ([SIGIS].[dbo].[vac_tratVacina].[Id_tratVacina] =     [SIGIS].[dbo].[vac_Tratamento].[Id_tratVacina]) '
treatmentNotifications +=
  'JOIN [vac_tratDose] ON  ([vac_tratDose].[Id_tratDose] = [SIGIS].[dbo].[vac_vacTratamento].[Id_tratDose] ) '

treatmentNotifications +=
  'join   [SIGIS].[dbo].[vac_userPostoVacinacao]  on  ([SIGIS].[dbo].[vac_regVacNotificacao].[Id_userPostoVacinacao] = [SIGIS].[dbo].[vac_userPostoVacinacao].[Id_userPostoVacinacao] ) '

treatmentNotifications += 'Union All '

treatmentNotifications +=
  'SELECT [SIGIS].[dbo].[vac_regVacNotificacao].[Id_vacTratamento] as  appliedTreatmentId ,[SIGIS].[dbo].[vac_regVacNotificacao].[Id_regIndividual] as personId, [Id_Sintomas] as symptoms,'
treatmentNotifications +=
  '[SIGIS].[dbo].[vac_regVacNotificacao].[Id_userPostoVacinacao] as userId ,[SIGIS].[dbo].[vac_regVacNotificacao].[DataCad] as createdAt, [SIGIS].[dbo].[vac_tratVacina].[Nome] as vaccine,'
treatmentNotifications +=
  '[vac_tratDose].[Nome] as dose,[SIGIS].[dbo].[vac_userPostoVacinacao].[Nome] as createdBy '

treatmentNotifications +=
  ' FROM  [SIGIS].[dbo].[vac_regVacNotificacao] JOIN  [SIGIS].[dbo].[vac_vacTratamento]  ON ([SIGIS].[dbo].[vac_regVacNotificacao].[Id_vacTratamento] = [SIGIS].[dbo].[vac_vacTratamento].[Id_vacTratamento]  ) '
treatmentNotifications +=
  ' join  [SIGIS].[dbo].[vac_Tratamento]  on ( [SIGIS].[dbo].[vac_Tratamento] .[Id_Tratamento] = [SIGIS].[dbo].[vac_vacTratamento].[Id_Tratamento] )'

treatmentNotifications +=
  ' join  [SIGIS].[dbo].[vac_tratPrevencao] on ([SIGIS].[dbo].[vac_tratPrevencao].[Id_tratPrevencao] =     [SIGIS].[dbo].[vac_Tratamento].[Id_tratVacina])'

treatmentNotifications +=
  ' join  [SIGIS].[dbo].[vac_tratVacina] on ([SIGIS].[dbo].[vac_tratVacina].[Id_tratVacina] =     [SIGIS].[dbo].[vac_Tratamento].[Id_tratVacina])'
treatmentNotifications +=
  'JOIN [vac_tratDose] ON  ([vac_tratDose].[Id_tratDose] = [SIGIS].[dbo].[vac_vacTratamento].[Id_tratDose] )'

treatmentNotifications +=
  ' join   [SIGIS].[dbo].[vac_userPostoVacinacao]  on  ([SIGIS].[dbo].[vac_regVacNotificacao].[Id_userPostoVacinacao] = [SIGIS].[dbo].[vac_userPostoVacinacao].[Id_userPostoVacinacao] ) where [SIGIS].[dbo].[vac_regVacNotificacao].[Id_regIndividual]=?'

//VACINNATION
let vaccinationNotifications =
  ' SELECT [SIGIS].[dbo].[vac_regVacinacao].[Id_regVacinacao] as vaccinationId ,[SIGIS].[dbo].[vac_regVacinacao].[Id_regIndividual] as personId, [Id_Sintomas] as symptoms,'
vaccinationNotifications +=
  ' [SIGIS].[dbo].[vac_regVacinacao].[Id_userPostoVacinacao] as userId,[SIGIS].[dbo].[vac_regVacNotificacao].[DataCad] as createdAt , [SIGIS].[dbo].[vac_Vacina].[Nome] as vaccine,'
vaccinationNotifications +=
  ' [SIGIS].[dbo].[vac_Vacina].[Fabricante] as manufacturer, [SIGIS].[dbo].[vac_DoseVacina].[Nome] as dose,  [SIGIS].[dbo].[vac_userPostoVacinacao].[Nome] as createdBy '
vaccinationNotifications += 'FROM [SIGIS].[dbo].[vac_regVacinacao] '
vaccinationNotifications +=
  ' join [SIGIS].[dbo].[vac_regVacNotificacao] on ([SIGIS].[dbo].[vac_regVacinacao].[Id_regVacinacao] =  [SIGIS].[dbo].[vac_regVacNotificacao].[Id_regVacinacao])'

vaccinationNotifications +=
  ' join  [SIGIS].[dbo].[vac_userPostoVacinacao] on ( [SIGIS].[dbo].[vac_userPostoVacinacao] . [Id_userPostoVacinacao]=[SIGIS].[dbo].[vac_regVacNotificacao].[Id_userPostoVacinacao])'
vaccinationNotifications +=
  ' join [SIGIS].[dbo].[vac_Vacina] on ( [SIGIS].[dbo].[vac_Vacina].[Id_Vacina]= [SIGIS].[dbo].[vac_regVacinacao].[Id_Vacina])'
vaccinationNotifications +=
  ' join [SIGIS].[dbo].[vac_DoseVacina] on ([SIGIS].[dbo].[vac_DoseVacina].[Id_DoseVacina]=[SIGIS].[dbo].[vac_regVacinacao].[Id_Dose]) where [SIGIS].[dbo].[vac_regVacinacao].[Id_regIndividual] = ? '

const constantQueries = {
  vaccinationMainTable,
  vaccinationFields,
  vaccinationSources,
  //Treatments
  treatmentsFields,
  treatmentMainTable,
  treatmentSources,
  //Vaccination
  treatmentNotifications,
  vaccinationNotifications,
}
export default constantQueries
