export class Specialist {
  constructor({
    id = " ",
    user_id = " ",
    qualification = " ",
    experience = 0,
    specialization = " ",
    clinic_address = " "
  } = {}) {
    this.id = id;
    this.user_id = user_id;
    this.qualification = qualification;
    this.experience = experience;
    this.specialization = specialization;
    this.clinic_address = clinic_address;
  }

  toJSON() {
    return {
     id: this.id,
     user_id: this.user_id,
     qualification: this.qualification,  
     experience: this.experience,
     specialization: this.specialization,
     clinic_address: this.clinic_address
    };
  }
}