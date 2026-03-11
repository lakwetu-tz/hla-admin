import axios from 'axios';
export const getGpsData = async () => {
  try {
    const res = await axios.get('https://api.example.com/selcome');
    return res.data;
  } catch (error) {
    // Retry logic
  }
};