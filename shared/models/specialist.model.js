export class Specialist {
  constructor({
    id= " ",
    qualification = " ",
    experience = 0,
    specialization = " ",
    clinic_address = " "
  } = {}) {
    this.id = id;
    this.qualification = qualification;
    this.experience = experience;
    this.specialization = specialization;
    this.clinic_address = clinic_address;
  }

  toJSON() {
    return {
     id: this.id,
     qualification: this.qualification,  
     experience: this.experience,
     specialization: this.specialization,
     clinic_address: this.clinic_address
    };
  }
}