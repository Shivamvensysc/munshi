export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  /** positive = customer owes you (Lene / to receive), negative = you owe them (Dene / to pay) */
  balance: number;
}

export interface Khata {
  id: string;
  name: string;
  customers: Customer[];
}

export interface Transaction {
  id: string;
  customerId: string;
  type: "gave" | "got";
  amount: number;
  note?: string;
  date: string;
}

export interface CrossEntry {
  id: string;
  toCustomerId: string;
  fromCustomerId: string;
  amount: number;
  note?: string;
  date: string;
}

export interface User {
  name: string;
  phone: string;
}
