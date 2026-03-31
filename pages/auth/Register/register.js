/*
import { addUser } from "../../../services/user_services.js";
import { addPlayer } from "../../../services/specialist_services.js"; 

let selectedFile = null;

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (file && file.type.startsWith('image/')) {
    selectedFile = file;

    const preview = URL.createObjectURL(file);
    previewImg.src = preview;
    previewImg.style.display = "block";
    placeholderDiv.style.display = "none";
  } else {
    showFeedback("يرجى اختيار صورة صحيحة", true);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const password = document.getElementById('password').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  const ageVal = document.getElementById('age').value;
  const heightVal = document.getElementById('height').value;
  const weightVal = document.getElementById('weight').value;
  const dob = document.getElementById('dob').value;

  let profileUrl = "";

  if (selectedFile) {
    try {
      profileUrl = await convertToBase64(selectedFile);
    } catch (error) {
      console.error(error);
      return showFeedback("فشل رفع الصورة", true);
    }
  }

  if (fullName.length < 5 || fullName.split(' ').length < 2) {
    return showFeedback("الرجاء إدخال الاسم الكامل", true);
  }

  if (!isValidEmail(email)) {
    return showFeedback("البريد الإلكتروني غير صالح", true);
  }

  if (password.length < 6) {
    return showFeedback("كلمة المرور يجب أن تكون 6 أحرف أو أكثر", true);
  }

  if (password !== confirmPass) {
    return showFeedback("كلمتا المرور غير متطابقتين", true);
  }

  let ageNum = ageVal ? parseInt(ageVal) : 0;
  if (ageVal && (isNaN(ageNum) || ageNum <= 0)) {
    return showFeedback("العمر غير صحيح", true);
  }

  let heightNum = heightVal ? parseFloat(heightVal) : 0;
  let weightNum = weightVal ? parseFloat(weightVal) : 0;

  const selectedSportList = getSelectedSports();
  if (selectedSportList.length === 0) {
    return showFeedback("اختاري رياضة واحدة على الأقل", true);
  }

  const sportString = selectedSportList.join(", ");

  const newUserId = generateId();

  // ======================
  // 👤 USER OBJECT
  // ======================
  const userObj = new User({
    id: newUserId,
    name: fullName,
    email: email,
    password: password,
    phone: phone,
    imgPath: profileUrl, // ✅ Base64 هنا
    user_type: "player"
  });

  // ======================
  // 🏃 PLAYER OBJECT
  // ======================
  const playerObj = new Player({
    id: newUserId,
    age: ageNum,
    sport: sportString,
    height: heightNum,
    weight: weightNum
  });

  // ======================
  // 🚀 CALL SERVICES
  // ======================
  try {
    const userResult = await addUser(userObj);

    if (!userResult.success) {
      return showFeedback(userResult.message || "فشل إنشاء المستخدم", true);
    }

    const playerResult = await addPlayer(playerObj);

    if (!playerResult.success) {
      return showFeedback("تم إنشاء المستخدم لكن فشل إنشاء بيانات اللاعب", true);
    }

    // ======================
    // 🎉 SUCCESS
    // ======================
    showFeedback(
      `مبروك ${fullName.split(' ')[0]}! تم إنشاء حسابك بنجاح 🎉`
    );

    form.reset();
    selectedFile = null;

    previewImg.style.display = "none";
    placeholderDiv.style.display = "block";

  } catch (error) {
    console.error(error);
    showFeedback("حصل خطأ أثناء التسجيل", true);
  }
});
*/