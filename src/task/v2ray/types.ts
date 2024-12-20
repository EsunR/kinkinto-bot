export interface ITrafficValue<D> {
  date: D
  id: number
  rx: number
  tx: number
}

export interface IVnstatDate {
  day: number
  month: number
  year: number
}

export interface IVnstatTime {
  hour: number
  minute: number
}

export interface ITrafficValueDay extends ITrafficValue<IVnstatDate> {}

export interface ITrafficValueMonth
  extends ITrafficValue<Omit<IVnstatDate, "year">> {}

export interface ITrafficValueYear
  extends ITrafficValue<Pick<IVnstatDate, "year">> {}

export interface ITrafficValueTime extends ITrafficValue<IVnstatDate> {
  time: IVnstatTime
}

export interface IVnstatInterface {
  alias: string
  created: {
    date: IVnstatDate
  }
  name: string
  traffic: {
    day: ITrafficValueDay[]
    fiveminute: ITrafficValueTime[]
    hour: ITrafficValueTime[]
    month: ITrafficValueMonth[]
    top: ITrafficValueDay[]
    year: ITrafficValueYear[]
    total: {
      rx: number
      tx: number
    }
  }
  updated: {
    date: IVnstatDate
    time: IVnstatTime
  }
}

export interface IVnstatJson {
  interfaces: IVnstatInterface[]
}
