

SELECT TOP (1000) [SIGIS].[dbo].[vac_regIndividual] .[Id_regIndividual]

      ,[SIGIS].[dbo].[vac_regIndividual].[Nome] as name
      ,[Telefone] as phone
      ,[docNum] as docId
      ,[Codigo] as code
      ,[CodigoNum] as codeNum
      ,[NCartao] as cardNumber,

	  --Vacinação
	  [SIGIS].[dbo].[vac_vacTratamento].[DataCad],
	  [SIGIS].[dbo].[vac_tratVacina].[Nome] as vacina,
	  [SIGIS].[dbo].[vac_tratDose].Nome as dose,

	  --Posto Vacinacao
	   CASE
            WHEN   [TipoPosto] = 'PVAR'
               THEN  [NomePVAR]
			   WHEN  [TipoPosto] = 'EA'
			   THEN [NomeEA]
               ELSE [NomeEM]
       END as posto,

	[Id_provinciaEA]
	,[Id_provinciaEM]
	,[Id_provinciaPVAR],
	[SIGIS].[dbo].[Provincia].Nome as province,
	[SIGIS].[dbo].[Provincia].Id_Provincia



  FROM [SIGIS].[dbo].[vac_regIndividual]
  join [SIGIS].[dbo].[vac_vacTratamento] on ( [SIGIS].[dbo].[vac_regIndividual].[Id_regIndividual] =  [SIGIS].[dbo].[vac_vacTratamento].[Id_regIndividual] )
  join [SIGIS].[dbo].[vac_Tratamento] on ([SIGIS].[dbo].[vac_Tratamento].Id_Tratamento = [SIGIS].[dbo].[vac_vacTratamento].Id_Tratamento )

  join [SIGIS].[dbo].[vac_tratVacina] on ([SIGIS].[dbo].[vac_tratVacina].[Id_tratVacina] =  [SIGIS].[dbo].[vac_Tratamento].Id_tratVacina)
  join  [SIGIS].[dbo].[vac_tratDose] on ( [SIGIS].[dbo].[vac_tratDose].Id_tratDose=  [SIGIS].[dbo].[vac_vacTratamento].Id_tratDose)
  join   [SIGIS].[dbo].[vac_postoVacinacao] on ( [SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao] = [SIGIS].[dbo].[vac_vacTratamento].[Id_postoVacinacao]) 
  join [SIGIS].[dbo].[Provincia] 
  on ( [SIGIS].[dbo].[Provincia].[Id_Provincia] =    CASE WHEN   [TipoPosto] = 'PVAR' THEN  [Id_provinciaPVAR] WHEN  [TipoPosto] = 'EA'  THEN    [Id_provinciaEA]  ELSE [Id_provinciaEM] END   )





  
/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP (1000) [SIGIS].[dbo].[vac_regIndividual] .[Id_regIndividual]

      ,[SIGIS].[dbo].[vac_regIndividual].[Nome] as name
      ,[Telefone] as phone
      ,[docNum] as docId
      ,[Codigo] as code
      ,[CodigoNum] as codeNum
      ,[NCartao] as cardNumber,
	  --VACINA
	   [SIGIS].[dbo].[vac_Vacina].[Nome] as vaccine,
	   [SIGIS].[dbo].[vac_regVacinacao].[DataCad] as createdAt,
	   [SIGIS].[dbo].[vac_regVacinacao].[Status] as vaccinationType,
	   [numLote] as batch
      ,[Fabricante] as manufacturer
	  --DOSE
	  ,[SIGIS].[dbo].[vac_DoseVacina].[Nome] as dose,
	  --Provincia
	  [SIGIS].[dbo].[Provincia].[Nome] as province
	  ,
	  --Posto de Vacinação
	   [TipoPosto],
	  	CASE
            WHEN   [TipoPosto] = 'PVAR'
               THEN  [NomePVAR]
			   WHEN  [TipoPosto] = 'EA'
			   THEN [NomeEA]
               ELSE [NomeEM]
       END as posto,

	   [NomePVAR] as namePVAR
      ,[NomeEA] as nameEA
	  ,[NomeEM] as nameEM
    

  FROM [SIGIS].[dbo].[vac_regIndividual]  join [SIGIS].[dbo].[vac_regVacinacao] 
  on ([SIGIS].[dbo].[vac_regIndividual] .Id_regIndividual = [SIGIS].[dbo].[vac_regVacinacao].[Id_regIndividual] )
  join   [SIGIS].[dbo].[vac_Vacina]  on ([SIGIS].[dbo].[vac_Vacina].[Id_Vacina] = [dbo].[vac_regVacinacao].Id_Vacina )
  join   [SIGIS].[dbo].[vac_DoseVacina] on ([SIGIS].[dbo].[vac_DoseVacina].Id_DoseVacina = [dbo].[vac_regVacinacao].Id_Dose )
  join [SIGIS].[dbo].[Provincia]  on ( [SIGIS].[dbo].[Provincia].[Id_Provincia] = [SIGIS].[dbo].[vac_regVacinacao].[Id_Provincia] )
  join   [SIGIS].[dbo].[vac_postoVacinacao] on ( [SIGIS].[dbo].[vac_postoVacinacao].[Id_postoVacinacao] = [SIGIS].[dbo].[vac_regVacinacao].[Id_postoVacinacao]) 


  order by  [SIGIS].[dbo].[vac_regVacinacao].[DataCad] desc 