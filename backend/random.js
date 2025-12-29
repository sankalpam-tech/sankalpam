import bcrypt from "bcryptjs";

const hashPassword = async () => {
  const hash = await bcrypt.hash("sankalpam123", 10);
  console.log(hash);
};

hashPassword();
