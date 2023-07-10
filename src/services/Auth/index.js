// Local storage service.

const getAuthPayload = () => JSON.parse(localStorage.getItem("auth"));
const setAuthPayload = (auth) => localStorage.setItem("auth", JSON.stringify(auth));
const removeAuthPayload = () => localStorage.removeItem("auth");

const AuthService = {
  getAuthPayload,
  setAuthPayload,
  removeAuthPayload,
};

export default AuthService;
