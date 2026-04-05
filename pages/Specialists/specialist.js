import { getAllDoctors } from '../../../services/specialist_services.js';
  
  function createDoctorCard(doctor) {

    const imageUrl = doctor.imgPath && doctor.imgPath !== "" 
      ? doctor.imgPath 
      : '../../../assets/images/Doctor.png';
    
    return `
      <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
        <div class="doctor-card">
          <div class="doctor-image">
            <img src="${imageUrl}" alt="Dr. ${doctor.name}" class="img-fluid">
            <div class="doctor-overlay">
              <div class="social-links">
                <a href="mailto:${doctor.email}"><i class="bi bi-envelope"></i></a>
                <a href="tel:${doctor.phone}"><i class="bi bi-phone"></i></a>
              </div>
            </div>
          </div>
          <div class="doctor-content">
            <h4>دكتور ${doctor.name}</h4>
            <span class="specialty">${doctor.specialization}</span>
            <p>${doctor.qualification}</p>
            <div class="doctor-meta">
              <div class="experience">
                <i class="bi bi-award"></i>
                <span>${doctor.experience}+ سنوات الخبرة</span>
              </div>
              <div class="department">
                <i class="bi bi-geo-alt"></i>
                <span>${doctor.clinic_address}</span>
              </div>
            </div>
            <a href="../Player/add_appointment/add_appointment.html?doctorId=${doctor.id}" class="btn-appointment">احجز موعد</a>
          </div>
        </div>
      </div>
    `;
  }
  
  document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('doctorsContainer');
    
    if (!container) return;
    
    container.innerHTML = '<div class="text-center"><div class="spinner-border"></div><p>Loading doctors...</p></div>';
    
    try {
      const doctors = await getAllDoctors();

    console.log('Number of doctors:', doctors.length);
    console.log('Doctors data:', doctors);
      
      if (doctors.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No doctors found.</p></div>';
        return;
      }
      
      const doctorsHTML = doctors.map(doctor => createDoctorCard(doctor)).join('');
      container.innerHTML = doctorsHTML;
      
    } catch (error) {
      console.error(error);
      container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error loading doctors.</p></div>';
    }
  });
