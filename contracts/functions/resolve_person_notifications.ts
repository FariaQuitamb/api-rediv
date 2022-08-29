import moment from 'moment'

interface Covid {
  vaccinationId: number
  state: string
  personId: number
  symptoms: string
  userId: number
  createdAt: string
  vaccine: string
  manufacturer: string
  dose: string
  createdBy: string
}

interface Treatment {
  appliedTreatmentId: number
  state: string
  personId: number
  symptoms: string
  userId: number
  createdAt: string
  vaccine: string
  dose: string
  createdBy: string
}

interface Vaccine {
  id: number
  state: string
  type: string
  personId: number
  symptoms: string
  userId: number
  createdAt: string
  vaccine: string
  manufacturer: string
  dose: string
  createdBy: string
}

const resolvePersonNotifications = (covidVaccines: Covid[], treatemts: Treatment[]) => {
  let vaccines: Vaccine[] = []

  covidVaccines.map((vaccine) => {
    const auxVaccine: Vaccine = {
      id: vaccine.vaccinationId,
      state: vaccine.state,
      type: 'covid',
      personId: vaccine.personId,
      symptoms: vaccine.symptoms,
      userId: vaccine.userId,
      createdAt: vaccine.createdAt,
      vaccine: vaccine.vaccine,
      manufacturer: vaccine.manufacturer,
      dose: vaccine.dose,
      createdBy: vaccine.createdBy,
    }

    vaccines.push(auxVaccine)
  })

  treatemts.map((vaccine) => {
    const auxVaccine: Vaccine = {
      id: vaccine.appliedTreatmentId,
      state: vaccine.state,
      type: 'covid',
      personId: vaccine.personId,
      symptoms: vaccine.symptoms,
      userId: vaccine.userId,
      createdAt: vaccine.createdAt,
      vaccine: vaccine.vaccine,
      manufacturer: '',
      dose: vaccine.dose,
      createdBy: vaccine.createdBy,
    }

    vaccines.push(auxVaccine)
  })

  vaccines.sort((a, b) => (moment(a.createdAt).isBefore(moment(b.createdAt)) ? 1 : -1))

  return { vaccines }
}

export default resolvePersonNotifications
