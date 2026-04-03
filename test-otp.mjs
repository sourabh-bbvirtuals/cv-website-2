import axios from 'axios';

axios.post('https://staging-vendure.bbvirtuals.tech/auth/send-otp?vendure-token=bbv-bb-virtual-commerce-mn1ydkov', {
  phone: '+919416583303'
}).then(r => {
  console.log("Success", r.data);
}).catch(e => {
  console.log("Error status:", e.response?.status);
  console.log("Error data:", e.response?.data);
});
