interface Covid {
  personId: number
  name: string
  phone: string
  docId: string
  code: string
  codeNum: string
  cardNumber: string
  vaccine: string
  createdAt: string
  vaccinationType: string
  batch: string
  manufacturer: string
  dose: string
  province: string
  namePVAR: string
  nameEA: string
  nameEM: string
}

interface Treatment {
  personId: number
  name: string
  phone: string
  docId: string
  code: string
  codeNum: string
  cardNumber: string
  vaccine: string
  createdAt: string
  dose: string
  province: string
  namePVAR: string
  nameEA: string
  nameEM: string
}

interface Vaccine {
  vaccine: string
  createdAt: string
  vaccinationType: string
  batch: string
  manufacturer: string
  dose: string
  province: string
  vaccinationPost: string
}

interface Person {
  personId: number
  name: string
  phone: string
  docId: string
  code: string
  codeNum: string
  cardNumber: string
}

const personVaccines = (covidVaccines: Covid[], treatemts: Treatment[]) => {
  const hasCovidVaccines = covidVaccines.length > 0

  const person: Person = {
    personId: hasCovidVaccines ? covidVaccines[0].personId : treatemts[0].personId,
    name: hasCovidVaccines ? covidVaccines[0].name : treatemts[0].name,
    phone: hasCovidVaccines ? covidVaccines[0].phone : treatemts[0].phone,
    docId: hasCovidVaccines ? covidVaccines[0].docId : treatemts[0].docId,
    code: hasCovidVaccines ? covidVaccines[0].code : treatemts[0].code,
    codeNum: hasCovidVaccines ? covidVaccines[0].codeNum : treatemts[0].codeNum,
    cardNumber: hasCovidVaccines ? covidVaccines[0].cardNumber : treatemts[0].cardNumber,
  }

  let vaccines: Vaccine[] = []

  covidVaccines.map((vaccine) => {
    const auxVaccine: Vaccine = {
      vaccine: vaccine.vaccine,
      createdAt: vaccine.createdAt,
      vaccinationType: vaccine.vaccinationType,
      batch: vaccine.batch,
      manufacturer: vaccine.manufacturer,
      dose: vaccine.dose,
      province: vaccine.province,
      vaccinationPost: `${vaccine.nameEM} ${vaccine.nameEA} ${vaccine.namePVAR}`,
    }

    vaccines.push(auxVaccine)
  })

  treatemts.map((vaccine) => {
    const auxVaccine: Vaccine = {
      vaccine: vaccine.vaccine,
      createdAt: vaccine.createdAt,
      vaccinationType: '',
      batch: '',
      manufacturer: '',
      dose: vaccine.dose,
      province: vaccine.province,
      vaccinationPost: `${vaccine.nameEM} ${vaccine.nameEA} ${vaccine.namePVAR}`,
    }

    vaccines.push(auxVaccine)
  })

  console.log({ person, vaccines })
}

export default personVaccines
